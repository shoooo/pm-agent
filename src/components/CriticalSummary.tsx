import React from 'react';
import { AlertTriangle, Clock, ShieldAlert } from 'lucide-react';
import type { Alert } from '../services/analysisEngine';
import type { Project } from '../services/mockHubspotService';

interface Props {
    alerts: Alert[];
    projects: Project[];
    onFilterChange: (status: string) => void;
    activeFilter: string;
}

export const CriticalSummary: React.FC<Props> = ({ alerts, projects, onFilterChange, activeFilter }) => {
    const highRiskCount = alerts.filter(a => a.severity === 'High').length;
    const blockerCount = alerts.filter(a => a.type === 'Blocker').length;
    const overdueCount = projects.filter(p => {
        return p.nextMilestone.status === 'Pending' && new Date(p.nextMilestone.dueDate) < new Date('2024-02-21');
    }).length;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <button
                onClick={() => onFilterChange('要注意')}
                className={`text-left transition-all p-4 rounded-xl border flex items-center gap-4 ${activeFilter === '要注意'
                    ? 'ring-2 ring-red-500 bg-red-50 border-red-200'
                    : highRiskCount > 0 ? 'bg-red-50 border-red-100 text-red-900 hover:border-red-300' : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
            >
                <div className={`p-3 rounded-full ${highRiskCount > 0 ? 'bg-red-100' : 'bg-gray-100'}`}>
                    <ShieldAlert size={24} className={highRiskCount > 0 ? 'text-red-600' : 'text-gray-400'} />
                </div>
                <div>
                    <h3 className="text-2xl font-bold">{highRiskCount}</h3>
                    <p className="text-sm font-medium opacity-80">高リスクプロジェクト</p>
                </div>
            </button>

            <button
                onClick={() => onFilterChange('遅延')} // Mapping Blockers to Delayed or we need a 'Blocker' filter? 
                // For now let's map it to Delayed if we want to show anything problematic. 
                // Actually the user asked for filtering logic. Let's make it status-based mainly.
                className={`text-left transition-all p-4 rounded-xl border flex items-center gap-4 ${activeFilter === '遅延'
                    ? 'ring-2 ring-amber-500 bg-amber-50 border-amber-200'
                    : blockerCount > 0 ? 'bg-amber-50 border-amber-100 text-amber-900 hover:border-amber-300' : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
            >
                <div className={`p-3 rounded-full ${blockerCount > 0 ? 'bg-amber-100' : 'bg-gray-100'}`}>
                    <AlertTriangle size={24} className={blockerCount > 0 ? 'text-amber-600' : 'text-gray-400'} />
                </div>
                <div>
                    <h3 className="text-2xl font-bold">{blockerCount}</h3>
                    <p className="text-sm font-medium opacity-80">クライアントブロッカー</p>
                </div>
            </button>

            <button
                onClick={() => onFilterChange('遅延')}
                className={`text-left transition-all p-4 rounded-xl border flex items-center gap-4 ${activeFilter === '遅延'
                    ? 'ring-2 ring-orange-500 bg-orange-50 border-orange-200'
                    : overdueCount > 0 ? 'bg-orange-50 border-orange-100 text-orange-900 hover:border-orange-300' : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
            >
                <div className={`p-3 rounded-full ${overdueCount > 0 ? 'bg-orange-100' : 'bg-gray-100'}`}>
                    <Clock size={24} className={overdueCount > 0 ? 'text-orange-600' : 'text-gray-400'} />
                </div>
                <div>
                    <h3 className="text-2xl font-bold">{overdueCount}</h3>
                    <p className="text-sm font-medium opacity-80">期限超過マイルストーン</p>
                </div>
            </button>
        </div>
    );
};
