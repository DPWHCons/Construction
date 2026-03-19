import PageLayout from '@/Layouts/PageLayout';
import { Head, router } from '@inertiajs/react';
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { showErrorMessage, showSuccessMessage, showProjectArchiveConfirmation } from '@/Utils/alerts';
import CreateProjectModal from '@/Components/CreateProjectModal';
import EditProjectModal from '@/Components/EditProjectModal';
import ProjectDetailsModal from '@/Components/ProjectDetailsModal';
import ProjectGalleryModal from '@/Components/ProjectGalleryModal';
import ImportModal from '@/Components/ImportModal';
import DPWHLoading from '@/Components/DPWHLoading';
import useAutoRefresh from '@/Hooks/useAutoRefresh';

export default function ManageProject({ projects, categories, availableLetters }) {
    const urlParams = new URLSearchParams(window.location.search);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedYear, setSelectedYear] = useState('all');
    const [yearRangeStart, setYearRangeStart] = useState(new Date().getFullYear() - 2);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [selectedProject, setSelectedProject] = useState(null);
    const [showImages, setShowImages] = useState(false);
    const [openCategories, setOpenCategories] = useState({});
    const [selectedLetter, setSelectedLetter] = useState(urlParams.get('letter') || 'All');
    const [loading, setLoading] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [showDPWHLoading, setShowDPWHLoading] = useState(false);

    // Local project data for instant UI updates
    const [projectData, setProjectData] = useState(projects?.data || []);

    // Auto-refresh data every 30 seconds
    const { refresh } = useAutoRefresh(30000, {
        preserveScroll: true,
        preserveState: true,
    });

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

    // Group projects by year and category for transparency
    const groupedProjects = useMemo(() => {
        return projectData.reduce((groups, project) => {
            const categoryName = project.category?.name || 'Uncategorized';
            const year = project.project_year || 'Unknown Year';
            const groupKey = selectedYear === 'all' 
                ? `${year}__${categoryName}`   // use a delimiter unlikely to be in category name
                : categoryName;

            if (!groups[groupKey]) groups[groupKey] = { year, categoryName, projects: [] };
            groups[groupKey].projects.push(project);
            return groups;
        }, {});
    }, [projectData, selectedYear]);

    // Initialize categories - preserve user preferences or open new categories
    useEffect(() => {
        setOpenCategories(prevOpen => {
            const updatedOpen = { ...prevOpen };

            // Only add new categories that don't exist yet, default to closed
            Object.keys(groupedProjects).forEach(groupKey => {
                if (!(groupKey in updatedOpen)) {
                    updatedOpen[groupKey] = false; // Default to closed for new categories
                }
            });

            // Remove categories that no longer exist
            Object.keys(updatedOpen).forEach(groupKey => {
                if (!(groupKey in groupedProjects)) {
                    delete updatedOpen[groupKey];
                }
            });

            return updatedOpen;
        });
    }, [groupedProjects]);

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
        setSelectedLetter('All');
        router.get(route('projects.index'), {
            status: status === 'all' ? null : status,
            search: searchTerm || null,
            year: selectedYear === 'all' ? null : selectedYear
        }, { preserveState: true, replace: true });
    };

    const handleYearChange = (year) => {
        setSelectedYear(year);
        setSelectedLetter('All');
        router.get(route('projects.index'), {
            status: filterStatus === 'all' ? null : filterStatus,
            search: searchTerm || null,
            year: year === 'all' ? null : year
        }, { preserveState: true, replace: true });
    };

    const handleSearch = (term) => {
        setSearchTerm(term);
        setSelectedLetter('All');
        if (term.length >= 2 || term.length === 0) {
            router.get(route('projects.index'), {
                status: filterStatus === 'all' ? null : filterStatus,
                search: term || null,
                year: selectedYear === 'all' ? null : selectedYear
            }, { preserveState: true, replace: true });
        }
    };

    const handleLetterChange = (letter) => {
        if (loading) return;
        
        setSelectedLetter(letter);
        setLoading(true);
        
        router.get(route('projects.index'), {
            status: filterStatus === 'all' ? null : filterStatus,
            search: searchTerm || null,
            year: selectedYear === 'all' ? null : selectedYear,
            letter: letter === 'All' ? null : letter
        }, {
            preserveState: true,
            preserveScroll: false,
            onSuccess: (page) => {
                setProjectData(page.props.projects.data || []);
            },
            onFinish: () => {
                setLoading(false);
            }
        });
    };

    // Helper functions
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

    const toggleCategory = (category) => {
        setOpenCategories(prev => ({
            ...prev,
            [category]: !prev[category]
        }));
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
            // Replace entire project data with server response
            setProjectData(projectsData);
        } else if (projectsData.id) {
            // Handle single project (backward compatibility)
            setProjectData(prev => {
                const existingProjectIds = new Set(prev.map(p => p.id));
                if (existingProjectIds.has(projectsData.id)) {
                    return prev.map(p => p.id === projectsData.id ? projectsData : p);
                }
                // Add new project at the beginning for newest-first ordering
                return [projectsData, ...prev];
            });
        }
    };

    const getAvailableYears = () => {
        const years = [];
        const projectYears = new Set();
        
        // Extract only actual project_year values from database
        if (projectData) {
            projectData.forEach(project => {
                if (project.project_year && project.project_year !== 'Unknown Year') {
                    projectYears.add(String(project.project_year));
                }
            });
        }
        
        // Sort years in descending order (most recent first)
        const sortedYears = Array.from(projectYears).sort((a, b) => parseInt(b) - parseInt(a));
        years.push(...sortedYears);
        
        return years;
    };

    const getAvailableLetters = () => {
        const backendLetters = availableLetters || [];
        // Always include 'All' at the beginning and sort properly
        const allLetters = ['All', ...backendLetters.sort()];
        return [...new Set(allLetters)]; // Remove duplicates while preserving order
    };

    const getCompletionPercentage = (projects) => {
        if (!Array.isArray(projects) || projects.length === 0) return 0;
        const completed = projects.filter(p => p.status === 'completed').length;
        return Math.round((completed / projects.length) * 100);
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
        // Show DPWH loading effect
        setShowDPWHLoading(true);
        
        // Show loading for a moment, then display success modal
        setTimeout(() => {
            // Hide loading first
            setShowDPWHLoading(false);
            
            // Small delay before showing modal to ensure loading is hidden
            setTimeout(() => {
                showSuccessMessage('Import complete', `Successfully imported ${result.imported} projects.`).then(() => {
                    // Refresh the projects list using Inertia
                    router.reload({
                        only: ['projects'],
                        preserveState: true,
                        preserveScroll: true,
                    });
                });
            }, 100); // Small delay to ensure loading is fully hidden
        }, 2000); // Show loading for 2 seconds
    };

    return (
        <PageLayout>
            <Head title="Manage Projects" />
            <style>{`
                .transition-max-height {
                    transition: max-height 0.3s ease-out;
                    overflow: hidden;
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

                <div className="flex items-center justify-between mb-6" style={{marginTop: '3rem'}}> 
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => {
                                const letters = getAvailableLetters();
                                const currentIndex = letters.indexOf(selectedLetter);
                                if (currentIndex > 0) {
                                    handleLetterChange(letters[currentIndex - 1]);
                                }
                            }}
                            disabled={loading || getAvailableLetters().indexOf(selectedLetter) <= 0}
                            className={`p-2 rounded-lg border transition font-montserrat text-sm font-medium ${
                                !loading && getAvailableLetters().indexOf(selectedLetter) > 0
                                    ? "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                                    : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                            }`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        {getAvailableLetters().map(letter => (
                            <button
                                key={letter}
                                onClick={() => handleLetterChange(letter)}
                                disabled={loading}
                                className={`px-4 py-2 rounded-lg border transition font-montserrat text-sm font-medium ${
                                    selectedLetter === letter
                                        ? "bg-[#Eb3505] text-white border-[#Eb3505]"
                                        : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                                } ${loading ? "cursor-not-allowed opacity-50" : ""}`}
                            >
                                {letter}
                            </button>
                        ))}
                        <button
                            onClick={() => {
                                const letters = getAvailableLetters();
                                const currentIndex = letters.indexOf(selectedLetter);
                                if (currentIndex < letters.length - 1) {
                                    handleLetterChange(letters[currentIndex + 1]);
                                }
                            }}
                            disabled={loading || getAvailableLetters().indexOf(selectedLetter) >= getAvailableLetters().length - 1}
                            className={`p-2 rounded-lg border transition font-montserrat text-sm font-medium ${
                                !loading && getAvailableLetters().indexOf(selectedLetter) < getAvailableLetters().length - 1
                                    ? "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                                    : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                            }`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex-1 max-w-md">
                            <input
                                type="text"
                                placeholder="Search projects, contract ID, project ID, category..."
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
                                {getAvailableYears().map((year) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Clear Button */}
                        <button
                            onClick={() => {
                                handleSearch('');           // Clear search
                                handleFilterChange('all');  // Reset status
                                handleYearChange('all');    // Reset year
                                setSelectedLetter('All');   // Reset letter
                            }}
                            className="px-4 py-2 bg-[#Eb3505] text-white rounded-xl font-montserrat hover:bg-[#c42a03] transition"
                        >
                            Clear
                        </button>
                    </div>
                </div>

                {/* Projects Grouped by Category */}
                <div className="mt-8 space-y-4">
                    {Object.entries(groupedProjects).map(([groupKey, group]) => {
                        const { year, categoryName, projects: projectsInCategory } = group;
                        const displayName = categoryName;
                        const completionPercentage = getCompletionPercentage(projectsInCategory);

                        return (
                            <div key={groupKey} className="space-y-0">
                                {/* Year Display - Bookmark Style */}
                                {selectedYear === 'all' && year && (
                                    <div className="relative flex items-stretch">
                                        <div className="bg-[#010066] rounded-tl-lg rounded-bl-lg px-3 py-2 shadow-sm w-1/5 flex-shrink-0 flex items-center justify-center">
                                            <h3 className="text-sm font-bold text-white font-montserrat whitespace-nowrap">
                                                {year}
                                            </h3>
                                        </div>
                                        <div className="flex-1"></div>
                                    </div>
                                )}

                                {/* Folder Header */}
                                <div
                                    onClick={() => toggleCategory(groupKey)}
                                    className="flex items-center justify-between px-6 py-4 bg-slate-50 border border-slate-200 rounded-tr-xl rounded-br-xl rounded-bl-xl cursor-pointer shadow-sm hover:shadow-md transition-all duration-200"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 min-w-[300px]">
                                            <h3 className="font-bold text-slate-800 font-montserrat text-lg">{displayName}</h3>
                                            <div className="flex items-center gap-3 mt-1">
                                                <p className="text-slate-600 text-sm font-montserrat">{projectsInCategory.length} project{projectsInCategory.length !== 1 ? 's' : ''}</p>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-20 bg-slate-200 rounded-full h-2 overflow-hidden">
                                                        <div
                                                            className={`h-full transition-all duration-500 ${completionPercentage >= 80 ? 'bg-green-500' :
                                                                    completionPercentage >= 60 ? 'bg-blue-500' :
                                                                        completionPercentage >= 40 ? 'bg-yellow-500' :
                                                                            'bg-red-500'
                                                                }`}
                                                            style={{ width: `${completionPercentage}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-xs text-slate-600 font-medium">{completionPercentage}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <svg
                                        className={`w-5 h-5 text-slate-600 transform transition-transform duration-200 ${openCategories[groupKey] ? 'rotate-90' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>

                                {/* Projects Table for this Category */}
                                <div
                                    className="transition-max-height border border-slate-200 rounded-xl shadow-sm overflow-hidden"
                                    style={{ maxHeight: openCategories[groupKey] ? '1000px' : '0px' }}
                                >
                                    {projectsInCategory.length === 0 ? (
                                        <div className="bg-white p-8 text-center">
                                            <div className="flex flex-col items-center">
                                                <svg className="w-12 h-12 text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                                </svg>
                                                <p className="text-slate-600 font-montserrat">No projects found in this category</p>
                                                <p className="text-slate-500 text-sm font-montserrat mt-1">Try adjusting your search or filters</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm text-left bg-white">
                                                <thead className="bg-slate-50 border-b border-slate-200">
                                                    <tr>
                                                        <th className="px-6 py-4 font-semibold text-slate-700 uppercase tracking-wider">Contract ID</th>
                                                        <th className="px-6 py-4 font-semibold text-slate-700 uppercase tracking-wider">Project Name</th>
                                                        <th className="px-6 py-4 font-semibold text-slate-700 uppercase tracking-wider">Project ID</th>
                                                        <th className="px-6 py-4 font-semibold text-slate-700 uppercase tracking-wider">Year</th>
                                                        <th className="px-6 py-4 text-center font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {projectsInCategory.map((project, index) => {
                                                        const contract = project.contracts?.[0] || {};

                                                        return (
                                                            <tr key={`project-${project.id}-${index}`} className="hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-100" onClick={() => handleViewDetails(project)}>
                                                                <td className="px-6 py-4 whitespace-nowrap text-slate-900 font-medium">
                                                                    {project.contract_id || '-'}
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <div className="font-semibold text-slate-900 hover:text-blue-600 transition-colors break-words max-w-xs">{project.title}</div>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                                                                    {project.project_id || '-'}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                                                                    {project.project_year || '-'}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                                    <div className="flex items-center justify-center gap-3">
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                e.preventDefault();
                                                                                handleViewDetails(project);
                                                                            }}
                                                                            className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium shadow-sm"
                                                                        >
                                                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7z" />
                                                                            </svg>
                                                                            View
                                                                        </button>
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                e.preventDefault();
                                                                                handleEditProject(project);
                                                                            }}
                                                                            className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium shadow-sm"
                                                                        >
                                                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                            </svg>
                                                                            Edit
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                e.preventDefault();
                                                                                handleArchiveProject(project);
                                                                            }}
                                                                            className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium shadow-sm cursor-pointer"
                                                                            style={{ pointerEvents: 'auto' }}
                                                                        >
                                                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                                                            </svg>
                                                                            Archive
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>

                            </div>
                        );
                    })}
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
                    availableYears={getAvailableYears()}
                />

                {/* Edit Project Modal */}
                <EditProjectModal
                    show={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    project={editingProject}
                    categories={categories || []}
                    updateProjectData={updateProjectData}
                    availableYears={getAvailableYears()}
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