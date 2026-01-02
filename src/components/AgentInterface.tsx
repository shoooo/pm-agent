
import React, { useEffect, useState } from 'react';
import { Bot, RefreshCw, Filter } from 'lucide-react';
import { getRealProjects } from '../services/HubspotService';
import { performAction } from '../services/mockHubspotService'; // Keeping for 'dismiss' local state logic if needed, or we move it.
import type { Project } from '../services/mockHubspotService';
import { runAnalysis } from '../services/analysisEngine';
import type { Alert } from '../services/analysisEngine';
import { ProjectCard } from './ProjectCard';
import { CriticalSummary } from './CriticalSummary';
import { ProjectTimeline } from './ProjectTimeline';
import { AlertStream } from './AlertStream';
import { ProjectTable } from './ProjectTable';
import { LayoutGrid, List, User } from 'lucide-react';
import { clsx } from 'clsx';

export const AgentInterface: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [timelineProject, setTimelineProject] = useState<Project | null>(null);
    const [lastSynced, setLastSynced] = useState<string>('Just now');
    const [filterStatus, setFilterStatus] = useState<string>('All');
    const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
    const [ownerFilter, setOwnerFilter] = useState<string>('All');

    const loadData = async () => {
        setLoading(true);
        // Try to fetch real data, fallback to mock if empty/error (or just show empty)
        const data = await getRealProjects();
        const insights = runAnalysis(data);
        setProjects(data);
        setAlerts(insights);
        setLoading(false);
        setLastSynced(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleDismiss = async (alertId: string, projectId: string) => {
        // For MVP, we might still use local mock/performAction for dismissal if we aren't writing back to HubSpot yet.
        // Or we use the real service stub.
        await performAction(projectId, 'dismiss', { alertId });
        await loadData();
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-6 md:p-10">
            <header className="max-w-6xl mx-auto mb-10 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center gap-3">
                        <Bot className="text-blue-600" size={32} />
                        PM Agent
                    </h1>
                    <p className="text-gray-500 mt-1">Managing {projects.length} active onboarding projects</p>
                </div>
                <button
                    onClick={loadData}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition"
                    title="Refresh Data"
                >
                    <span className="text-xs">Synced: {lastSynced}</span>
                    <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                </button>
            </header>

            <main className="max-w-6xl mx-auto">
                {/* Global Alert Stream */}
                {!loading && filterStatus === 'All' && alerts.length > 0 && <AlertStream alerts={alerts} />}

                {/* Global Filter Bar */}
                {!loading && (
                    <div className="mb-6 flex flex-wrap gap-4 items-center justify-between border-b pb-6 border-gray-100">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-500 flex items-center gap-1">
                                <User size={14} /> Owner:
                            </span>
                            <select
                                value={ownerFilter}
                                onChange={(e) => setOwnerFilter(e.target.value)}
                                className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
                            >
                                <option value="All">All Members</option>
                                <option value="Sarah">Sarah</option>
                                <option value="James">James</option>
                            </select>
                        </div>

                        <div className="bg-gray-100 p-1 rounded-lg flex items-center">
                            <button
                                onClick={() => setViewMode('cards')}
                                className={clsx(
                                    "p-1.5 rounded-md transition flex items-center gap-2 text-sm px-3",
                                    viewMode === 'cards' ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                                )}
                            >
                                <LayoutGrid size={16} /> Card View
                            </button>
                            <button
                                onClick={() => setViewMode('table')}
                                className={clsx(
                                    "p-1.5 rounded-md transition flex items-center gap-2 text-sm px-3",
                                    viewMode === 'table' ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                                )}
                            >
                                <List size={16} /> Table View
                            </button>
                        </div>
                    </div>
                )}

                {/* Critical Summary */}
                {!loading && (
                    <CriticalSummary
                        alerts={alerts}
                        projects={projects}
                        onFilterChange={setFilterStatus}
                        activeFilter={filterStatus}
                    />
                )}

                {/* Project Grid */}
                <div className="flex justify-between items-end mb-4">
                    <div className="flex items-center gap-4">
                        <h2 className="text-lg font-bold text-gray-800">
                            {filterStatus === 'All' ? 'Active Projects' : `${filterStatus} Projects`}
                        </h2>
                        {filterStatus !== 'All' && (
                            <button
                                onClick={() => setFilterStatus('All')}
                                className="text-xs text-blue-600 hover:underline"
                            >
                                Clear filter
                            </button>
                        )}
                    </div>
                    <div className="flex gap-2 text-sm text-gray-500">
                        <button className="flex items-center gap-1 hover:text-gray-800"><Filter size={14} /> Filter</button>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => <div key={i} className="h-48 bg-gray-200 animate-pulse rounded-xl" />)}
                    </div>
                ) : (
                    <>
                        {viewMode === 'cards' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {projects
                                    .filter(project => filterStatus === 'All' || project.health === filterStatus)
                                    .filter(project => ownerFilter === 'All' || project.owner === ownerFilter)
                                    .map(project => {
                                        const projectAlerts = alerts.filter(a => a.projectId === project.id && !project.dismissedAlerts.includes(a.id));
                                        return (
                                            <ProjectCard
                                                key={project.id}
                                                project={project}
                                                alerts={projectAlerts}
                                                onDismissClick={handleDismiss}
                                                onHistoryClick={setTimelineProject}
                                            />
                                        );
                                    })}
                            </div>
                        ) : (
                            <ProjectTable
                                projects={projects.filter(project => (filterStatus === 'All' || project.health === filterStatus) && (ownerFilter === 'All' || project.owner === ownerFilter))}
                                alerts={alerts}
                                onDismissClick={handleDismiss}
                                onHistoryClick={setTimelineProject}
                            />
                        )}
                    </>
                )}
            </main>



            {timelineProject && (
                <ProjectTimeline
                    isOpen={!!timelineProject}
                    onClose={() => setTimelineProject(null)}
                    projectName={timelineProject.name}
                    logs={timelineProject.activityLog}
                />
            )}
        </div>
    );
};
