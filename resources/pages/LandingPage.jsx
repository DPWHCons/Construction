import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Head, router } from '@inertiajs/react';
import ProjectDetailsModal from '../js/Components/ProjectDetailsModal';
import LandingGalleryModal from './LandingGalleryModal';

export default function LandingPage({ projects, availableYears = [], filters = {} }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [year, setYear] = useState(filters.year || 'all');
    const [status, setStatus] = useState(filters.status || 'all');
    const [selectedProject, setSelectedProject] = useState(null);
    const [showImages, setShowImages] = useState(false);

    React.useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const logout = urlParams.get('logout');

        if (logout === 'true') {
            window.location.href = 'http://127.0.0.1:8000/landing';
        }
    }, []);

    // Auto-refresh effect - fixed 30 second interval
    useEffect(() => {
        const interval = setInterval(() => {
            const params = {};
            if (searchTerm) params.search = searchTerm;
            if (year !== 'all') params.year = year;
            if (status !== 'all') params.status = status;

            router.get(
                '/landing',
                params,
                {
                    preserveScroll: true,
                    preserveState: true
                }
            );
        }, 30000); // Fixed 30 second interval

        return () => clearInterval(interval);
    }, [searchTerm, year, status]);

    // Update filters and trigger refresh
    const updateFilters = useCallback((newSearchTerm, newYear, newStatus) => {
        setSearchTerm(newSearchTerm);
        setYear(newYear);
        setStatus(newStatus);
        
        // Immediate refresh when filters change
        setTimeout(() => {
            const params = {};
            if (newSearchTerm) params.search = newSearchTerm;
            if (newYear !== 'all') params.year = newYear;
            if (newStatus !== 'all') params.status = newStatus;

            router.get(
                '/landing',
                params,
                {
                    preserveScroll: true,
                    preserveState: true
                }
            );
        }, 300); // Small delay to prevent excessive requests
    }, []);

    const clearFilters = () => {
        updateFilters('', 'all', 'all');
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
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between mb-3">
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

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => {
                                    window.location.replace('/login');
                                }}
                                className="px-4 py-2.5 bg-blue-600 border border-blue-700 rounded-xl text-sm font-medium text-white hover:bg-blue-700 hover:text-white transition-all duration-200 flex items-center gap-2"
                            >
                                Login
                            </button>
                        </div>
                    </div>
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
                                    onChange={(e) => updateFilters(e.target.value, year, status)}
                                    style={{ width: '280px', paddingRight: '2.5rem' }}
                                    className="pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                                />
                            </div>

                            <div className="h-px w-px bg-gray-300"></div>

                            <select
                                value={year}
                                onChange={(e) => updateFilters(searchTerm, e.target.value, status)}
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
                                onChange={(e) => updateFilters(searchTerm, year, e.target.value)}
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

            {/* Project Details Modal */}
            <ProjectDetailsModal
                show={selectedProject && !showImages}
                project={selectedProject}
                onClose={() => {
                    setSelectedProject(null);
                    setShowImages(false);
                }}
                onShowImages={() => setShowImages(true)}
            />

            {/* Project Gallery Modal */}
            <LandingGalleryModal
                show={selectedProject && showImages}
                project={selectedProject}
                onClose={() => {
                    setSelectedProject(null);
                    setShowImages(false);
                }}
                onBackToDetails={() => setShowImages(false)}
            />
        </div>
    );
}