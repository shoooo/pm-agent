import React from 'react';
import { History, CheckCircle2, Circle, AlertCircle, Clock } from 'lucide-react';
import type { Project } from '../services/mockHubspotService';
import type { Alert } from '../services/analysisEngine';
import { clsx } from 'clsx';

interface Props {
    projects: Project[];
    alerts: Alert[];
    onDismissClick: (alertId: string, projectId: string) => void;
    onHistoryClick: (project: Project) => void;
}

export const ProjectTable: React.FC<Props> = ({ projects, alerts, onDismissClick, onHistoryClick }) => {
    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Project Name</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Health</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Next Milestone</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Due Date</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {projects.map((project) => {
                            const projectAlerts = alerts.filter(a => a.projectId === project.id && !project.dismissedAlerts.includes(a.id));
                            const statusColor = project.health === 'At Risk' ? 'text-red-600 bg-red-50' :
                                project.health === 'Delayed' ? 'text-amber-600 bg-amber-50' :
                                    'text-green-600 bg-green-50';

                            return (
                                <tr key={project.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-gray-900">{project.name}</div>
                                        {projectAlerts.length > 0 && (
                                            <div className="flex items-center gap-1 mt-1 text-xs text-red-500 font-medium">
                                                <AlertCircle size={12} />
                                                {projectAlerts.length} Active {projectAlerts.length === 1 ? 'Alert' : 'Alerts'}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={clsx(
                                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                                            project.health === 'At Risk' ? "bg-red-50 text-red-700 border-red-100" :
                                                project.health === 'Delayed' ? "bg-amber-50 text-amber-700 border-amber-100" :
                                                    "bg-green-50 text-green-700 border-green-100"
                                        )}>
                                            {project.health}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            {project.nextMilestone.status === 'Completed' ?
                                                <CheckCircle2 size={14} className="text-green-500" /> :
                                                <Circle size={14} className="text-gray-300" />
                                            }
                                            {project.nextMilestone.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <div className={clsx(
                                            "flex items-center gap-1",
                                            new Date(project.nextMilestone.dueDate) < new Date('2024-02-21') ? "text-red-600 font-medium" : "text-gray-500"
                                        )}>
                                            <Clock size={14} />
                                            {project.nextMilestone.dueDate}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => onHistoryClick(project)}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                            title="View Timeline"
                                        >
                                            <History size={18} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            {projects.length === 0 && (
                <div className="py-12 text-center text-gray-500">
                    No projects found matching the criteria.
                </div>
            )}
        </div>
    );
};
