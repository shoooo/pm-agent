
import type { Project, Email } from './mockHubspotService';

const PROXY_URL = 'http://localhost:3001/api/hubspot';

const analyzeSentiment = (text: string): number => {
    const negativeWords = ['angry', 'mad', 'frustrated', 'unacceptable', 'disappointed', 'fail', 'urgent', 'broken', 'missed', 'late', 'delay', 'waiting'];
    const positiveWords = ['happy', 'great', 'excited', 'thanks', 'good', 'success', 'love', 'approve', 'done', 'finished'];

    const lowerText = text.toLowerCase();
    let score = 50; // Start Neutral

    negativeWords.forEach(word => {
        if (lowerText.includes(word)) score -= 15;
    });

    positiveWords.forEach(word => {
        if (lowerText.includes(word)) score += 10;
    });

    return Math.max(0, Math.min(100, score));
};

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
                        sentimentScore: analyzeSentiment(comm.properties.hs_communication_body || '')
                    })).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
                }
            } catch (err) {
                console.error(`Error fetching comms for deal ${dealId}:`, err);
            }

            const project: Project = {
                id: dealId,
                name: props.dealname || 'Untitled Project',
                health: 'On Track',
                nextMilestone: {
                    name: 'Close Date',
                    dueDate: props.closedate ? new Date(props.closedate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                    status: 'Pending'
                },
                tasks: [],
                lastActivityDate: props.notes_last_updated || new Date().toISOString(),
                owner: props.hubspot_owner_id || 'Unassigned',
                emails: fetchedEmails,
                dismissedAlerts: [],
                activityLog: []
            };

            projects.push(project);
        }

        return projects;

    } catch (error) {
        console.error("HubSpot Fetch Error:", error);
        return [];
    }
};

export const performRealAction = async (projectId: string, actionType: string, params: { alertId?: string }): Promise<boolean> => {
    console.log(`[HubSpot Real] Action: ${actionType} on ${projectId}`, params);
    return true;
};
