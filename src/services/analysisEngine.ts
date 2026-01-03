
import type { Project } from './mockHubspotService';

export interface Alert {
    id: string;
    projectId: string;
    type: 'Risk' | 'Opportunity' | 'Stalled' | 'Blocker';
    severity: 'High' | 'Medium' | 'Low';
    message: string;
    suggestedAction: string;
}

export const analyzeProject = (project: Project): Alert[] => {
    const alerts: Alert[] = [];
    const today = new Date('2024-02-21'); // Simulate "Today"

    // 1. Milestone Deadline & Sentiment Risk
    const milestoneDate = new Date(project.nextMilestone.dueDate);
    if (project.nextMilestone.status === 'Pending') {
        const isOverdue = milestoneDate < today;
        const lastEmail = project.emails[0];
        const isNegativeSentiment = lastEmail && lastEmail.sentimentScore < 40;

        if (isOverdue) {
            if (isNegativeSentiment) {
                // RED RISK: Overdue + Angry Client
                project.health = '要注意'; // Side-effect: Updating project health in place for UI
                alerts.push({
                    id: `milestone-critical-${project.id}`,
                    projectId: project.id,
                    type: 'Risk',
                    severity: 'High',
                    message: `CRITICAL: Milestone overdue AND client frustration detected.`,
                    suggestedAction: 'Urgent: Call client to de-escalate.',
                });
            } else {
                // YELLOW RISK: Just Overdue
                project.health = '遅延';
                alerts.push({
                    id: `milestone-overdue-${project.id}`,
                    projectId: project.id,
                    type: 'Risk',
                    severity: 'Medium',
                    message: `Milestone "${project.nextMilestone.name}" is overdue.`,
                    suggestedAction: 'Reschedule milestone.',
                });
            }
        } else {
            // Upcoming milestones logic (unchanged)
            const daysToMilestone = Math.ceil((milestoneDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            if (daysToMilestone <= 3 && daysToMilestone >= 0) {
                alerts.push({
                    id: `milestone-soon-${project.id}`,
                    projectId: project.id,
                    type: 'Risk',
                    severity: 'Low', // Downgraded to Low as it's just a heads up
                    message: `Milestone "${project.nextMilestone.name}" due in ${daysToMilestone} days.`,
                    suggestedAction: 'Send reminder.',
                });
            }
        }
    }

    // 2. Client Blocker
    const clientBlocker = project.tasks.find(t => t.assignee === 'Client' && t.status === 'Pending' && new Date(t.dueDate) < today);
    if (clientBlocker) {
        alerts.push({
            id: `client-blocker-${project.id}`,
            projectId: project.id,
            type: 'Blocker',
            severity: 'High',
            message: `Client overdue on "${clientBlocker.name}".`,
            suggestedAction: 'Review blocker and nudge client.',
        });
    }

    // 3. Stalled Project
    const lastActive = new Date(project.lastActivityDate);
    const diffTime = Math.abs(today.getTime() - lastActive.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 7 && project.health !== '順調') {
        alerts.push({
            id: `stalled-${project.id}`,
            projectId: project.id,
            type: 'Stalled',
            severity: 'Medium',
            message: `No activity for ${diffDays} days on likely stalled project.`,
            suggestedAction: 'Send a "checking in" email.',
        });
    }

    return alerts;
};

export const runAnalysis = (projects: Project[]): Alert[] => {
    return projects.flatMap(analyzeProject);
};
