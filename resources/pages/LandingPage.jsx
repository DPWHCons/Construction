import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Head, router } from '@inertiajs/react';
import ProjectDetailsModal from '../js/Components/ProjectDetailsModal';
import Swal from 'sweetalert2';

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
            window.location.replace('http://127.0.0.1:8000/landing');
        }
    }, []);

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

    const [currentPage, setCurrentPage] = useState(1);
    const projectsPerPage = 12;

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

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, year, status]);

    // Sort projects by year (desc) then contract ID last 4 digits (asc)
    const sortedProjects = useMemo(() => {
        return [...filteredProjects].sort((a, b) => {
            // First sort by year descending
            const yearA = parseInt(a.project_year) || 0;
            const yearB = parseInt(b.project_year) || 0;
            if (yearB !== yearA) {
                return yearB - yearA;
            }
            // Then sort by contract ID last 4 digits ascending
            const aNum = parseInt(a.contract_id?.slice(-4) || '9999');
            const bNum = parseInt(b.contract_id?.slice(-4) || '9999');
            return aNum - bNum;
        });
    }, [filteredProjects]);

    // Paginated projects
    const paginatedProjects = useMemo(() => {
        const startIndex = (currentPage - 1) * projectsPerPage;
        return sortedProjects.slice(startIndex, startIndex + projectsPerPage);
    }, [sortedProjects, currentPage]);

    const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);

    const groupedProjects = useMemo(() => {
        const grouped = {};
        filteredProjects?.forEach(project => {
            const y = project.project_year || 'Unknown Year';
            if (!grouped[y]) grouped[y] = [];
            grouped[y].push(project);
        });

        Object.keys(grouped).forEach(year => {
            grouped[year].sort((a, b) => {
                const aNum = parseInt(a.contract_id?.slice(-4) || '9999');
                const bNum = parseInt(b.contract_id?.slice(-4) || '9999');
                return aNum - bNum;
            });
        });

        return grouped;
    }, [filteredProjects]);

    const [selectedYears, setSelectedYears] = useState(() => {
        if (!availableYears || availableYears.length === 0) return ['all'];
        const mostRecentYear = Math.max(...availableYears.map(y => parseInt(y)));
        return [String(mostRecentYear)];
    });

    const [pagination, setPagination] = useState({});

    const toggleYear = (y) => {
        setSelectedYears([y]);
        setPagination({ [y]: 0 });
    };

    const formatCurrency = (amount) => {
        if (!amount) return '₱0.00';
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Head title="DPWH Infrastructure Projects" />

            {/* Simple Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img 
                                src="/images/DPWH_logo.png" 
                                alt="DPWH Logo" 
                                className="h-8 w-auto"
                            />
                            <div>
                                <h1 className="text-lg font-bold text-slate-800">DPWH Projects</h1>
                                <p className="text-xs text-slate-500">Infrastructure Management System</p>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                Swal.fire({
                                    title: '',
                                    html: `
                                        <div class="text-center">
                                            <div class="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center mb-3 shadow-lg border border-slate-200">
                                                <img src="/images/DPWH_logo.png" alt="DPWH Logo" class="w-14 h-14 object-contain" />
                                            </div>
                                            <h3 class="text-lg font-bold text-slate-900 mb-1">Secure Authentication</h3>
                                            <p class="text-xs text-[#010066] font-semibold mb-4">Department of Public Works and Highways</p>

                                            <div class="bg-slate-50 border border-slate-200 rounded-lg p-4 text-left mb-4">
                                                <div class="flex items-center gap-2 mb-3">
                                                    <div class="w-5 h-5 bg-amber-100 rounded flex items-center justify-center">
                                                        <svg class="w-3 h-3 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.758 1.344-.212 3.029-1.742 3.029H4.42c-1.53 0-2.5-1.685-1.742-3.029l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                                                        </svg>
                                                    </div>
                                                    <span class="text-xs font-semibold text-slate-700 uppercase tracking-wide">Security Notice</span>
                                                </div>
                                                <ul class="space-y-2 text-xs text-slate-600">
                                                    <li class="flex items-start gap-2">
                                                        <svg class="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                                                        </svg>
                                                        <span>Unauthorized access is strictly prohibited</span>
                                                    </li>
                                                    <li class="flex items-start gap-2">
                                                        <svg class="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                                                        </svg>
                                                        <span>All activities are monitored and logged</span>
                                                    </li>
                                                    <li class="flex items-start gap-2">
                                                        <svg class="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                                                        </svg>
                                                        <span>Authorized personnel only</span>
                                                    </li>
                                                </ul>
                                            </div>

                                            <p class="text-xs text-slate-400">IP Address: <span class="font-mono">192.168.x.x</span> • Session: <span class="font-mono">${new Date().toISOString().slice(0, 10)}</span></p>
                                        </div>
                                    `,
                                    icon: false,
                                    showCancelButton: true,
                                    confirmButtonText: 'Proceed to Login',
                                    cancelButtonText: 'Cancel',
                                    reverseButtons: true,
                                    width: '380px',
                                    customClass: {
                                        popup: 'rounded-2xl shadow-2xl border border-slate-100',
                                        confirmButton: 'px-6 py-2.5 bg-[#010066] text-white rounded-lg text-sm font-semibold hover:bg-[#010055] transition-all shadow-sm',
                                        cancelButton: 'px-6 py-2.5 bg-slate-100 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-200 transition-all'
                                    }
                                }).then((result) => {
                                    if (result.isConfirmed) {
                                        window.location.replace('/login');
                                    }
                                });
                            }}
                            className="px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                        >
                            Login
                        </button>
                    </div>
                </div>
            </div>

            {/* Filter Section */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 py-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-600">
                            {filteredProjects.length} projects
                        </span>
                        
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) => updateFilters(e.target.value, year, status)}
                                    className="w-64 pl-4 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                />
                            </div>

                            <select
                                value={year}
                                onChange={(e) => updateFilters(searchTerm, e.target.value, status)}
                                className="w-32 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                            >
                                <option value="all">All Years</option>
                                {availableYears.map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>

                            <select
                                value={status}
                                onChange={(e) => updateFilters(searchTerm, year, e.target.value)}
                                className="w-32 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                            >
                                <option value="all">All Status</option>
                                <option value="ongoing">Ongoing</option>
                                <option value="completed">Completed</option>
                                <option value="pending">Pending</option>
                            </select>

                            {(searchTerm || year !== 'all' || status !== 'all') && (
                                <button
                                    onClick={clearFilters}
                                    className="px-3 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">

                <div className="mb-4">
                    <p className="text-sm text-slate-500">
                        Click on any project to view details
                    </p>
                </div>

                {paginatedProjects.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="inline-flex flex-col items-center gap-4 px-8 py-10 bg-white rounded-2xl shadow-sm border border-slate-200">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0l6.828-6.828a4 4 0 01-5.656 0l-6.828 6.828a4 4 0 000 5.656l6.828-6.828z" />
                                </svg>
                            </div>
                            <div className="text-center">
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">No projects found</h3>
                                <p className="text-sm text-slate-500">Try adjusting your search or filters to find projects</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {/* Projects Cards */}
                        {paginatedProjects.map(project => (
                            <div
                                key={project.id}
                                onClick={() => setSelectedProject(project)}
                                className="bg-white rounded-lg border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer p-4"
                            >
                                <div className="flex flex-col h-full">
                                    <div className="flex items-center justify-between mb-2 gap-2">
                                        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold uppercase ${
                                            project.status === 'completed' ? 'text-blue-700' :
                                            project.status === 'ongoing' ? 'text-green-700' :
                                            project.status === 'pending' ? 'text-orange-700' :
                                            'text-slate-700'
                                        }`}>
                                            {project.status}
                                        </span>
                                        <span className="text-sm text-slate-700 font-mono truncate font-semibold">
                                            {project.contract_id}
                                        </span>
                                        <span className="text-xs text-slate-500 font-mono">
                                            {project.project_year}
                                        </span>
                                    </div>
                                    
                                    <h3 className="font-medium text-slate-900 text-sm mb-2 line-clamp-2 min-h-[2.5rem]">
                                        {project.title}
                                    </h3>
                                    
                                    <div className="mt-auto pt-2 border-t border-dashed border-slate-200">
                                        <p className="text-xs text-slate-400">
                                            {project.category?.name}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-1 mt-8">
                        <button
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                            className="px-2 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            title="First Page"
                        >
                            «
                        </button>
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-2 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            title="Previous"
                        >
                            ‹
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`min-w-[36px] px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                    currentPage === page
                                        ? 'bg-blue-600 text-white border border-blue-600'
                                        : 'text-slate-600 bg-white border border-slate-200 hover:bg-slate-50'
                                }`}
                            >
                                {page}
                            </button>
                        ))}
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-2 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            title="Next"
                        >
                            ›
                        </button>
                        <button
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages}
                            className="px-2 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            title="Last Page"
                        >
                            »
                        </button>
                    </div>
                )}
            </div>

            {/* Project Details Modal */}
            <ProjectDetailsModal
                show={selectedProject}
                project={selectedProject}
                showImages={showImages}
                onClose={() => {
                    setSelectedProject(null);
                    setShowImages(false);
                }}
                onShowImages={() => setShowImages(true)}
                onBackToDetails={() => setShowImages(false)}
            />
        </div>
    );
}