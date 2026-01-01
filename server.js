
const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;

if (!HUBSPOT_ACCESS_TOKEN) {
    console.error('ERROR: HUBSPOT_ACCESS_TOKEN is not defined in .env');
    process.exit(1);
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

app.listen(PORT, () => {
    console.log(`Backend proxy server running on http://localhost:${PORT}`);
});
