import React, { useState, useMemo } from 'react';
import { Head } from '@inertiajs/react';

export default function LandingPage({ projects, availableYears = [] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [year, setYear] = useState('all');
    const [status, setStatus] = useState('all');
    const [selectedProject, setSelectedProject] = useState(null);

    React.useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const logout = urlParams.get('logout');

        if (logout === 'true') {
            window.location.href = 'http://127.0.0.1:8000/landing';
        }
    }, []);

    const clearFilters = () => {
        setSearchTerm('');
        setYear('all');
        setStatus('all');
    };

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

    const groupedProjects = useMemo(() => {
        const grouped = {};
        filteredProjects?.forEach(project => {
            const y = project.project_year || 'Unknown Year';
            if (!grouped[y]) grouped[y] = [];
            grouped[y].push(project);
        });

        Object.keys(grouped).forEach(year => {
            grouped[year].sort((a, b) => {
                const aNum = parseInt(a.contract_id?.slice(-3) || '999');
                const bNum = parseInt(b.contract_id?.slice(-3) || '999');
                return aNum - bNum;
            });
        });

        return grouped;
    }, [filteredProjects]);

    const [openYears, setOpenYears] = useState({});

    const toggleYear = (y) => {
        setOpenYears(prev => ({
            ...prev,
            [y]: !prev[y]
        }));
    };

    const formatCurrency = (amount) => {
        if (!amount) return '₱0.00';
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
            <Head title="Projects" />

            {/* 🔷 Modern Header */}
            <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200/60 sticky top-0 z-40 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <img 
                                src="/images/DPWH Logo  - 17 Gears.png" 
                                alt="DPWH Logo" 
                                className="h-10 w-auto transition-transform hover:scale-105"
                            />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                                DPWH Projects
                            </h1>
                            <p className="text-xs text-gray-500 font-medium">Infrastructure Management System</p>
                        </div>
                    </div>

                    <button
                        onClick={() => window.location.href = '/login'}
                        className="px-4 py-2.5 bg-blue-600 border border-blue-700 rounded-xl text-sm font-medium text-white hover:bg-blue-700 hover:text-white transition-all duration-200 flex items-center gap-2"
                    >
                        Login
                    </button>
                </div>
            </div>

            {/* 🔍 Modern Filters */}
            <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/40">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            {filteredProjects.length} projects found
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search projects..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{ width: '280px', paddingRight: '2.5rem' }}
                                    className="pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                                />
                            </div>

                            <div className="h-px w-px bg-gray-300"></div>

                            <select
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                style={{ width: '140px' }}
                                className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 appearance-none cursor-pointer"
                            >
                                <option value="all">All Years</option>
                                {availableYears.map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>

                            <div className="h-px w-px bg-gray-300"></div>

                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                style={{ width: '140px' }}
                                className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 appearance-none cursor-pointer"
                            >
                                <option value="all">All Status</option>
                                <option value="ongoing">Ongoing</option>
                                <option value="completed">Completed</option>
                                <option value="pending">Pending</option>
                            </select>

                            <button
                                onClick={clearFilters}
                                className="px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm font-medium text-red-700 hover:bg-red-100 hover:text-red-800 transition-all duration-200 flex items-center gap-2"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 📊 Modern Results */}
            <div className="max-w-7xl mx-auto px-6 py-8">

                {Object.keys(groupedProjects).length === 0 ? (
                    <div className="text-center py-24">
                        <div className="inline-flex items-center gap-3 px-6 py-4 bg-white rounded-2xl shadow-lg border border-gray-200">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0l6.828-6.828a4 4 0 01-5.656 0l-6.828 6.828a4 4 0 000 5.656l6.828-6.828z" />
                                </svg>
                            </div>
                            <div className="text-left">
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">No projects found</h3>
                                <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {Object.keys(groupedProjects)
                            .sort((a, b) => parseInt(b) - parseInt(a))
                            .map(y => (
                                <div key={y} className="bg-white rounded-2xl border shadow-sm">
                                    {/* YEAR HEADER */}
                                    <div
                                        onClick={() => toggleYear(y)}
                                        className="cursor-pointer px-6 py-4 flex justify-between items-center border-b"
                                    >
                                        <h2 className="font-semibold">{y}</h2>
                                        <span>{openYears[y] ? '−' : '+'}</span>
                                    </div>

                                    {/* PROJECT LIST */}
                                    {openYears[y] && (
                                        <div>
                                            {groupedProjects[y].map(project => (
                                                <div
                                                    key={project.id}
                                                    onClick={() => setSelectedProject(project)}
                                                    className="flex justify-between items-center px-6 py-4 hover:bg-gray-50 cursor-pointer transition"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <span className="font-mono text-sm text-gray-500 w-[100px]">
                                                            {project.contract_id}
                                                        </span>

                                                        <div>
                                                            <p className="font-medium text-gray-900">
                                                                {project.title}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {project.category?.name}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                    </div>
                )}
            </div>

            {/* Project Modal */}
            <ProjectModal 
                project={selectedProject} 
                onClose={() => setSelectedProject(null)} 
            />
        </div>
    );
}

function Info({ label, value }) {
    return (
        <div className="flex flex-col">
            <span className="text-xs text-gray-500">{label}</span>
            <span className="text-gray-900 font-semibold">{value || '-'}</span>
        </div>
    );
}

function Section({ title, content }) {
    return (
        <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-2">{title}</h4>
            <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700">
                {content || 'No data available'}
            </div>
        </div>
    );
}

// Simple Modal Component
function ProjectModal({ project, onClose }) {
    if (!project) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm cursor-pointer"
                onClick={onClose}
            />
            
            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-11/12 max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white">Project Details</h2>
                        <p className="text-blue-100 text-sm">
                            {project?.category?.name || 'Uncategorized'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:bg-white/10 p-2 rounded-lg"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-8 py-6">
                    <div className="mb-6">
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                            {project?.title || 'No Title'}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            project?.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                            project?.status === 'ongoing' ? 'bg-green-100 text-green-700' :
                            'bg-amber-100 text-amber-700'
                        }`}>
                            {project?.status?.charAt(0)?.toUpperCase() + project?.status?.slice(1) || 'Unknown'}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-6">
                        <Info label="Contract ID" value={project?.contract_id} />
                        <Info label="Project Year" value={project?.project_year} />
                        <Info label="Project Cost" value={project?.project_cost ? `₱${project.project_cost.toLocaleString()}` : '-'} />
                        <Info label="Start Date" value={project?.date_started} />
                    </div>

                    {project?.revised_project_cost && (
                        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-amber-800">Revised Cost</span>
                                <span className="text-sm font-bold text-amber-900">
                                    ₱{project.revised_project_cost.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    )}

                    <Section
                        title="Scope of Work"
                        content={project?.scope?.[0]?.scope_of_work_main || 'No scope information available'}
                    />

                    <Section
                        title="Progress"
                        content={project?.progress?.[0]?.target_actual ? 
                            `Target: ${project.progress[0].target_actual}%` : 
                            'No progress information available'
                        }
                    />

                    <Section
                        title="Remarks"
                        content={project?.remarks?.[0]?.remarks || 'No remarks available'}
                    />
                </div>
            </div>
        </div>
    );
}