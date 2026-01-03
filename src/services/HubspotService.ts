
import type { Project, Email } from './mockHubspotService';

const PROXY_URL = 'http://localhost:3001/api/hubspot';

// Rich demo data for when HubSpot is not configured
const getDemoProjects = (): Project[] => {
    return [
        {
            id: 'demo-1',
            name: '[DEMO] Acme Corp オンボーディング',
            health: '順調',
            nextMilestone: { name: 'キックオフミーティング', dueDate: '2026-01-15', status: 'Pending' },
            tasks: [
                { id: 't1', name: 'インテークフォーム提出', assignee: 'Client', dueDate: '2026-01-10', status: 'Pending' },
                { id: 't2', name: 'プレゼン資料準備', assignee: 'Us', dueDate: '2026-01-12', status: 'Pending' }
            ],
            lastActivityDate: new Date().toISOString(),
            owner: 'Sarah',
            emails: [{
                id: 'e-demo-1',
                subject: 'Re: 次のステップについて',
                body: 'ありがとうございます。来週のミーティングを楽しみにしています。',
                from: 'client@acme.com',
                date: new Date(Date.now() - 86400000).toISOString(),
                sentimentScore: 75
            }],
            dismissedAlerts: [],
            activityLog: [{
                id: 'log-demo-1',
                date: new Date().toISOString().split('T')[0],
                type: 'Note',
                description: 'AI Insight: 順調に進行中。クライアントは協力的で前向きです。 (Category: None, Trend: Stable)',
                user: 'PM Agent AI'
            }],
            riskCategory: 'None',
            trend: 'Stable'
        },
        {
            id: 'demo-2',
            name: '[DEMO] GlobalTech 統合プロジェクト',
            health: '要注意',
            nextMilestone: { name: 'API連携完了', dueDate: '2026-01-05', status: 'Pending' },
            tasks: [
                { id: 't3', name: 'APIキー提供', assignee: 'Client', dueDate: '2025-12-28', status: 'Pending' }
            ],
            lastActivityDate: new Date(Date.now() - 172800000).toISOString(),
            owner: 'James',
            emails: [{
                id: 'e-demo-2',
                subject: 'APIキーの遅延について',
                body: 'セキュリティチームからキーを取得するのに苦労しています。もう少し時間がかかりそうです。',
                from: 'dev@globaltech.com',
                date: new Date(Date.now() - 172800000).toISOString(),
                sentimentScore: 35
            }],
            dismissedAlerts: [],
            activityLog: [{
                id: 'log-demo-2',
                date: new Date().toISOString().split('T')[0],
                type: 'Note',
                description: 'AI Insight: 技術的なブロッカーが発生。クライアント側のセキュリティ承認待ち。 (Category: Technical, Trend: Declining)',
                user: 'PM Agent AI'
            }],
            riskCategory: 'Technical',
            trend: 'Declining'
        },
        {
            id: 'demo-3',
            name: '[DEMO] StartupX パイロットプログラム',
            health: '遅延',
            nextMilestone: { name: 'ユーザートレーニング', dueDate: '2025-12-20', status: 'Pending' },
            tasks: [],
            lastActivityDate: new Date(Date.now() - 604800000).toISOString(),
            owner: 'Sarah',
            emails: [{
                id: 'e-demo-3',
                subject: 'トレーニング日程の調整',
                body: '年末で皆忙しいので、年明けに延期できますか？',
                from: 'pm@startupx.io',
                date: new Date(Date.now() - 604800000).toISOString(),
                sentimentScore: 50
            }],
            dismissedAlerts: [],
            activityLog: [{
                id: 'log-demo-3',
                date: new Date().toISOString().split('T')[0],
                type: 'Note',
                description: 'AI Insight: スケジュール調整が必要。クライアントは協力的だが、タイムライン遅延中。 (Category: Timeline, Trend: Stable)',
                user: 'PM Agent AI'
            }],
            riskCategory: 'Timeline',
            trend: 'Stable'
        },
        {
            id: 'demo-4',
            name: '[DEMO] MegaCorp エンタープライズ展開',
            health: '要注意',
            nextMilestone: { name: '本番稼働', dueDate: '2025-12-31', status: 'Pending' },
            tasks: [],
            lastActivityDate: new Date(Date.now() - 259200000).toISOString(),
            owner: 'James',
            emails: [{
                id: 'e-demo-4',
                subject: '緊急: 約束が守られていない',
                body: '本番稼働を逃し、なぜなのか誰も教えてくれません。これは受け入れられません。',
                from: 'vp@megacorp.com',
                date: new Date(Date.now() - 259200000).toISOString(),
                sentimentScore: 15
            }],
            dismissedAlerts: [],
            activityLog: [{
                id: 'log-demo-4',
                date: new Date().toISOString().split('T')[0],
                type: 'Note',
                description: 'AI Insight: 重大なエスカレーション。期限超過とコミュニケーション不足によりクライアントが非常に不満。 (Category: Communication, Trend: Declining)',
                user: 'PM Agent AI'
            }],
            riskCategory: 'Communication',
            trend: 'Declining'
        },
        {
            id: 'demo-5',
            name: '[DEMO] TechVentures クイック導入',
            health: '順調',
            nextMilestone: { name: '初期設定完了', dueDate: '2026-01-20', status: 'Pending' },
            tasks: [
                { id: 't4', name: 'アカウント設定', assignee: 'Us', dueDate: '2026-01-08', status: 'Pending' }
            ],
            lastActivityDate: new Date(Date.now() - 43200000).toISOString(),
            owner: 'Sarah',
            emails: [{
                id: 'e-demo-5',
                subject: 'スムーズなスタート！',
                body: 'チームの対応が素晴らしいです。すべてが期待通りに進んでいます。',
                from: 'cto@techventures.com',
                date: new Date(Date.now() - 43200000).toISOString(),
                sentimentScore: 90
            }],
            dismissedAlerts: [],
            activityLog: [{
                id: 'log-demo-5',
                date: new Date().toISOString().split('T')[0],
                type: 'Note',
                description: 'AI Insight: 非常に良好な進捗。クライアントは満足しており、チームワークが優れている。 (Category: None, Trend: Improving)',
                user: 'PM Agent AI'
            }],
            riskCategory: 'None',
            trend: 'Improving'
        }
    ];
};

export const getRealProjects = async (): Promise<Project[]> => {
    try {
        const dealsUrl = `${PROXY_URL}/deals?properties=dealname,amount,dealstage,closedate,hubspot_owner_id,notes_last_updated&limit=10`;
        const dealsResponse = await fetch(dealsUrl);

        if (!dealsResponse.ok) {
            console.warn('HubSpot API not available, using demo data');
            return getDemoProjects();
        }

        const dealsData = await dealsResponse.json();

        // If no deals found, return demo data
        if (!dealsData.results || dealsData.results.length === 0) {
            console.info('No HubSpot deals found, using demo data');
            return getDemoProjects();
        }

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
            let aiAnalysis = { sentimentScore: 50, atRisk: false, riskCategory: 'None', summary: '', trend: 'Stable' };
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
                health: aiAnalysis.atRisk ? '要注意' : '順調',
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
                    description: `AI Insight: ${aiAnalysis.summary} (Category: ${aiAnalysis.riskCategory}, Trend: ${aiAnalysis.trend})`,
                    user: 'PM Agent AI'
                }] : [],
                riskCategory: aiAnalysis.riskCategory,
                trend: aiAnalysis.trend as any
            };

            projects.push(project);
        }

        return projects;

    } catch (error) {
        console.error("HubSpot Fetch Error:", error);
        console.info("Falling back to demo data");
        return getDemoProjects();
    }
};

export const performRealAction = async (projectId: string, actionType: string, params: { alertId?: string }): Promise<boolean> => {
    console.log(`[HubSpot Real] Action: ${actionType} on ${projectId}`, params);
    return true;
};
