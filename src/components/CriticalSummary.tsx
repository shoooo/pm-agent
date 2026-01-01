import React from 'react';
import { AlertTriangle, Clock, ShieldAlert } from 'lucide-react';
import type { Alert } from '../services/analysisEngine';
import type { Project } from '../services/mockHubspotService';

interface Props {
    alerts: Alert[];
    projects: Project[];
}

export const CriticalSummary: React.FC<Props> = ({ alerts, projects }) => {
    const highRiskCount = alerts.filter(a => a.severity === 'High').length;
    const blockerCount = alerts.filter(a => a.type === 'Blocker').length;
    const overdueCount = projects.filter(p => {
        return p.nextMilestone.status === 'Pending' && new Date(p.nextMilestone.dueDate) < new Date('2024-02-21');
    }).length;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className={`p-4 rounded-xl border flex items-center gap-4 ${highRiskCount > 0 ? 'bg-red-50 border-red-100 text-red-900' : 'bg-white border-gray-200'}`}>
                <div className={`p-3 rounded-full ${highRiskCount > 0 ? 'bg-red-100' : 'bg-gray-100'}`}>
                    <ShieldAlert size={24} className={highRiskCount > 0 ? 'text-red-600' : 'text-gray-400'} />
                </div>
                <div>
                    <h3 className="text-2xl font-bold">{highRiskCount}</h3>
                    <p className="text-sm font-medium opacity-80">High Risk Projects</p>
                </div>
            </div>

            <div className={`p-4 rounded-xl border flex items-center gap-4 ${blockerCount > 0 ? 'bg-amber-50 border-amber-100 text-amber-900' : 'bg-white border-gray-200'}`}>
                <div className={`p-3 rounded-full ${blockerCount > 0 ? 'bg-amber-100' : 'bg-gray-100'}`}>
                    <AlertTriangle size={24} className={blockerCount > 0 ? 'text-amber-600' : 'text-gray-400'} />
                </div>
                <div>
                    <h3 className="text-2xl font-bold">{blockerCount}</h3>
                    <p className="text-sm font-medium opacity-80">Client Blockers</p>
                </div>
            </div>

            <div className={`p-4 rounded-xl border flex items-center gap-4 ${overdueCount > 0 ? 'bg-orange-50 border-orange-100 text-orange-900' : 'bg-white border-gray-200'}`}>
                <div className={`p-3 rounded-full ${overdueCount > 0 ? 'bg-orange-100' : 'bg-gray-100'}`}>
                    <Clock size={24} className={overdueCount > 0 ? 'text-orange-600' : 'text-gray-400'} />
                </div>
                <div>
                    <h3 className="text-2xl font-bold">{overdueCount}</h3>
                    <p className="text-sm font-medium opacity-80">Missed Milestones</p>
                </div>
            </div>
        </div>
    );
};
