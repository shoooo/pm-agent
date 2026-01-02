
import type { Project, Email } from './mockHubspotService';

const PROXY_URL = 'http://localhost:3001/api/hubspot';

export const getRealProjects = async (): Promise<Project[]> => {
    try {
        const dealsUrl = `${PROXY_URL}/deals?properties=dealname,amount,dealstage,closedate,hubspot_owner_id,notes_last_updated&limit=10`;
        const dealsResponse = await fetch(dealsUrl);

        if (!dealsResponse.ok) {
            throw new Error(`Proxy error: ${dealsResponse.statusText}`);
        }

        const dealsData = await dealsResponse.json();
        const projects: Project[] = [];

        for (const deal of dealsData.results) {
            const dealId = deal.id;
            const props = deal.properties;

            // Fetch associated communications for this deal
            let fetchedEmails: Email[] = [];
            try {
                const commsUrl = `${PROXY_URL}/deals/${dealId}/communications`;
                const commsResponse = await fetch(commsUrl);
                if (commsResponse.ok) {
                    const commsData = await commsResponse.json();
                    fetchedEmails = commsData.results.map((comm: any) => ({
                        id: comm.id,
                        subject: comm.properties.hs_communication_subject || 'Communication',
                        body: (comm.properties.hs_communication_body || '').replace(/<[^>]*>?/gm, ''), // Strip HTML
                        from: 'Client',
                        date: comm.properties.hs_timestamp,
                        sentimentScore: 50 // Default, will be updated by AI
                    })).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
                }
            } catch (err) {
                console.error(`Error fetching comms for deal ${dealId}:`, err);
            }

            // --- LLM AI Analysis ---
            let aiAnalysis = { sentimentScore: 50, atRisk: false, summary: '' };
            if (fetchedEmails.length > 0) {
                try {
                    const analyzeUrl = `http://localhost:3001/api/analyze`;
                    const analyzeResponse = await fetch(analyzeUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            messages: fetchedEmails.slice(0, 3), // Analyze latest 3
                            projectName: props.dealname,
                            deadline: props.closedate
                        })
                    });
                    if (analyzeResponse.ok) {
                        aiAnalysis = await analyzeResponse.json();
                    }
                } catch (err) {
                    console.error("AI Analysis failed:", err);
                }
            }

            const project: Project = {
                id: dealId,
                name: props.dealname || 'Untitled Project',
                health: aiAnalysis.atRisk ? 'At Risk' : 'On Track',
                nextMilestone: {
                    name: 'Close Date',
                    dueDate: props.closedate ? new Date(props.closedate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                    status: 'Pending'
                },
                tasks: [],
                lastActivityDate: props.notes_last_updated || new Date().toISOString(),
                owner: props.hubspot_owner_id || 'Unassigned',
                emails: fetchedEmails.map(e => ({ ...e, sentimentScore: aiAnalysis.sentimentScore })),
                dismissedAlerts: [],
                activityLog: aiAnalysis.summary ? [{
                    id: `ai-${Date.now()}`,
                    date: new Date().toISOString().split('T')[0],
                    type: 'Note',
                    description: `AI Insight: ${aiAnalysis.summary}`,
                    user: 'AnyGift AI'
                }] : []
            };

            projects.push(project);
        }

        // --- Inject UI Test Data for Verification ---
        const testProjects: Project[] = [
            {
                id: 'test-red',
                name: '[TEST] High Risk Project',
                health: 'At Risk',
                nextMilestone: { name: 'Final Review', dueDate: '2023-12-01', status: 'Pending' },
                tasks: [],
                lastActivityDate: new Date().toISOString(),
                owner: 'AnyGift AI',
                emails: [{
                    id: 'e-test-1',
                    subject: 'Urgent: Project Stalled',
                    body: "We've been waiting for two weeks and no one has replied. This is unacceptable.",
                    from: 'Angry Client',
                    date: new Date().toISOString(),
                    sentimentScore: 10
                }],
                dismissedAlerts: [],
                activityLog: [{
                    id: 'log-test-1',
                    date: new Date().toISOString().split('T')[0],
                    type: 'Note',
                    description: 'AI Insight: Client is extremely frustrated due to lack of response and missed deadline.',
                    user: 'AnyGift AI'
                }]
            },
            {
                id: 'test-yellow',
                name: '[TEST] Delayed Project',
                health: 'Delayed',
                nextMilestone: { name: 'Kickoff', dueDate: '2023-12-25', status: 'Pending' },
                tasks: [],
                lastActivityDate: new Date().toISOString(),
                owner: 'AnyGift AI',
                emails: [{
                    id: 'e-test-2',
                    subject: 'Status update',
                    body: "We are a bit behind on our side, but we'll try to catch up next week.",
                    from: 'Client',
                    date: new Date().toISOString(),
                    sentimentScore: 45
                }],
                dismissedAlerts: [],
                activityLog: [{
                    id: 'log-test-2',
                    date: new Date().toISOString().split('T')[0],
                    type: 'Note',
                    description: 'AI Insight: Project is slightly delayed, but client tone remains collaborative.',
                    user: 'AnyGift AI'
                }]
            }
        ];

        return [...testProjects, ...projects];

    } catch (error) {
        console.error("HubSpot Fetch Error:", error);
        return [];
    }
};

export const performRealAction = async (projectId: string, actionType: string, params: { alertId?: string }): Promise<boolean> => {
    console.log(`[HubSpot Real] Action: ${actionType} on ${projectId}`, params);
    return true;
};
