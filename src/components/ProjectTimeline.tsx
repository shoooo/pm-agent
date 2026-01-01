
import React from 'react';
import { X, Mail, Flag, AlertTriangle, FileText } from 'lucide-react';
import type { ActivityLog } from '../services/mockHubspotService';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    projectName: string;
    logs: ActivityLog[];
}

export const ProjectTimeline: React.FC<Props> = ({ isOpen, onClose, projectName, logs }) => {
    if (!isOpen) return null;

    const getIcon = (type: ActivityLog['type']) => {
        switch (type) {
            case 'Email': return <Mail size={16} className="text-blue-500" />;
            case 'Milestone': return <Flag size={16} className="text-purple-500" />;
            case 'Alert': return <AlertTriangle size={16} className="text-amber-500" />;
            default: return <FileText size={16} className="text-gray-500" />;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex justify-end animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <div>
                        <h3 className="font-bold text-gray-900">Activity History</h3>
                        <p className="text-xs text-gray-500">{projectName}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition text-gray-500">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                    <div className="relative border-l-2 border-slate-200 ml-3 space-y-8">
                        {logs.map((log) => (
                            <div key={log.id} className="relative pl-8">
                                <span className={`absolute -left-2.5 top-0 w-5 h-5 rounded-full bg-white border-2 flex items-center justify-center ${log.type === 'Alert' ? 'border-amber-200' : 'border-blue-100'
                                    }`}>
                                    <div className="scale-75">{getIcon(log.type)}</div>
                                </span>

                                <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">{log.type}</span>
                                        <span className="text-xs text-gray-400">{log.date}</span>
                                    </div>
                                    <p className="text-sm text-gray-800">{log.description}</p>
                                    <p className="text-xs text-gray-400 mt-2 text-right">by {log.user}</p>
                                </div>
                            </div>
                        ))}

                        {logs.length === 0 && (
                            <div className="pl-6 text-sm text-gray-400 italic">No activity recorded yet.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
