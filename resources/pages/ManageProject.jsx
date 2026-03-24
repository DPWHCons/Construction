import PageLayout from '@/Layouts/PageLayout';
import { Head, router } from '@inertiajs/react';
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { showErrorMessage, showSuccessMessage, showProjectArchiveConfirmation, showImportConfirmation } from '@/Utils/alerts';
import CreateProjectModal from '@/Components/CreateProjectModal';
import EditProjectModal from '@/Components/EditProjectModal';
import ProjectDetailsModal from '@/Components/ProjectDetailsModal';
import ProjectGalleryModal from '@/Components/ProjectGalleryModal';
import ImportModal from '@/Components/ImportModal';
import DPWHLoading from '@/Components/DPWHLoading';
import useAutoRefresh from '@/Hooks/useAutoRefresh';

export default function ManageProject({ projects, categories, availableLetters, availableYears = [], selectedYear: initialYear = 'all' }) {
    const urlParams = new URLSearchParams(window.location.search);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedYear, setSelectedYear] = useState(initialYear);
    const [yearRangeStart, setYearRangeStart] = useState(new Date().getFullYear() - 2);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [selectedProject, setSelectedProject] = useState(null);
    const [showImages, setShowImages] = useState(false);
    const [openCategories, setOpenCategories] = useState({});
    const [categoryHeights, setCategoryHeights] = useState({});
    const [animatingCategories, setAnimatingCategories] = useState(new Set());
    const [expandedYears, setExpandedYears] = useState(new Set()); // Track which years are expanded
    const [yearHeights, setYearHeights] = useState({});
    const [animatingYears, setAnimatingYears] = useState(new Set());
    const [loading, setLoading] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [showDPWHLoading, setShowDPWHLoading] = useState(false);

    const [projectData, setProjectData] = useState(projects?.data || []);

    const { refresh, stopAutoRefresh, startAutoRefresh } = useAutoRefresh(30000, {
        preserveScroll: true,
        preserveState: true,
    });

    // Stop auto-refresh to prevent delays when adding/updating projects
    useEffect(() => {
        stopAutoRefresh();
        return () => {
            startAutoRefresh();
        };
    }, []);

    // Cleanup DPWHLoading state on unmount and reset on mount
    useEffect(() => {
        // Reset loading state when component mounts
        setShowDPWHLoading(false);
        
        return () => {
            setShowDPWHLoading(false);
        };
    }, []);

    useEffect(() => {
        if (projects && projects.data) {
            setProjectData(projects.data);
        }
    }, [projects]);

    // Sync selectedYear with backend props
    useEffect(() => {
        setSelectedYear(initialYear || 'all');
    }, [initialYear]);

    // Group projects by year and sort by contract ID last 3 digits
    const groupedProjects = useMemo(() => {
        // Backend already filtered by year - just group the data
        const filteredData = projectData;

        return filteredData.reduce((groups, project) => {
            const year = project.project_year || 'Unknown Year';
            const groupKey = selectedYear === 'all' 
                ? year
                : selectedYear;

            if (!groups[groupKey]) groups[groupKey] = { year, projects: [] };
            groups[groupKey].projects.push(project);
            return groups;
        }, {});
    }, [projectData, selectedYear]);

    // Sort projects within each group by contract ID last 3 digits in ascending order
    const sortedGroupedProjects = useMemo(() => {
        const sorted = {};
        
        Object.entries(groupedProjects).forEach(([groupKey, group]) => {
            const sortedProjects = [...group.projects].sort((a, b) => {
                // Extract last 3 digits from contract ID
                const getContractLast3 = (contractId) => {
                    if (!contractId) return 0;
                    const match = contractId.match(/(\d{3})$/);
                    return match ? parseInt(match[1]) : 0;
                };
                
                const aLast3 = getContractLast3(a.contract_id);
                const bLast3 = getContractLast3(b.contract_id);
                
                return aLast3 - bLast3;
            });
            
            sorted[groupKey] = { ...group, projects: sortedProjects };
        });
        
        return sorted;
    }, [groupedProjects]);

    // Sort the initial groupedProjects by year to maintain consistent order
    const finalGroupedProjects = useMemo(() => {
        if (selectedYear !== 'all') return sortedGroupedProjects;
        
        const entries = Object.entries(sortedGroupedProjects);
        entries.sort(([, groupA], [, groupB]) => {
            // Handle "Unknown Year" by putting it at the end
            if (groupA.year === 'Unknown Year') return 1;
            if (groupB.year === 'Unknown Year') return -1;
            // Sort by year in descending order
            return parseInt(groupB.year) - parseInt(groupA.year);
        });
        
        return Object.fromEntries(entries);
    }, [sortedGroupedProjects, selectedYear]);

    // Group by year for better organization
    const projectsByYear = useMemo(() => {
        if (selectedYear !== 'all') {
            // When a specific year is selected, just return the grouped projects as-is
            return new Map([[selectedYear, Object.entries(finalGroupedProjects)]]);
        }

        // When showing all years, use the sorted entries to preserve order
        const yearGroups = new Map();
        
        // Get sorted entries directly from the sorting logic
        const entries = Object.entries(sortedGroupedProjects);
        entries.sort(([, groupA], [, groupB]) => {
            // Handle "Unknown Year" by putting it at the end
            if (groupA.year === 'Unknown Year') return 1;
            if (groupB.year === 'Unknown Year') return -1;
            // Sort by year in descending order
            return parseInt(groupB.year) - parseInt(groupA.year);
        });

        entries.forEach(([groupKey, group]) => {
            const { year } = group;

            if (!yearGroups.has(year)) {
                yearGroups.set(year, []);
            }

            yearGroups.get(year).push([groupKey, group]);
        });
        
        return yearGroups;
    }, [sortedGroupedProjects, selectedYear]);

    useEffect(() => {
        setOpenCategories(prevOpen => {
            const updatedOpen = { ...prevOpen };

            // Only add new years that don't exist yet
            Object.keys(finalGroupedProjects).forEach(groupKey => {
                if (!(groupKey in updatedOpen)) {
                    // Default to closed for all years initially
                    updatedOpen[groupKey] = false;
                }
            });

            // Open the most recent year by default (only when no years are currently open)
            const yearKeys = Object.keys(finalGroupedProjects);
            const hasAnyOpen = Object.values(updatedOpen).some(isOpen => isOpen);
            
            if (!hasAnyOpen && yearKeys.length > 0) {
                // Find the most recent year (first in sorted order)
                const mostRecentYear = yearKeys[0];
                updatedOpen[mostRecentYear] = true;
            }

            // Remove years that no longer exist
            Object.keys(updatedOpen).forEach(groupKey => {
                if (!(groupKey in finalGroupedProjects)) {
                    delete updatedOpen[groupKey];
                }
            });

            return updatedOpen;
        });
    }, [finalGroupedProjects, selectedYear]);

    const handleEditProject = (project) => {
        setEditingProject(project);
        setShowEditModal(true);
    };

    const handleViewDetails = (project) => {
        setSelectedProject({
            ...project,
            contracts: project.contracts ?? [],
            scope: project.scope ?? [],
            progress: project.progress ?? [],
            remarks: project.remarks ?? [],
            assignedEngineers: project.assignedEngineers ?? [],
            images: project.images ?? []
        });
        setShowImages(false);
    };

    const handleFilterChange = (status) => {
        setFilterStatus(status);
        stopAutoRefresh(); // Stop auto-refresh during filter
        router.get(route('projects.index'), {
            status: status === 'all' ? null : status,
            search: searchTerm || null,
            year: selectedYear === 'all' ? null : selectedYear
        }, { preserveState: true, replace: true });
    };

    const handleYearChange = (year) => {
        setSelectedYear(year);
        stopAutoRefresh(); // Stop auto-refresh during year change
        router.get(route('projects.index'), {
            status: filterStatus === 'all' ? null : filterStatus,
            search: searchTerm || null,
            year: year === 'all' ? null : year
        }, { preserveState: true, replace: true });
    };

    const handleSearch = (term) => {
        setSearchTerm(term);
        if (term.length >= 2 || term.length === 0) {
            stopAutoRefresh(); // Stop auto-refresh during search
            router.get(route('projects.index'), {
                status: filterStatus === 'all' ? null : filterStatus,
                search: term || null,
                year: selectedYear === 'all' ? null : selectedYear
            }, { preserveState: true, replace: true });
        }
    };

    // Toggle year expansion/collapse with smooth animation and guardrail to prevent empty UI
    const toggleYear = (year) => {
        if (animatingYears.has(year)) return;
        
        setExpandedYears(prev => {
            const newSet = new Set(prev);
            const isCurrentlyExpanded = newSet.has(year);

            if (isCurrentlyExpanded) {
                // Start closing animation
                setAnimatingYears(prev => new Set(prev).add(year));
                newSet.delete(year);
                
                // Remove from animating after animation completes
                setTimeout(() => {
                    setAnimatingYears(prev => {
                        const newAnimatingSet = new Set(prev);
                        newAnimatingSet.delete(year);
                        return newAnimatingSet;
                    });
                }, 400);
            } else {
                // Calculate height before opening
                const element = document.getElementById(`year-content-${year}`);
                if (element) {
                    const height = element.scrollHeight;
                    setYearHeights(prev => ({ ...prev, [year]: height }));
                    setAnimatingYears(prev => new Set(prev).add(year));
                    
                    // Open year
                    newSet.add(year);
                    
                    // Remove from animating after animation completes
                    setTimeout(() => {
                        setAnimatingYears(prev => {
                            const newAnimatingSet = new Set(prev);
                            newAnimatingSet.delete(year);
                            return newAnimatingSet;
                        });
                    }, 400);
                } else {
                    // Fallback if element not found
                    newSet.add(year);
                }
            }

            return newSet;
        });
    };

    const formatPeso = (amount) => {
        if (!amount || amount === 0) return '₱0.00';
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '-';
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return '!text-blue-700 !font-semibold text-xs';
            case 'ongoing': return '!text-green-700 !font-semibold text-xs';
            case 'pending': return '!text-red-700 !font-semibold text-xs';
            default: return '!text-gray-700 text-xs';
        }
    };

    const getStatusDisplay = (status) => {
        switch (status) {
            case 'completed': return 'Project Complete';
            case 'ongoing': return 'Project Ongoing';
            case 'pending': return 'Project Pending';
            default: return status;
        }
    };

    const updateProjectData = (updatedProject) => {
        if (!updatedProject || !updatedProject.id) return;
        
        setProjectData(prev =>
            prev.map(p => p.id === updatedProject.id ? updatedProject : p)
        );

        if (selectedProject?.id === updatedProject.id) handleViewDetails(updatedProject);
    };

    const addNewProject = (projectsData) => {
        // Handle both single project object and array of projects
        if (!projectsData) return;
        
        if (Array.isArray(projectsData)) {
            // If this looks like a complete server response (all projects), replace entirely
            // Backend returns complete project list after creation to ensure consistency
            setProjectData(projectsData);
        } else if (projectsData.id) {
            // Handle single project (backward compatibility)
            setProjectData(prev => {
                const existingProjectIds = new Set(prev.map(p => p.id));
                if (existingProjectIds.has(projectsData.id)) {
                    return prev.map(p => p.id === projectsData.id ? { ...p, ...projectsData } : p);
                }
                // Add new project at the beginning for newest-first ordering
                return [projectsData, ...prev];
            });
        }
    };


    const handleArchiveProject = async (project) => {
        const result = await showProjectArchiveConfirmation(project.title);
        
        if (result.isConfirmed) {
            try {
                const response = await axios.post(route('projects.archive', project.id));
                
                if (response.data.success) {
                    showSuccessMessage('Success', response.data.message);
                    // Update local project data
                    updateProjectData({ ...project, is_archive: true });
                    // Remove from current view after a short delay
                    setTimeout(() => {
                        setProjectData(prev => prev.filter(p => p.id !== project.id));
                    }, 1000);
                } else {
                    showErrorMessage('Error', response.data.message || 'Failed to archive project');
                }
            } catch (error) {
                showErrorMessage('Error', error.response?.data?.message || 'Failed to archive project');
            }
        }
    };

    const handleUnarchiveProject = async (project) => {
        try {
            const response = await axios.post(route('projects.unarchive', project.id));
            if (response.data.success) {
                showSuccessMessage('Success', response.data.message);
                // Update local project data
                updateProjectData({ ...project, is_archive: false });
            }
        } catch (error) {
            showErrorMessage('Error', error.response?.data?.message || 'Failed to unarchive project');
        }
    };

    const handleExport = async () => {
        try {
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            if (filterStatus !== 'all') params.append('status', filterStatus);
            if (selectedYear !== 'all') params.append('year', selectedYear);
            
            const url = route('projects.export') + (params.toString() ? '?' + params.toString() : '');
            
            const response = await axios.get(url, {
                responseType: 'blob',
                headers: {
                    'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                }
            });

            // Get filename from Content-Disposition header or create default
            const contentDisposition = response.headers['content-disposition'];
            let filename = 'projects_export_' + new Date().toISOString().slice(0, 19).replace(/[:-]/g, '') + '.xlsx';
            
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="(.+)"/);
                if (filenameMatch) {
                    filename = filenameMatch[1];
                }
            }

            // Create download link with correct MIME type
            const downloadUrl = window.URL.createObjectURL(new Blob([response.data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            }));
            
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            
            // Cleanup
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
            
        } catch (error) {
            showErrorMessage('Export failed', 'Please try again.');
        }
    };

    const handleImportSuccess = (result) => {
        // Show DPWH loading effect briefly
        setShowDPWHLoading(true);
        
        // Show loading for a moment, then display modern confirmation
        setTimeout(() => {
            // Hide loading first
            setShowDPWHLoading(false);
            
            // Show modern, compact confirmation
            showImportConfirmation(result.imported, result.failed || 0);
            
            // Refresh the projects list using Inertia
            setTimeout(() => {
                router.reload({
                    only: ['projects'],
                    preserveState: true,
                    preserveScroll: true,
                });
            }, 500); // Small delay to let the toast show first
        }, 1000); // Show loading for 1 second instead of 2
    };

    return (
        <PageLayout>
            <Head title="Manage Projects" />
            <style>{`
                .transition-max-height {
                    transition: max-height 0.3s ease-out;
                    overflow: hidden;
                }
                .category-content {
                    transition: height 0.3s ease-out, opacity 0.3s ease-out;
                    overflow: hidden;
                }
                .category-content.collapsed {
                    height: 0;
                    opacity: 0;
                }
                .category-content.expanded {
                    opacity: 1;
                }
                .year-content {
                    transition: max-height 0.4s ease-out, opacity 0.4s ease-out;
                    overflow: hidden;
                }
                .year-content.collapsed {
                    max-height: 0;
                    opacity: 0;
                }
                .year-content.expanded {
                    opacity: 1;
                }
                .year-header {
                    transition: all 0.3s ease-out;
                }
                .year-header:hover {
                    transform: translateX(2px);
                    box-shadow: 0 4px 12px rgba(1, 0, 102, 0.15);
                }
                .year-chevron {
                    transition: transform 0.3s ease-out;
                }
                /* Minimize scroll bar indicator */
                ::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
                }
                ::-webkit-scrollbar-track {
                    background: transparent;
                }
                ::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 3px;
                }
                ::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
                /* Firefox */
                * {
                    scrollbar-width: thin;
                    scrollbar-color: #cbd5e1 transparent;
                }
            `}</style>

            <div className="space-y-4">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 font-montserrat leading-none" style={{ fontSize: '2rem', lineHeight: '0.8' }}>
                            Manage Projects {selectedYear !== 'all' && `(${selectedYear})`}
                        </h2>
                    </div>
                    <div className="flex space-x-3" >
                        <button
                            onClick={() => setShowImportModal(true)}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold shadow-md hover:bg-blue-700 transition-all font-montserrat"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            Import
                        </button>
                        <button
                            onClick={handleExport}
                            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-semibold shadow-md hover:bg-green-700 transition-all font-montserrat"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Export
                        </button>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="inline-flex items-center px-4 py-2 bg-[#Eb3505] text-white rounded-xl text-sm font-semibold shadow-md hover:bg-[#d12e04] transition-all font-montserrat"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            New Project
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-end mb-6 gap-2" style={{marginTop: '3rem'}}> 
                    <div style={{ width: '400px', flexShrink: 0 }}>
                        <input
                            type="text"
                            placeholder="Search by contract ID or project title..."
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#Eb3505] focus:border-transparent font-montserrat"
                        />
                    </div>

                    <div className="w-44">
                        <select
                            value={filterStatus}
                            onChange={(e) => handleFilterChange(e.target.value)}
                            className="w-full pl-2 pr-4 py-2.5 border border-slate-200 rounded-xl shadow-sm 
                   focus:outline-none focus:ring-2 focus:ring-[#Eb3505] 
                   focus:border-transparent font-montserrat text-sm 
                   bg-white text-black hover:border-slate-300 transition"
                        >
                            <option value="all">All Status</option>
                            <option value="ongoing">Project Ongoing</option>
                            <option value="completed">Project Complete</option>
                            <option value="pending">Project Pending</option>
                        </select>
                    </div>

                    <div className="w-90">
                        <select
                            value={selectedYear}
                            onChange={(e) => handleYearChange(e.target.value)}
                            className="w-full pl-2 pr-4 py-2.5 border border-slate-200 rounded-xl shadow-sm 
                   focus:outline-none focus:ring-2 focus:ring-[#Eb3505] 
                   focus:border-transparent font-montserrat text-sm 
                   bg-white text-black hover:border-slate-300 transition"
                        >
                            <option value="all">All Years</option>
                            {availableYears.map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={() => {
                            handleSearch('');
                            handleFilterChange('all');
                            handleYearChange('all');
                        }}
                        className="px-4 py-2 bg-[#Eb3505] text-white rounded-xl font-montserrat hover:bg-[#c42a03] transition"
                    >
                        Clear
                    </button>
                </div>

                {/* Projects Grouped by Year */}
                <div className="mt-8 space-y-4">
                    {Array.from(projectsByYear.entries()).map(([year, yearData]) => (
                        <div key={year} className="space-y-1">
                            {/* Year Display - Full Width Flat Header */}
                            {selectedYear === 'all' && year && (
                                <div 
                                    onClick={() => toggleYear(year)}
                                    className={`w-full bg-[#010066] rounded-lg px-4 py-3 cursor-pointer hover:bg-[#020077] transition-colors flex items-center justify-between ${
                                        animatingYears.has(year) ? 'pointer-events-none' : ''
                                    }`}
                                >
                                    <h3 className="text-base font-bold text-white font-montserrat">
                                        {year}
                                    </h3>
                                    <svg 
                                        className={`w-5 h-5 text-white transform transition-transform duration-300 ${expandedYears.has(year) ? 'rotate-180' : ''}`}
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            )}

                            {/* Projects List for this year - Animated container */}
                            <div
                                id={`year-content-${year}`}
                                className={`year-content ${(selectedYear !== 'all' || expandedYears.has(year)) ? 'expanded' : 'collapsed'}`}
                                style={{
                                    maxHeight: (selectedYear !== 'all' || expandedYears.has(year)) ? '9999px' : '0'
                                }}
                            >
                                {((selectedYear === 'all' && year && expandedYears.has(year)) || selectedYear !== 'all') && (
                                    <div className="space-y-0">
                                        {yearData.map(([groupKey, group]) => {
                                            const { projects: projectsInYear } = group;
                                            
                                            if (projectsInYear.length === 0) {
                                                return (
                                                    <div key={groupKey} className="bg-white p-8 text-center rounded-xl">
                                                        <div className="flex flex-col items-center">
                                                            <svg className="w-12 h-12 text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                                            </svg>
                                                            <p className="text-slate-500 font-montserrat">No projects found</p>
                                                        </div>
                                                    </div>
                                                );
                                            }

                                            return (
                                                <div key={groupKey}>
                                                    {projectsInYear.map((project, index) => {
                                                        const contract = project.contracts?.[0] || {};

                                                        return (
                                                            <div 
                                                                key={project.id} 
                                                                className="bg-white rounded-xl p-4 hover:bg-slate-50 transition-colors cursor-pointer shadow-sm border border-slate-200"
                                                                onClick={() => handleViewDetails(project)}
                                                            >
                                                                <div className="flex items-start justify-between gap-4">
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-center gap-3 mb-2">
                                                                            <span className="text-sm font-medium text-slate-600">{project.contract_id || '-'}</span>
                                                                            <span className="text-xs px-2 py-1 rounded-full text-slate-600">
                                                                                {project.category?.name || 'Uncategorized'}
                                                                            </span>
                                                                        </div>
                                                                        <h4 className="font-semibold text-slate-900 text-sm mb-1 line-clamp-2">{project.title}</h4>
                                                                    </div>
                                                                    <div className="flex items-center gap-2 shrink-0">
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                e.preventDefault();
                                                                                handleEditProject(project);
                                                                            }}
                                                                            className="flex items-center gap-1.5 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium shadow-sm"
                                                                            title="Edit Project"
                                                                        >
                                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                            </svg>
                                                                            <span>Edit</span>
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                e.preventDefault();
                                                                                handleArchiveProject(project);
                                                                            }}
                                                                            className="flex items-center gap-1.5 px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium shadow-sm"
                                                                            title="Archive Project"
                                                                        >
                                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                                                            </svg>
                                                                            <span>Archive</span>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Page Number Pagination - Only show when filtering by specific year */}
                {selectedYear !== 'all' && projects?.data && projects.data.length > 0 && (
                    <div className="flex justify-center mt-8 mb-6">
                        <div className="flex items-center gap-2">
                            {/* Previous Button */}
                            <button
                                onClick={() => {
                                    if (projects.prev_page_url) {
                                        router.get(projects.prev_page_url, {}, { 
                                            preserveState: true, 
                                            preserveScroll: true 
                                        });
                                    }
                                }}
                                disabled={!projects.prev_page_url || loading}
                                className={`px-3 py-2 rounded-lg border transition font-montserrat text-sm font-medium ${
                                    projects.prev_page_url && !loading
                                        ? "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                                        : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                                }`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>

                            {/* Page Numbers */}
                            {Array.from({ length: projects.last_page || 1 }, (_, i) => i + 1).map(pageNum => (
                                <button
                                    key={pageNum}
                                    onClick={() => {
                                        const pageUrl = route('projects.index', { page: pageNum });
                                        router.get(pageUrl, {}, { 
                                            preserveState: true, 
                                            preserveScroll: false 
                                        });
                                    }}
                                    disabled={loading || pageNum === (projects.current_page || 1)}
                                    className={`px-4 py-2 rounded-lg border transition font-montserrat text-sm font-medium ${
                                        pageNum === (projects.current_page || 1)
                                            ? "bg-[#Eb3505] text-white border-[#Eb3505]"
                                            : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                                    } ${loading ? "cursor-not-allowed opacity-50" : ""}`}
                                >
                                    {pageNum}
                                </button>
                            ))}

                            {/* Next Button */}
                            <button
                                onClick={() => {
                                    if (projects.next_page_url) {
                                        router.get(projects.next_page_url, {}, { 
                                            preserveState: true, 
                                            preserveScroll: true 
                                        });
                                    }
                                }}
                                disabled={!projects.next_page_url || loading}
                                className={`px-3 py-2 rounded-lg border transition font-montserrat text-sm font-medium ${
                                    projects.next_page_url && !loading
                                        ? "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                                        : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                                }`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center mb-6">
                        <div className="inline-flex items-center gap-2 bg-slate-100 rounded-full px-6 py-3">
                            <svg className="animate-spin h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="text-slate-600 font-medium font-montserrat">
                                Loading projects...
                            </span>
                        </div>
                    </div>
                )}

                {/* No Results Message */}
                {!loading && projectData.length === 0 && (
                    <div className="text-center py-8">
                        <div className="inline-flex items-center gap-2 bg-slate-100 rounded-full px-6 py-3">
                            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-slate-600 font-medium font-montserrat">
                                No projects found
                            </span>
                        </div>
                    </div>
                )}

                {/* Create Project Modal */}
                <CreateProjectModal
                    show={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    categories={categories || []}
                    selectedYear={selectedYear}
                    updateProjectData={addNewProject}
                    availableYears={projects?.data && Array.from(new Set(projects.data.map(p => p.project_year).filter(Boolean))) || []}
                />

                {/* Edit Project Modal */}
                <EditProjectModal
                    show={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    project={editingProject}
                    categories={categories || []}
                    updateProjectData={updateProjectData}
                    availableYears={projects?.data && Array.from(new Set(projects.data.map(p => p.project_year).filter(Boolean))) || []}
                />

                {/* Project Details Modal - Separate Component */}
                <ProjectDetailsModal
                    show={selectedProject && !showImages}
                    project={selectedProject}
                    onClose={() => setSelectedProject(null)}
                    onShowImages={() => setShowImages(true)}
                />

                {/* Project Gallery Modal - Separate Component */}
                <ProjectGalleryModal
                    show={selectedProject && showImages}
                    project={selectedProject}
                    onClose={() => setSelectedProject(null)}
                    onBackToDetails={() => setShowImages(false)}
                />

                {/* Import Modal */}
                <ImportModal
                    show={showImportModal}
                    onClose={() => setShowImportModal(false)}
                    onImportSuccess={handleImportSuccess}
                />

                {/* DPWH Loading */}
                {showDPWHLoading && (
                    <DPWHLoading
                        show={showDPWHLoading}
                        message="Processing import results..."
                        subMessage="Please wait"
                        showBouncingDots={true}
                    />
                )}
            </div>
        </PageLayout>
    );
}