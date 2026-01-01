
export interface Email {
    id: string;
    subject: string;
    body: string;
    from: string;
    date: string;
    sentimentScore: number;
}

export interface Task {
    id: string;
    name: string;
    assignee: 'Client' | 'Us';
    dueDate: string;
    status: 'Pending' | 'Done';
}

export interface Milestone {
    name: string;
    dueDate: string;
    status: 'Pending' | 'Completed';
}

export interface ActivityLog {
    id: string;
    date: string;
    type: 'Email' | 'Milestone' | 'Alert' | 'Note';
    description: string;
    user: string;
}

export interface Project {
    id: string;
    name: string;
    health: 'On Track' | 'At Risk' | 'Delayed';
    nextMilestone: Milestone;
    tasks: Task[];
    lastActivityDate: string;
    owner: string;
    emails: Email[];
    dismissedAlerts: string[]; // List of Alert IDs
    activityLog: ActivityLog[];
}

export const mockProjects: Project[] = [
    {
        id: '1',
        name: 'Acme Corp Onboarding',
        health: 'On Track',
        nextMilestone: { name: 'Kickoff Meeting', dueDate: '2024-03-01', status: 'Pending' },
        tasks: [
            { id: 't1', name: 'Submit Intake Form', assignee: 'Client', dueDate: '2024-02-28', status: 'Pending' },
            { id: 't2', name: 'Prepare Slide Deck', assignee: 'Us', dueDate: '2024-02-29', status: 'Pending' }
        ],
        lastActivityDate: '2024-02-25',
        owner: 'Taro Yamada',
        emails: [],
        dismissedAlerts: [],
        activityLog: [
            { id: 'l1', date: '2024-02-25', type: 'Note', description: 'Intake form sent to client.', user: 'Taro Yamada' }
        ]
    },
    {
        id: '2',
        name: 'Global Tech Implementation',
        health: 'At Risk',
        nextMilestone: { name: 'API Integration', dueDate: '2024-02-20', status: 'Pending' }, // Overdue
        tasks: [
            { id: 't3', name: 'Provide API Keys', assignee: 'Client', dueDate: '2024-02-18', status: 'Pending' } // Blocker
        ],
        lastActivityDate: '2024-02-15',
        owner: 'Hanako Suzuki',
        emails: [
            {
                id: 'e2',
                subject: 'API Keys delay',
                body: 'We are struggling to get the keys from the security team.',
                from: 'dev@globaltech.com',
                date: '2024-02-19T10:00:00Z',
                sentimentScore: 30
            }
        ],
        dismissedAlerts: [],
        activityLog: [
            { id: 'l2', date: '2024-02-19', type: 'Email', description: 'Received email re: API Keys delay', user: 'Client' },
            { id: 'l3', date: '2024-02-15', type: 'Milestone', description: 'API Integration milestone set.', user: 'Hanako Suzuki' }
        ]
    },
    {
        id: '3',
        name: 'StartUp Inc Pilot',
        health: 'Delayed',
        nextMilestone: { name: 'User Training', dueDate: '2024-02-10', status: 'Pending' },
        tasks: [],
        lastActivityDate: '2024-01-20',
        owner: 'Taro Yamada',
        emails: [],
        dismissedAlerts: [],
        activityLog: []
    },
    {
        id: '4',
        name: 'MegaCorp Expansion',
        health: 'At Risk', // Initial state, logic will confirm
        nextMilestone: { name: 'Go Live', dueDate: '2024-02-15', status: 'Pending' },
        tasks: [],
        lastActivityDate: '2024-02-18',
        owner: 'Hanako Suzuki',
        emails: [
            {
                id: 'e3',
                subject: 'URGENT: Broken promises',
                body: 'This is unacceptable. We missed the go-live and nobody told us why.',
                from: 'vp@megacorp.com',
                date: '2024-02-18T09:00:00Z',
                sentimentScore: 20 // Major negative sentiment
            }
        ],
        dismissedAlerts: [],
        activityLog: []
    }
];

export const getProjects = async (): Promise<Project[]> => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(mockProjects), 500);
    });
};

export const performAction = async (projectId: string, actionType: string, params: { alertId?: string }): Promise<boolean> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const project = mockProjects.find(p => p.id === projectId);
            if (project) {
                // Update last activity
                project.lastActivityDate = new Date().toISOString().split('T')[0];

                if (actionType === 'dismiss' && params.alertId) {
                    project.dismissedAlerts.push(params.alertId);
                    project.activityLog.unshift({
                        id: `l-${Date.now()}`,
                        date: new Date().toISOString().split('T')[0],
                        type: 'Alert',
                        description: 'Dismissed alert',
                        user: 'Manager'
                    });
                }

                resolve(true);
            } else {
                resolve(false);
            }
        }, 300); // Reduced latency for faster UI feel
    });
};
