import PageLayout from '@/Layouts/PageLayout';
import { Head, router } from '@inertiajs/react';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { showErrorMessage, showSuccessMessage, showProjectArchiveConfirmation, showImportConfirmation } from '@/Utils/alerts';
import CreateProjectModal from '@/Components/CreateProjectModal';
import EditProjectModal from '@/Components/EditProjectModal';
import ProjectDetailsModal from '@/Components/ProjectDetailsModal';
import ProjectGalleryModal from '@/Components/ProjectGalleryModal';
import ImportModal from '@/Components/ImportModal';
import DPWHLoading from '@/Components/DPWHLoading';
import ProjectTableSkeleton from '@/Components/ProjectTableSkeleton';
import useAutoRefresh from '@/Hooks/useAutoRefresh';
import { MagnifyingGlassIcon, FunnelIcon, ArrowDownTrayIcon, ArrowUpTrayIcon, PlusIcon, PencilIcon, ArchiveBoxIcon, EyeIcon, ExclamationTriangleIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { ProjectManagementHelp, FilterHelp } from '@/Components/ContextualHelp';

export default function ManageProject({ projects, categories, availableLetters, availableYears = [], selectedYear: initialYear = 'all' }) {
    const urlParams = new URLSearchParams(window.location.search);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedYear, setSelectedYear] = useState(initialYear);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [selectedProject, setSelectedProject] = useState(null);
    const [showImages, setShowImages] = useState(false);
    const [openCategories, setOpenCategories] = useState({});
    const [expandedYears, setExpandedYears] = useState(() => {
        // Initialize with the most recent year from projects
        if (projects?.data && projects.data.length > 0) {
            const years = [...new Set(projects.data.map(p => p.project_year).filter(Boolean))]
                .sort((a, b) => b - a);
            if (years.length > 0) {
                return new Set([years[0]]);
            }
        }
        return new Set();
    });
    const [yearHeights, setYearHeights] = useState({});
    const [animatingYears, setAnimatingYears] = useState(new Set());
    const [loading, setLoading] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [showDPWHLoading, setShowDPWHLoading] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState({});
    const [itemsPerPage] = useState(10);
    const [projectData, setProjectData] = useState(projects?.data || []);
    const [allProjectData, setAllProjectData] = useState(projects?.data || []); 

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300); 

        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        let filtered = [...allProjectData];
        
        if (debouncedSearchTerm.trim()) {
            const searchLower = debouncedSearchTerm.toLowerCase();
            filtered = filtered.filter(project => 
                (project.contract_id && project.contract_id.toLowerCase().includes(searchLower)) ||
                (project.title && project.title.toLowerCase().includes(searchLower)) ||
                (project.category?.name && project.category.name.toLowerCase().includes(searchLower))
            );
        }

        // Apply status filter
        if (filterStatus !== 'all') {
            filtered = filtered.filter(project => project.status === filterStatus);
        }

        // Apply year filter
        if (selectedYear !== 'all') {
            filtered = filtered.filter(project => project.project_year === selectedYear);
        }

        setProjectData(filtered);
        setCurrentPage({});
        setLoading(false);
    }, [debouncedSearchTerm, filterStatus, selectedYear, allProjectData]);

    const dynamicAvailableYears = useMemo(() => {
        return [...new Set(projectData.map(p => p.project_year).filter(Boolean))]
            .sort((a, b) => b - a);
    }, [projectData]);

    const { refresh, stopAutoRefresh, startAutoRefresh } = useAutoRefresh(30000, {
        preserveScroll: true,
        preserveState: true,
    });

    useEffect(() => {
        stopAutoRefresh();
        return () => {
            startAutoRefresh();
        };
    }, []);

    useEffect(() => {
        setShowDPWHLoading(false);
        return () => {
            setShowDPWHLoading(false);
        };
    }, []);

    useEffect(() => {
        if (!projects?.data) return;
        setAllProjectData(prev => {
            const map = new Map(prev.map(p => [p.id, p]));

            projects.data.forEach(p => {
                map.set(p.id, p);
            });

            return Array.from(map.values());
        });
        // Set initial loading to false after data is loaded
        setIsInitialLoading(false);
    }, [projects]);

    useEffect(() => {
        setSelectedYear(initialYear || 'all');
        setCurrentPage({});
    }, [initialYear]);

    // Reset pagination when search or filter changes
    useEffect(() => {
        setCurrentPage({});
    }, [searchTerm, filterStatus]);

    // Project Table Row component
    const ProjectTableRow = ({ project, onEdit, onArchive, onView, index }) => {
        return (
            <tr 
                className={`${index % 2 === 0 ? 'bg-white' : 'bg-purple-50'} hover:bg-purple-100 transition-colors cursor-pointer border-b border-purple-100 last:border-b-0`}
                onClick={() => onView(project)}
                style={{ animationDelay: `${index * 50}ms` }}
            >
                <td className="px-6 py-4 text-sm font-mono text-slate-700 font-semibold">
                    {project.contract_id || 'N/A'}
                </td>
                <td className="px-6 py-4 text-sm text-slate-900 font-medium">
                    <div className="whitespace-normal" title={project.title}>
                        {project.title}
                    </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                    {project.category?.name || '-'}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                    {project.project_year || '-'}
                </td>
                <td className="px-6 py-4 text-sm">
                    <div className="flex flex-col items-center gap-2 justify-center">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                onView(project);
                            }}
                            className="px-1 py-2 bg-white text-green-600 hover:bg-green-50 transition-colors shadow text-xs font-bold w-full border border-green-600 rounded-lg flex items-center justify-center gap-2"
                            title="View Details"
                        >
                            <EyeIcon className="w-4 h-4 text-green-600" />
                            <span className="text-green-600">View</span>
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                onEdit(project);
                            }}
                            className="px-1 py-2 bg-white text-blue-600 hover:bg-blue-50 transition-colors shadow text-xs font-bold w-full border border-blue-600 rounded-lg flex items-center justify-center gap-2"
                            title="Edit Project"
                        >
                            <PencilIcon className="w-4 h-4 text-blue-600" />
                            <span className="text-blue-600">Edit</span>
                        </button>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                onArchive(project);
                            }}
                            className="px-1 py-2 bg-white hover:bg-red-50 transition-colors shadow text-xs font-bold w-full border rounded-lg flex items-center justify-center gap-2"
                            style={{ color: '#Eb3505' }}
                            title="Archive Project"
                        >
                            <ArchiveBoxIcon className="w-4 h-4" style={{ color: '#Eb3505' }} />
                            <span style={{ color: '#Eb3505' }}>Archive</span>
                        </button>
                    </div>
                </td>
            </tr>
        );
    };
    const getContractLast3 = (contractId) => {
        if (!contractId) return 0;
        const match = contractId.match(/(\d{3})$/);
        return match ? parseInt(match[1]) : 0;
    };

    // Pagination helper functions
    const getTotalPages = (projectCount) => {
        return Math.ceil(projectCount / itemsPerPage);
    };

    const getCurrentPageProjects = (projects, year) => {
        const page = currentPage[year] || 1;
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return projects.slice(startIndex, endIndex);
    };

    const handlePageChange = (year, newPage) => {
        setCurrentPage(prev => ({
            ...prev,
            [year]: newPage
        }));
    };

    const renderPaginationControls = (year, totalProjects) => {
        const totalPages = getTotalPages(totalProjects);
        const current = currentPage[year] || 1;

        if (totalPages <= 1) return null;

        return (
            <div className="flex items-center justify-center gap-2 mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <button
                    onClick={() => handlePageChange(year, current - 1)}
                    disabled={current === 1}
                    className="px-3 py-1 text-sm bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Previous
                </button>
                
                <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                        <button
                            key={pageNum}
                            onClick={() => handlePageChange(year, pageNum)}
                            className={`w-8 h-8 text-sm rounded-md transition-colors ${
                                pageNum === current
                                    ? 'bg-[#eb3505] text-white'
                                    : 'bg-white border border-slate-300 hover:bg-slate-50'
                            }`}
                        >
                            {pageNum}
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => handlePageChange(year, current + 1)}
                    disabled={current === totalPages}
                    className="px-3 py-1 text-sm bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Next
                </button>
                
                <span className="ml-4 text-xs text-slate-600">
                    Showing {((current - 1) * itemsPerPage) + 1}-{Math.min(current * itemsPerPage, totalProjects)} of {totalProjects} projects
                </span>
            </div>
        );
    };

    // Group projects by year and sort by contract ID last 3 digits
    const groupedProjects = useMemo(() => {
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
            if (groupA.year === 'Unknown Year') return 1;
            if (groupB.year === 'Unknown Year') return -1;
            return parseInt(groupB.year) - parseInt(groupA.year);
        });
        
        return Object.fromEntries(entries);
    }, [sortedGroupedProjects, selectedYear]);

    const projectsByYear = useMemo(() => {
        if (selectedYear !== 'all') {
            return new Map([[selectedYear, Object.entries(finalGroupedProjects)]]);
        }

        const yearGroups = new Map();

        Object.entries(finalGroupedProjects).forEach(([groupKey, group]) => {
            const { year } = group;

            if (!yearGroups.has(year)) {
                yearGroups.set(year, []);
            }

            yearGroups.get(year).push([groupKey, group]);
        });

        return yearGroups;
    }, [finalGroupedProjects, selectedYear]);

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
                const mostRecentYear = yearKeys[0];
                updatedOpen[mostRecentYear] = true;
            }

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

    const handleFilterChange = useCallback((status) => {
        setFilterStatus(status);
    }, []);

    const handleYearChange = useCallback((year) => {
        setSelectedYear(year);
    }, []);

    const handleSearch = useCallback((term) => {
        setSearchTerm(term);
    }, []);

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
        
        setAllProjectData(prev =>
            prev.map(p => p.id === updatedProject.id ? updatedProject : p)
        );

        if (selectedProject?.id === updatedProject.id) handleViewDetails(updatedProject);
    };

    const addNewProject = (projectsData) => {
        if (!projectsData) return;

        setAllProjectData(prev => {
            const map = new Map(prev.map(p => [p.id, p]));

            if (Array.isArray(projectsData)) {
                projectsData.forEach(p => map.set(p.id, p));
            } else if (projectsData.id) {
                map.set(projectsData.id, projectsData);
            }

            return Array.from(map.values());
        });
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
        setShowDPWHLoading(true);
                setTimeout(() => {
            setShowDPWHLoading(false);
            
            showImportConfirmation(result.imported, result.failed || 0);
            
            setTimeout(() => {
                router.reload({
                    only: ['projects'],
                    preserveState: true,
                    preserveScroll: true,
                });
            }, 500);
        }, 1000);
    };

    return (
        <PageLayout>
            <Head title="Manage Projects" />
            <style>{`
                .transition-max-height {
                    overflow: hidden;
                }
                .category-content {
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
                }
                .year-header:hover {
                    box-shadow: 0 4px 12px rgba(1, 0, 102, 0.15);
                }
                .year-chevron {
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

            <div className="space-y-4 font-montserrat">
                {/* Enhanced Header Section */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div>
                            <h2 className="text-3xl font-bold text-slate-900 font-montserrat leading-none" style={{ fontSize: '2rem', lineHeight: '0.8' }}>
                                Manage Projects {selectedYear !== 'all' && `(${selectedYear})`}
                            </h2>
                            <p className="text-slate-500 mt-2 font-montserrat text-sm">
                                {projectData.length} projects found • Click any project to view details
                            </p>
                        </div>
                        <ProjectManagementHelp />
                    </div>
                    <div className="flex space-x-3" >
                        <button
                            onClick={() => setShowImportModal(true)}
                            className="inline-flex items-center px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold shadow-md hover:bg-blue-700 transition-all font-montserrat hover:shadow-lg"
                        >
                            <ArrowUpTrayIcon className="w-4 h-4 mr-2" />
                            Import
                        </button>
                        <button
                            onClick={handleExport}
                            className="inline-flex items-center px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold shadow-md hover:bg-green-700 transition-all font-montserrat hover:shadow-lg"
                        >
                            <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                            Export
                        </button>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="inline-flex items-center px-4 py-2.5 bg-[#Eb3505] text-white rounded-xl text-sm font-semibold shadow-md hover:bg-[#d12e04] transition-all font-montserrat hover:shadow-lg"
                        >
                            <PlusIcon className="w-4 h-4 mr-2" />
                            New Project
                        </button>
                    </div>
                </div>

                {/* Enhanced Search and Filter Section */}
                <div className="flex justify-end">
                    <div className="flex items-center gap-3" style={{ minWidth: '600px' }}>
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="Search by contract ID, project title, or category..."
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#Eb3505] focus:border-transparent font-montserrat text-sm"
                            />
                        </div>

                        <select
                            value={filterStatus}
                            onChange={(e) => handleFilterChange(e.target.value)}
                            className="w-40 px-4 py-2.5 border border-slate-200 rounded-xl shadow-sm 
               focus:outline-none focus:ring-2 focus:ring-[#Eb3505] 
               focus:border-transparent font-montserrat text-sm 
               bg-white text-black hover:border-slate-300 transition flex-shrink-0"
                        >
                            <option value="all">All Status</option>
                            <option value="ongoing">Project Ongoing</option>
                            <option value="completed">Project Complete</option>
                            <option value="pending">Project Pending</option>
                        </select>
                        
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setFilterStatus('all');
                                setSelectedYear('all');
                            }}
                            className="text-sm text-red-600 hover:text-red-800 font-medium flex items-center gap-1 px-3 py-2.5 rounded-lg border border-red-200 bg-white hover:bg-red-100 transition-all duration-200 whitespace-nowrap shadow-sm hover:shadow flex-shrink-0"
                        >
                            Clear All
                        </button>
                    </div>
                </div>

                {/* Year Pill Tabs */}
                {selectedYear === 'all' && (
                    <div className="mb-6">
                        <div className="flex items-center gap-2 flex-wrap">
                            {Array.from(projectsByYear.entries())
                                .sort(([yearA], [yearB]) => {
                                    // Sort years in descending order (recent first)
                                    if (yearA === 'Unknown Year') return 1;
                                    if (yearB === 'Unknown Year') return -1;
                                    return parseInt(yearB) - parseInt(yearA);
                                })
                                .map(([year, yearData]) => {
                                    const isActive = expandedYears.has(year);
                                    
                                    return (
                                        <button
                                            key={year}
                                            onClick={() => {
                                                setExpandedYears(prev => {
                                                    const newSet = new Set();
                                                    newSet.add(year);
                                                    return newSet;
                                                });
                                                setCurrentPage({});
                                            }}
                                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                                                isActive
                                                    ? 'text-white shadow-md'
                                                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                                            }`}
                                            style={isActive ? { backgroundColor: '#eb3505' } : {}}
                                        >
                                            {year}
                                        </button>
                                    );
                                })}
                        </div>
                    </div>
                )}

                {/* Projects Display */}
                <div className="space-y-4">
                    {/* Show skeleton during initial load */}
                    {isInitialLoading ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-8 bg-slate-200 rounded w-32 animate-pulse"></div>
                                <div className="h-px bg-slate-200 flex-1"></div>
                            </div>
                            <ProjectTableSkeleton rows={10} />
                        </div>
                    ) : (
                        Array.from(projectsByYear.entries())
                            .sort(([yearA], [yearB]) => {
                                // Sort years in descending order (recent first)
                                if (yearA === 'Unknown Year') return 1;
                                if (yearB === 'Unknown Year') return -1;
                                return parseInt(yearB) - parseInt(yearA);
                            })
                            .map(([year, yearData]) => {
                                const shouldShow = selectedYear !== 'all' || expandedYears.has(year) || debouncedSearchTerm.trim();
                                
                                if (!shouldShow) return null;

                                return (
                                    <div key={year} className="space-y-4">
                                        {selectedYear === 'all' && (
                                            <div className="flex items-center gap-3 mb-4">
                                                <h3 className="text-xl font-bold text-slate-900 font-montserrat">
                                                    {year} Projects 
                                                    <span className="text-sm font-normal text-slate-500 ml-2">
                                                        ({yearData.reduce((count, [, group]) => count + group.projects.length, 0)} projects) 
                                                    </span>
                                                </h3>
                                                <div className="h-px bg-slate-200 flex-1"></div>
                                            </div>
                                        )}

                                        <div className="space-y-0">
                                            {yearData.map(([groupKey, group]) => {
                                                const { projects: projectsInYear } = group;
                                                
                                                // Show skeleton during loading/searching
                                                if (loading && projectsInYear.length > 0) {
                                                    return (
                                                        <div key={groupKey} className="space-y-4">
                                                            <ProjectTableSkeleton rows={Math.min(5, projectsInYear.length)} />
                                                        </div>
                                                    );
                                                }
                                                
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

                                                const displayYear = selectedYear === 'all' ? year : selectedYear;
                                                const paginatedProjects = getCurrentPageProjects(projectsInYear, displayYear);

                                                return (
                                                    <div key={groupKey} className="bg-white rounded-xl border border-purple-200 overflow-hidden shadow-md">
                                                        <table className="w-full table-fixed">
                                                            <thead style={{ backgroundColor: '#Eb3505' }}>
                                                                <tr>
                                                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Contract ID</th>
                                                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Project Title</th>
                                                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Category</th>
                                                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Year</th>
                                                                    <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Actions</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-purple-100">
                                                                {paginatedProjects.map((project, index) => (
                                                                    <ProjectTableRow
                                                                        key={project.id}
                                                                        project={project}
                                                                        onEdit={handleEditProject}
                                                                        onArchive={handleArchiveProject}
                                                                        onView={handleViewDetails}
                                                                        index={index}
                                                                    />
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                        
                                                        {/* Add pagination controls for this year */}
                                                        {renderPaginationControls(displayYear, projectsInYear.length)}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })
                    )}
                </div>

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

                {/* No Results Message - Only show when not initial loading and not searching */}
                {!isInitialLoading && !loading && projectData.length === 0 && (
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
                    availableYears={dynamicAvailableYears}
                />

                {/* Edit Project Modal */}
                <EditProjectModal
                    show={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    project={editingProject}
                    categories={categories || []}
                    updateProjectData={updateProjectData}
                    availableYears={dynamicAvailableYears}
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