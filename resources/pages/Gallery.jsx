import PageLayout from '@/Layouts/PageLayout';
import { Head } from '@inertiajs/react';
import { useState, useEffect, useMemo } from 'react';
import useAutoRefresh from '@/Hooks/useAutoRefresh';

export default function Gallery({ projects }) {
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
    const [viewMode, setViewMode] = useState('grid'); // grid, masonry, timeline
    const [selectedProject, setSelectedProject] = useState('all');
    const [selectedYear, setSelectedYear] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedProjects, setExpandedProjects] = useState(new Set());

    // Auto-refresh gallery data every 30 seconds
    useAutoRefresh(30000, {
        preserveScroll: true,
        preserveState: true,
    });

    // Helper function to extract year from project - returns raw database value
    const getProjectYear = (project) => {
        if (!project.project_year) return "Unknown Year";
        // Return the exact database value without any manipulation
        return project.project_year;
    };

    // Flatten all images for easier navigation
    const allImages = projects.flatMap((project, projectIndex) =>
        project.images.map(image => ({
            ...image,
            projectTitle: project.title,
            projectCategory: project.category?.name || 'Uncategorized',
            projectStatus: project.status,
            projectYear: getProjectYear(project) || 'Unknown Year',
            projectId: project.project_id || 'N/A',
            contractId: project.contract_id || 'N/A',
            projectIndex,
            globalIndex: null // Will be set below
        }))
    );

    // Set global indices for navigation
    allImages.forEach((image, index) => {
        image.globalIndex = index;
    });

    // Filter images based on selected project, year, and search
    const filteredImages = allImages.filter(image => {
        const matchesProject = selectedProject === 'all' || image.projectTitle === selectedProject;
        const matchesYear = selectedYear === 'all' || String(image.projectYear) === String(selectedYear);
        const matchesSearch = !searchTerm || 
            image.projectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
            image.caption?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesProject && matchesYear && matchesSearch;
    });

    const openImageModal = (projectIndex, imageIndex) => {
        const image = allImages.find(img => img.projectIndex === projectIndex && img.globalIndex === imageIndex);
        if (image) {
            setCurrentProjectIndex(projectIndex);
            setCurrentImageIndex(imageIndex);
            setSelectedImage(image);
        }
    };

    const toggleProjectExpansion = (projectId) => {
        setExpandedProjects(prev => {
            const newSet = new Set(prev);
            if (newSet.has(projectId)) {
                newSet.delete(projectId);
            } else {
                newSet.add(projectId);
            }
            return newSet;
        });
    };

    const closeModal = () => {
        setSelectedImage(null);
    };

    const navigateImage = (direction) => {
        if (!filteredImages || filteredImages.length === 0) return;
        
        // Find current image index with multiple fallback methods
        let currentIndex = -1;
        
        // Method 1: Direct object comparison
        currentIndex = filteredImages.findIndex(img => img === selectedDocument);
        
        // Method 2: Compare by image_path
        if (currentIndex === -1 && selectedDocument?.image_path) {
            currentIndex = filteredImages.findIndex(img => img.image_path === selectedDocument.image_path);
        }
        
        // Method 3: Compare by url
        if (currentIndex === -1 && selectedDocument?.url) {
            currentIndex = filteredImages.findIndex(img => img.url === selectedDocument.url);
        }
        
        // Method 4: Compare by id if available
        if (currentIndex === -1 && selectedDocument?.id) {
            currentIndex = filteredImages.findIndex(img => img.id === selectedDocument.id);
        }
        
        // If still not found, use first image
        if (currentIndex === -1) {
            currentIndex = 0;
        }
        
        let newIndex = currentIndex + direction;
        
        // Wrap around for circular navigation
        if (newIndex < 0) newIndex = filteredImages.length - 1;
        if (newIndex >= filteredImages.length) newIndex = 0;
        
        setSelectedImage(filteredImages[newIndex]);
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!selectedDocument) return;
            
            if (e.key === 'ArrowRight') navigateImage(1);
            if (e.key === 'ArrowLeft') navigateImage(-1);
            if (e.key === 'Escape') closeModal();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedDocument]);

    const getImageDimensions = (index) => {
        // Create varied image sizes for masonry effect
        const sizes = [
            'col-span-2 row-span-2', // Large square
            'col-span-1 row-span-2', // Tall portrait
            'col-span-2 row-span-1', // Wide landscape
            'col-span-1 row-span-1', // Small square
        ];
        return sizes[index % sizes.length];
    };

    const uniqueProjects = ['all', ...new Set(projects.map(p => p.title))];

    // Get available years for filter - only extract actual years from database
    const getAvailableYears = () => {
        const years = [];
        const projectYears = new Set();
        
        // Extract only actual project_year values from database
        projects.forEach(project => {
            if (project.project_year && project.project_year !== 'Unknown Year') {
                projectYears.add(String(project.project_year));
            }
        });
        
        // Sort years in descending order (most recent first)
        const sortedYears = Array.from(projectYears).sort((a, b) => parseInt(b) - parseInt(a));
        years.push(...sortedYears);
        
        return years;
    };

    // Clear all filters
    const clearAllFilters = () => {
        setSearchTerm('');
        setSelectedProject('all');
        setSelectedYear('all');
    };

    // Group projects by year and category for transparency
    const groupedProjects = useMemo(() => {
        return projects.reduce((groups, project) => {
            const categoryName = project.category?.name || 'Uncategorized';
            const year = getProjectYear(project) || 'Unknown Year';
            const groupKey = `${year}__${categoryName}`;   // use a delimiter unlikely to be in category name

            if (!groups[groupKey]) groups[groupKey] = { year, categoryName, projects: [] };
            groups[groupKey].projects.push(project);
            return groups;
        }, {});
    }, [projects]);

    return (
        <PageLayout>
            <Head title="Gallery" />
            <div className="py-20">
                <h1 className="text-3xl font-bold text-slate-900 font-montserrat leading-none" style={{ fontSize: '2rem', lineHeight: '0.8' }}>Gallery</h1>
            </div>
            
            <div className="min-h-screen">
                {/* Header */}
                <div className="sticky top-0 z-30">
                    
                    <div className="max-w-7xl mx-auto px-6 py-4">
                        <div className="flex justify-end"> 
                            
                            {/* Controls */}
                            <div className="flex items-center">
                                {/* Search */}
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search photos..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#Eb3505] focus:border-transparent" style={{marginRight: '1rem', width: '200px', minWidth: '300px'}}
                                    />
                                </div>

                                {/* Project Filter */}
                                <select
                                    value={selectedProject}
                                    onChange={(e) => setSelectedProject(e.target.value)}
                                    className="px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#Eb3505] focus:border-transparent w-48" style={{marginRight: '1rem', width: '200px', minWidth: '200px'}}
                                >
                                    {uniqueProjects.map(project => (
                                        <option key={project} value={project}>
                                            {project === 'all' ? 'All Projects' : project}
                                        </option>
                                    ))}
                                </select>

                                {/* Year Filter */}
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                    className="px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#Eb3505] focus:border-transparent" style={{marginRight: '1rem', width: '180px', minWidth: '180px'}}
                                >
                                    <option value="all">All Years</option>
                                    {getAvailableYears().map(year => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    ))}
                                </select>

                                {/* Clear Button */}
                                <button
                                    onClick={clearAllFilters}
                                    className="h-8 px-4 text-sm bg-[#Eb3505] text-white rounded-md hover:bg-[#c42a03] transition font-montserrat font-medium"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Gallery Content */}
                
                <div className="max-w-7xl mx-auto px-6 py-8">
                    {filteredImages.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 rounded-full mb-6">
                                <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-slate-900 mb-2">No photos found</h3>
                        </div>
                    ) : (
                        <>
                            {viewMode === 'grid' ? (
                                /* Grid View - Grouped by Year and Category */
                                <div className="space-y-12">
                                    {Object.entries(groupedProjects).map(([groupKey, group]) => {
                                        const { year, categoryName, projects: projectsInGroup } = group;
                                        
                                        // Filter projects in this group based on search, selected project, and selected year
                                        const filteredProjectsInGroup = projectsInGroup.filter(project => {
                                            if (selectedProject !== 'all' && project.title !== selectedProject) return false;
                                            if (selectedYear !== 'all' && String(getProjectYear(project)) !== String(selectedYear)) return false;
                                            return project.images.some(img => 
                                                !searchTerm || 
                                                project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                img.caption?.toLowerCase().includes(searchTerm.toLowerCase())
                                            );
                                        });

                                        if (filteredProjectsInGroup.length === 0) return null;

                                        return (
                                            <div key={groupKey} className="space-y-0">
                                                {/* Year Display - Bookmark Style (only show if not Unknown Year) */}
                                                {year !== 'Unknown Year' && (
                                                    <div className="relative flex items-stretch">
                                                        <div className="bg-[#010066] rounded-tl-lg rounded-bl-lg px-3 py-2 shadow-sm w-1/5 flex-shrink-0 flex items-center justify-center">
                                                            <h3 className="text-sm font-bold text-white font-montserrat whitespace-nowrap">
                                                                {year}
                                                            </h3>
                                                        </div>
                                                        <div className="flex-1"></div>
                                                    </div>
                                                )}

                                                {filteredProjectsInGroup.map((project) => {
                                                    const projectImages = project.images.filter(img =>
                                                        !searchTerm || 
                                                        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                        img.caption?.toLowerCase().includes(searchTerm.toLowerCase())
                                                    );

                                                    if (projectImages.length === 0) return null;

                                                    return (
                                                        <div key={project.id} className="bg-white border border-slate-200 overflow-hidden shadow-sm">
                                                            {/* Project Header */}
                                                            <div 
                                                                onClick={() => toggleProjectExpansion(project.id)}
                                                                className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200 cursor-pointer shadow-sm hover:shadow-md transition-all duration-200"
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex-1">
                                                                        <h3 className="text-xl font-bold text-slate-900 font-montserrat">
                                                                            {project.title}
                                                                        </h3>
                                                                        <div className="flex items-center gap-4 mt-2">
                                                                            <span className="text-sm text-slate-500">
                                                                                {project.category?.name || 'Uncategorized'}
                                                                            </span>
                                                                            <span className="text-sm text-slate-500 font-medium">
                                                                                {projectImages.length} {projectImages.length === 1 ? 'photo' : 'photos'}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <button
                                                                            onClick={() => toggleProjectExpansion(project.id)}
                                                                            className="cursor-pointer hover:text-slate-600 transition-colors"
                                                                        >
                                                                            <svg 
                                                                                className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
                                                                                    expandedProjects.has(project.id) ? 'rotate-180' : ''
                                                                                }`} 
                                                                                fill="none" 
                                                                                stroke="currentColor" 
                                                                                viewBox="0 0 24 24"
                                                                            >
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                                            </svg>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Images Grid */}
                                                            <div
                                                                className="transition-max-height border border-slate-200 rounded-xl shadow-sm overflow-hidden"
                                                                style={{ maxHeight: expandedProjects.has(project.id) ? '1000px' : '0px' }}
                                                            >
                                                                <div className="p-4">
                                                                    <div className="flex flex-wrap gap-3">
                                                                    {projectImages.map((image, imageIndex) => (
                                                                        <div
                                                                            key={image.id}
                                                                            className="group relative w-20 h-20 overflow-hidden rounded cursor-pointer bg-slate-50 hover:shadow-md transition-all duration-300 hover:scale-105 flex-shrink-0"
                                                                            onClick={() => openImageModal(
                                                                                allImages.findIndex(img => img.id === image.id && img.projectTitle === project.title),
                                                                                allImages.findIndex(img => img.id === image.id && img.projectTitle === project.title)
                                                                            )}
                                                                        >
                                                                            <img
                                                                                src={image.url || `/storage/${image.image_path}`}
                                                                                alt={image.caption || `Project image ${imageIndex + 1}`}
                                                                                className="w-full h-full object-cover"
                                                                                loading="lazy"
                                                                                width="96"
                                                                                height="96"
                                                                            />
                                                                            
                                                                            {/* Hover Overlay */}
                                                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                                                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-center">
                                                                                    <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                                                                    </svg>
                                                                                </div>
                                                                            </div>

                                                                            {/* Date Badge */}
                                                                            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                                                <div className="bg-black/60 backdrop-blur-sm text-white text-xs px-1 py-0.5 rounded">
                                                                                    {new Date(image.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                /* Masonry View - Grouped by Year and Category */
                                <div className="space-y-12">
                                    {Object.entries(groupedProjects).map(([groupKey, group]) => {
                                        const { year, categoryName, projects: projectsInGroup } = group;
                                        
                                        // Filter projects in this group based on search, selected project, and selected year
                                        const filteredProjectsInGroup = projectsInGroup.filter(project => {
                                            if (selectedProject !== 'all' && project.title !== selectedProject) return false;
                                            if (selectedYear !== 'all' && String(getProjectYear(project)) !== String(selectedYear)) return false;
                                            return project.images.some(img => 
                                                !searchTerm || 
                                                project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                img.caption?.toLowerCase().includes(searchTerm.toLowerCase())
                                            );
                                        });

                                        if (filteredProjectsInGroup.length === 0) return null;

                                        return (
                                            <div key={groupKey} className="space-y-0">
                                                {/* Year Display - Bookmark Style (only show if not Unknown Year) */}
                                                {year !== 'Unknown Year' && (
                                                    <div className="relative flex items-stretch">
                                                        <div className="bg-[#010066] rounded-tl-lg rounded-bl-lg px-3 py-2 shadow-sm w-1/5 flex-shrink-0 flex items-center justify-center">
                                                            <h3 className="text-sm font-bold text-white font-montserrat whitespace-nowrap">
                                                                {year}
                                                            </h3>
                                                        </div>
                                                        <div className="flex-1"></div>
                                                    </div>
                                                )}

                                                {filteredProjectsInGroup.map((project) => {
                                                    const projectImages = project.images.filter(img =>
                                                        !searchTerm || 
                                                        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                        img.caption?.toLowerCase().includes(searchTerm.toLowerCase())
                                                    );

                                                    if (projectImages.length === 0) return null;

                                                    return (
                                                        <div key={project.id} className="bg-white border border-slate-200 overflow-hidden shadow-sm">
                                                            {/* Project Header */}
                                                            <div 
                                                                onClick={() => toggleProjectExpansion(project.id)}
                                                                className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200 cursor-pointer shadow-sm hover:shadow-md transition-all duration-200"
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <div>
                                                                        <h3 className="text-xl font-bold text-slate-900 font-montserrat">
                                                                            {project.title}
                                                                        </h3>
                                                                        <div className="flex items-center gap-4 mt-2">
                                                                            <span className="text-sm text-slate-500">
                                                                                {project.category?.name || 'Uncategorized'}
                                                                            </span>
                                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                                project.status === 'completed' 
                                                                                    ? 'bg-blue-100 text-blue-800' 
                                                                                    : project.status === 'ongoing'
                                                                                    ? 'bg-orange-100 text-orange-800'
                                                                                    : 'bg-amber-100 text-amber-800'
                                                                            }`}>
                                                                                {project.status}
                                                                            </span>
                                                                            <span className="text-sm text-slate-500 font-medium">
                                                                                {projectImages.length} {projectImages.length === 1 ? 'photo' : 'photos'}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                                        </svg>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Masonry Images */}
                                                            <div className="p-4">
                                                                <div className="flex flex-wrap gap-3">
                                                                    {projectImages.map((image, imageIndex) => (
                                                                        <div
                                                                            key={image.id}
                                                                            className="group relative w-20 h-24 overflow-hidden rounded cursor-pointer bg-slate-50 hover:shadow-md transition-all duration-300 hover:scale-105 flex-shrink-0"
                                                                            onClick={() => openImageModal(
                                                                                allImages.findIndex(img => img.id === image.id && img.projectTitle === project.title),
                                                                                allImages.findIndex(img => img.id === image.id && img.projectTitle === project.title)
                                                                            )}
                                                                        >
                                                                            <img
                                                                                src={image.url || `/storage/${image.image_path}`}
                                                                                alt={image.caption || `Project image ${imageIndex + 1}`}
                                                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                                                loading="lazy"
                                                                                width="96"
                                                                                height="128"
                                                                            />
                                                                            
                                                                            {/* Image Info */}
                                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                                                <div className="absolute bottom-0 left-0 right-0 p-1 text-white">
                                                                                    {image.caption && (
                                                                                        <p className="text-xs text-white/90 truncate leading-tight">{image.caption}</p>
                                                                                    )}
                                                                                    <div className="flex items-center gap-1">
                                                                                        <span className="text-xs text-white/60">
                                                                                            {new Date(image.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                                                        </span>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))}
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
                        </>
                    )}
                </div>

                {/* Image Popup */}
        {selectedDocument && (
            <div
                className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                onClick={closeModal}
            >
                {/* Previous Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        navigateImage(-1);
                    }}
                    className="absolute left-8 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all z-10"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                {/* Next Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        navigateImage(1);
                    }}
                    className="absolute right-8 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all z-10"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>

                {/* Close Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        closeModal();
                    }}
                    className="absolute top-8 right-8 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all z-10"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div
                    className="relative max-w-4xl max-h-[90vh]  flex flex-col items-center justify-center p-8 overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Project Information */}
                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-6 text-white">
                        <h3 className="text-xl font-bold mb-2">{selectedDocument.document_info?.filename || `Document ${currentDocumentIndex + 1}`}</h3>
                        <div className="flex flex-wrap gap-4 text-sm">
                            <div>
                                <span className="text-gray-300">Project ID:</span>
                                <span className="ml-1 font-mono">{selectedDocument.projectId}</span>
                            </div>
                            <div>
                                <span className="text-gray-300">Contract ID:</span>
                                <span className="ml-1 font-mono">{selectedDocument.contractId}</span>
                            </div>
                            <div>
                                <span className="text-gray-300">Category:</span>
                                <span className="ml-1">{selectedDocument.projectCategory}</span>
                            </div>
                            <div>
                                <span className="text-gray-300">Year:</span>
                                <span className="ml-1">{selectedDocument.projectYear}</span>
                            </div>
                            <div>
                                <span className="text-gray-300">Status:</span>
                                <span className={`ml-1 px-2 py-1 rounded text-xs font-medium ${
                                    selectedDocument.projectStatus === 'completed' ? 'bg-green-600' :
                                    selectedDocument.projectStatus === 'ongoing' ? 'bg-blue-600' :
                                    'bg-yellow-600'
                                }`}>
                                    {selectedDocument.projectStatus}
                                </span>
                            </div>
                        </div>
                        {selectedDocument.caption && (
                            <p className="mt-2 text-sm text-gray-200 italic">{selectedDocument.caption}</p>
                        )}
                    </div>
                    
                    {/* Image */}
                    <img
                        src={selectedDocument.url || (selectedDocument.image_path ? `/storage/${selectedDocument.image_path}` : '')}
                        alt={selectedDocument.caption || 'Project image'}
                        className="w-full h-full object-contain rounded-lg mt-20"
                    />
                </div>
            </div>
        )}
            </div>
        </PageLayout>
    );
}
