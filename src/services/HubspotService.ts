
import type { Project } from './mockHubspotService';

const PROXY_URL = 'http://localhost:3001/api/hubspot';

const analyzeSentiment = (text: string): number => {
    const negativeWords = ['angry', 'mad', 'frustrated', 'unacceptable', 'disappointed', 'fail', 'urgent', 'broken', 'missed', 'late'];
    const positiveWords = ['happy', 'great', 'excited', 'thanks', 'good', 'success', 'love', 'approve'];

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
        const url = `${PROXY_URL}/deals?properties=dealname,amount,dealstage,closedate,hubspot_owner_id,notes_last_updated,description&limit=10`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Proxy error: ${response.statusText}`);
        }

        const data = await response.json();
        const projects: Project[] = [];

        for (const deal of data.results) {
            const dealId = deal.id;
            const props = deal.properties;

            const description = props.description || "";
            const sentiment = analyzeSentiment(description);

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
                emails: description ? [{
                    id: `e-${dealId}`,
                    subject: 'Deal Description / Note',
                    body: description,
                    from: 'HubSpot',
                    date: props.notes_last_updated || new Date().toISOString(),
                    sentimentScore: sentiment
                }] : [],
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
