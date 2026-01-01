import React from 'react';
import type { Alert } from '../services/analysisEngine';
import { AlertTriangle } from 'lucide-react';

interface Props {
    alerts: Alert[];
}

export const AlertStream: React.FC<Props> = ({ alerts }) => {
    const highPriority = alerts.filter(a => a.severity === 'High');

    if (highPriority.length === 0) return null;

    return (
        <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <AlertTriangle className="text-red-500" />
                Critical Attention Needed
            </h2>
            <div className="space-y-3">
                {highPriority.map(alert => (
                    <div key={alert.id} className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm flex justify-between items-start">
                        <div>
                            <p className="font-bold text-red-900">{alert.message}</p>
                            <p className="text-sm text-red-700 mt-1">
                                Suggested: <span className="font-semibold">{alert.suggestedAction}</span>
                            </p>
                        </div>
                        <button className="text-xs bg-white text-red-600 border border-red-200 px-3 py-1 rounded hover:bg-red-50 transition">
                            Take Action
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
