
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

app.use(cors());
app.use(express.json());

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, 'dist')));

const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;

if (!HUBSPOT_ACCESS_TOKEN) {
    console.error('ERROR: HUBSPOT_ACCESS_TOKEN is not defined in environment variables');
}

// Proxy endpoint for HubSpot - Deals
app.get('/api/hubspot/deals', async (req, res) => {
    try {
        const response = await axios.get('https://api.hubapi.com/crm/v3/objects/deals', {
            params: req.query,
            headers: {
                Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
            },
        });
        res.json(response.data);
    } catch (error) {
        console.error('HubSpot Deals API Error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal Server Error' });
    }
});

// Proxy endpoint for HubSpot - Get Engagements (Emails/Notes) for a Deal
app.get('/api/hubspot/deals/:id/communications', async (req, res) => {
    try {
        const dealId = req.params.id;

        // 1. Get associated communication IDs (v4 API)
        const associationsResponse = await axios.get(`https://api.hubapi.com/crm/v4/objects/deal/${dealId}/associations/communications`, {
            headers: { Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}` }
        });

        const commIds = associationsResponse.data.results.map(r => r.toObjectId);

        if (commIds.length === 0) {
            return res.json({ results: [] });
        }

        // 2. Fetch the actual content of those communications (Batch Read)
        const detailsResponse = await axios.post('https://api.hubapi.com/crm/v3/objects/communications/batch/read', {
            properties: ['hs_communication_body', 'hs_communication_subject', 'hs_timestamp'],
            inputs: commIds.map(id => ({ id }))
        }, {
            headers: { Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`, 'Content-Type': 'application/json' }
        });

        res.json(detailsResponse.data);
    } catch (error) {
        console.error('HubSpot Communications API Error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal Server Error' });
    }
});

// Proxy endpoint for AI Analysis via Gemini
app.post('/api/analyze', async (req, res) => {
    try {
        const { messages, projectName, deadline } = req.body;

        if (!messages || messages.length === 0) {
            return res.json({ sentimentScore: 50, atRisk: false, riskCategory: 'None', summary: "No recent communications.", trend: 'Stable' });
        }

        const prompt = `
            Analyze the following communications for an onboarding project called "${projectName}".
            The current project deadline is ${deadline}.
            
            Communications (Newest first):
            ${messages.map(m => `Date: ${m.date}\nBody: ${m.body}`).join('\n---\n')}
            
            Determine:
            1. sentimentScore: (0 to 100, where 0 is extremely angry/frustrated and 100 is extremely happy).
            2. atRisk: (true/false) based on blockers or missed deadlines.
            3. riskCategory: Choose one: 'Communication', 'Technical', 'Timeline', or 'None'.
            4. summary: A 1-sentence summary of the current health or primary blocker in Japanese.
            5. trend: Based on these messages, is the situation 'Improving', 'Stable', or 'Declining'?
            
            Return ONLY a valid JSON object.
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Extract JSON from response (handle potential markdown formatting)
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        const analysis = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);

        res.json(analysis);
    } catch (error) {
        console.error('Gemini API Error:', error.message);
        res.status(500).json({ sentimentScore: 50, atRisk: false, summary: "Analysis failed." });
    }
});

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
