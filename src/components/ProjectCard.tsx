
import React from 'react';
import { AlertCircle, ArrowRight, Calendar, CheckCircle2, User, X, History } from 'lucide-react';
import type { Project } from '../services/mockHubspotService';
import type { Alert } from '../services/analysisEngine';
import { SentimentBadge } from './SentimentBadge';

interface Props {
    project: Project;
    alerts: Alert[];
    onDismissClick: (alertId: string, projectId: string) => void;
    onHistoryClick: (project: Project) => void;
}

export const ProjectCard: React.FC<Props> = ({ project, alerts, onDismissClick, onHistoryClick }) => {
    const primaryAlert = alerts[0]; // Show top priority alert
    const isRisk = project.health === '要注意' || project.health === '遅延';

    const healthColor = {
        '順調': 'bg-green-100 text-green-700',
        '要注意': 'bg-red-100 text-red-700',
        '遅延': 'bg-orange-100 text-orange-700'
    }[project.health];

    return (
        <div className={`bg-white rounded-xl shadow-sm border p-5 transition hover:shadow-md flex flex-col h-full relative group ${isRisk ? 'border-red-200 ring-1 ring-red-50' : 'border-gray-200'}`}>
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition">
                <button
                    onClick={(e) => { e.stopPropagation(); onHistoryClick(project); }}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-1 text-xs font-medium"
                    title="View History"
                >
                    <History size={14} /> History
                </button>
            </div>
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="font-bold text-lg text-gray-900 leading-tight">{project.name}</h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><User size={12} /> {project.owner}</span>
                        {project.riskCategory && project.riskCategory !== 'None' && (
                            <span className="bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-medium">
                                {project.riskCategory}
                            </span>
                        )}
                        {project.trend && (
                            <span className={`flex items-center gap-0.5 font-medium ${project.trend === 'Declining' ? 'text-red-500' : project.trend === 'Improving' ? 'text-green-500' : 'text-blue-500'}`}>
                                {project.trend === 'Declining' ? '↘' : project.trend === 'Improving' ? '↗' : '→'} {project.trend}
                            </span>
                        )}
                    </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${healthColor}`}>
                    {project.health}
                </span>
            </div>

            <div className="space-y-3 mb-6 flex-grow">
                {/* Milestone Info */}
                <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Next Milestone</p>
                    <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-900">{project.nextMilestone.name}</span>
                        <div className="flex items-center gap-1 text-xs font-mono bg-white border px-1.5 py-0.5 rounded text-gray-600">
                            <Calendar size={12} />
                            {project.nextMilestone.dueDate}
                        </div>
                    </div>
                </div>

                {/* Pending Tasks Summary */}
                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Pending Tasks</span>
                    <div className="flex gap-2">
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100">
                            Us: {project.tasks.filter(t => t.assignee === 'Us' && t.status === 'Pending').length}
                        </span>
                        <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-100">
                            Client: {project.tasks.filter(t => t.assignee === 'Client' && t.status === 'Pending').length}
                        </span>
                    </div>
                </div>

                {/* Latest Communication Context */}
                {project.emails && project.emails.length > 0 && (
                    <div className="mb-4 bg-gray-50 rounded-lg p-3 text-sm">
                        <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-gray-700 text-xs">Latest Email: {project.emails[0].subject}</span>
                            <SentimentBadge score={project.emails[0].sentimentScore} />
                        </div>
                        <p className="text-gray-600 line-clamp-2 italic">"{project.emails[0].body}"</p>
                    </div>
                )}
            </div>

            {/* Intelligent Actions / Alerts */}
            {primaryAlert ? (
                <div className="mt-auto relative">
                    <div
                        className={`rounded-lg p-3 text-sm pr-8 ${primaryAlert.severity === 'High' ? 'bg-red-50 text-red-900 border border-red-100' : 'bg-amber-50 text-amber-900 border border-amber-100'}`}
                    >
                        <div className="flex gap-3 items-start">
                            <AlertCircle size={18} className="mt-0.5 shrink-0" />
                            <div>
                                <p className="font-bold mb-1 mr-2">{primaryAlert.message}</p>
                                <div className="flex items-center gap-1 text-xs font-semibold mt-2 text-gray-500 cursor-default">
                                    <ArrowRight size={14} />
                                    {primaryAlert.suggestedAction}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Dismiss Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDismissClick(primaryAlert.id, project.id);
                        }}
                        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 hover:bg-black/5 rounded-full transition"
                        title="Dismiss Alert"
                    >
                        <X size={14} />
                    </button>
                </div>
            ) : (
                <div className="mt-auto text-sm text-green-700 flex items-center gap-2 bg-green-50 p-3 rounded-lg border border-green-100">
                    <CheckCircle2 size={16} />
                    All clear. No immediate actions.
                </div>
            )}
        </div>
    );
};
