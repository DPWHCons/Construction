import React, { useState, useMemo } from 'react';
import { Head } from '@inertiajs/react';

export default function LandingPage({ projects, availableYears = [] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [year, setYear] = useState('all');
    const [status, setStatus] = useState('all');
    const [selectedProject, setSelectedProject] = useState(null);

    // 🔍 Flatten + filter
    const filteredProjects = useMemo(() => {
        return projects?.data?.filter(p => {
            const matchesSearch =
                p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.contract_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.category?.name?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesYear =
                year === 'all' || String(p.project_year) === year;

            const matchesStatus =
                status === 'all' || p.status === status;

            return matchesSearch && matchesYear && matchesStatus;
        }) || [];
    }, [projects, searchTerm, year, status]);

    const formatCurrency = (amount) => {
        if (!amount) return '₱0.00';
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Head title="Projects" />

            {/* 🔷 Top Bar */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    
                    <div className="flex items-center gap-3">
                        <img 
                            src="/images/DPWH Logo  - 17 Gears.png" 
                            alt="DPWH Logo" 
                            className="h-8 w-auto"
                        />
                        <h1 className="text-xl font-semibold text-gray-900">
                            DPWH Projects
                        </h1>
                    </div>
                </div>
            </div>

            {/* 🔍 Filters Bar */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    
                    <div className="text-sm text-gray-500">
                        {filteredProjects.length} projects found
                    </div>
                    
                    {/* Compact Filters */}
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="px-3 py-1.5 border border-gray-300 rounded text-sm w-48 focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                        />

                        <select
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            className="px-2 py-1.5 border border-gray-300 rounded text-sm text-sm"
                        >
                            <option value="all">All Years</option>
                            {availableYears.map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>

                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="px-2 py-1.5 border border-gray-300 rounded text-sm text-sm"
                        >
                            <option value="all">All Status</option>
                            <option value="ongoing">Ongoing</option>
                            <option value="completed">Completed</option>
                            <option value="pending">Pending</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* 📊 Results */}
            <div className="max-w-7xl mx-auto px-4 py-6">

                {filteredProjects.length === 0 ? (
                    <div className="text-center py-16 bg-white border rounded-xl">
                        <p className="text-gray-500">No projects found</p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

                        {filteredProjects.map(project => (
                            <div
                                key={project.id}
                                onClick={() => setSelectedProject(project)}
                                className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition cursor-pointer"
                            >
                                <h3 className="font-semibold text-gray-900 line-clamp-2">
                                    {project.title}
                                </h3>

                                <p className="text-sm text-gray-500 mt-1">
                                    {project.category?.name || 'No category'}
                                </p>

                                <div className="mt-3 flex items-center justify-between text-sm">
                                    <span className="text-gray-500">
                                        {project.project_year || '-'}
                                    </span>
                                    <span className="font-medium text-gray-900">
                                        {formatCurrency(project.project_cost)}
                                    </span>
                                </div>

                                <div className="mt-3">
                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                        project.status === 'completed'
                                            ? 'bg-blue-100 text-blue-700'
                                            : project.status === 'ongoing'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-gray-100 text-gray-600'
                                    }`}>
                                        {project.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 👉 Slide-over Panel */}
            {selectedProject && (
                <div className="fixed inset-0 z-50 flex">
                    
                    {/* Overlay */}
                    <div
                        className="flex-1 bg-black/30"
                        onClick={() => setSelectedProject(null)}
                    />

                    {/* Panel */}
                    <div className="w-full max-w-lg bg-white h-full shadow-xl p-6 overflow-y-auto">
                        
                        <button
                            onClick={() => setSelectedProject(null)}
                            className="mb-4 text-sm text-gray-500 hover:text-gray-800"
                        >
                            Close
                        </button>

                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                            {selectedProject.title}
                        </h2>

                        <p className="text-sm text-gray-500 mb-4">
                            {selectedProject.category?.name}
                        </p>

                        <div className="space-y-3 text-sm">
                            <Info label="Contract ID" value={selectedProject.contract_id} />
                            <Info label="Year" value={selectedProject.project_year} />
                            <Info label="Cost" value={formatCurrency(selectedProject.project_cost)} />
                            <Info label="Start Date" value={selectedProject.date_started} />
                        </div>

                        <div className="mt-6">
                            <h4 className="font-medium text-gray-800 mb-2">Scope</h4>
                            <p className="text-gray-600 text-sm">
                                {selectedProject.scope?.[0]?.scope_of_work || 'No data'}
                            </p>
                        </div>

                        <div className="mt-6">
                            <h4 className="font-medium text-gray-800 mb-2">Remarks</h4>
                            <p className="text-gray-600 text-sm">
                                {selectedProject.remarks?.[0]?.remarks || 'No remarks'}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function Info({ label, value }) {
    return (
        <div className="flex justify-between">
            <span className="text-gray-500">{label}</span>
            <span className="text-gray-900 font-medium">{value || '-'}</span>
        </div>
    );
}