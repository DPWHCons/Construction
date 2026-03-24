import PageLayout from '@/Layouts/PageLayout';
import { Head } from '@inertiajs/react';
import { useState, useEffect, useMemo, useRef } from 'react';
import useAutoRefresh from '@/Hooks/useAutoRefresh';
import { renderAsync } from 'docx-preview';

export default function Gallery({ projects }) {
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
    const [docxPreviewLoading, setDocxPreviewLoading] = useState(false);
    const [docxPreviewError, setDocxPreviewError] = useState('');
    const [isDocxPreview, setIsDocxPreview] = useState(false);
    const [useIframeFallback, setUseIframeFallback] = useState(false);
    const [modalScale, setModalScale] = useState(1);
    const docxContainerRef = useRef(null);
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

    const openImageModal = (document) => {
        if (!document) return;
        if (!document.url) return;

        const previewUrl = `/document-preview?url=${encodeURIComponent(document.url)}&filename=${encodeURIComponent(document.filename || 'Document')}`;
        window.open(previewUrl, '_blank', 'noopener,noreferrer');
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
        setSelectedDocument(null);
        setDocxPreviewError('');
        setDocxPreviewLoading(false);
        setIsDocxPreview(false);
        setUseIframeFallback(false);
        if (docxContainerRef.current) {
            docxContainerRef.current.innerHTML = '';
        }
        setModalScale(1);
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
        
        setSelectedDocument(filteredImages[newIndex]);
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

    useEffect(() => {
        const previewDocx = async () => {
            if (!selectedDocument?.url) {
                setIsDocxPreview(false);
                setUseIframeFallback(false);
                return;
            }

            const fileName = selectedDocument.filename || '';
            const docUrl = selectedDocument.url;
            const isDocx = /\.docx($|\?)/i.test(fileName) || /\.docx($|\?)/i.test(docUrl);
            setIsDocxPreview(isDocx);
            setUseIframeFallback(false);

            if (!isDocx) {
                setDocxPreviewError('');
                setDocxPreviewLoading(false);
                if (docxContainerRef.current) {
                    docxContainerRef.current.innerHTML = '';
                }
                return;
            }

            setDocxPreviewLoading(true);
            setDocxPreviewError('');
            if (docxContainerRef.current) {
                docxContainerRef.current.innerHTML = '';
            }

            try {
                const response = await fetch(docUrl, { credentials: 'include' });
                if (!response.ok) {
                    throw new Error('Could not load the DOCX file.');
                }

                const arrayBuffer = await response.arrayBuffer();
                if (!docxContainerRef.current) return;
                const blob = new Blob([arrayBuffer], {
                    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                });

                await renderAsync(blob, docxContainerRef.current, null, {
                    inWrapper: true,
                    breakPages: true,
                    renderHeaders: true,
                    renderFooters: true,
                    renderFootnotes: true,
                    ignoreWidth: false,
                    ignoreHeight: false,
                    useBase64URL: true,
                });

                // Some files can render without visible DOM; fallback to iframe in that case.
                if (!docxContainerRef.current.querySelector('.docx')) {
                    setUseIframeFallback(true);
                }
            } catch (error) {
                setUseIframeFallback(true);
                setDocxPreviewError(error?.message || 'Unable to preview this DOCX file.');
            } finally {
                setDocxPreviewLoading(false);
            }
        };

        previewDocx();
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

    const formatDocumentSize = (document) => {
        if (!document?.document) return 'Unknown size';
        return `${(document.document.length / 1024).toFixed(1)} KB`;
    };

    const formatDocumentDate = (dateValue) => {
        if (!dateValue) return 'No date';
        return new Date(dateValue).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
                                        placeholder="Search documents..."
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
                            <h3 className="text-xl font-semibold text-slate-900 mb-2">No documents found</h3>
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
                                                        <div key={project.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
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
                                                                                {projectImages.length} {projectImages.length === 1 ? 'document' : 'documents'}
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
                                                                    <div className="flex flex-wrap gap-3.5">
                                                                    {projectImages.map((document, documentIndex) => (
                                                                        <button
                                                                            key={document.id}
                                                                            type="button"
                                                                            className="group relative w-36 h-24 overflow-hidden rounded-lg cursor-pointer bg-white border border-slate-200 hover:shadow-md transition-all duration-300 hover:scale-[1.02] flex-shrink-0 text-left"
                                                                            onClick={() => {
                                                                                openImageModal({
                                                                                    ...document,
                                                                                    projectTitle: project.title,
                                                                                    projectIndex: allImages.find(doc => doc.id === document.id && doc.projectTitle === project.title)?.projectIndex ?? 0,
                                                                                });
                                                                            }}
                                                                        >
                                                                            <div className="p-2.5 h-full flex flex-col justify-between">
                                                                                <div className="flex items-start space-x-2">
                                                                                    <span className="inline-flex items-center justify-center h-5 px-1.5 rounded bg-blue-100 text-blue-700 text-[10px] font-bold tracking-wide flex-shrink-0">
                                                                                        DOCS
                                                                                    </span>
                                                                                    <div className="flex-1 min-w-0">
                                                                                        <p className="text-xs font-semibold text-slate-800 truncate">
                                                                                            {document.filename || 'Document'}
                                                                                        </p>
                                                                                        <p className="text-[11px] text-slate-500">
                                                                                            {formatDocumentSize(document)}
                                                                                        </p>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="flex justify-end">
                                                                                    <a
                                                                                        href={document.url || '#'}
                                                                                        download={document.filename || `document_${document.id}.docx`}
                                                                                        className="text-blue-600 hover:text-blue-800 transition-colors p-1 rounded hover:bg-blue-50"
                                                                                        onClick={(e) => e.stopPropagation()}
                                                                                        title="Download document"
                                                                                    >
                                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                                                        </svg>
                                                                                    </a>
                                                                                </div>
                                                                            </div>
                                                                            
                                                                            {/* Hover Overlay */}
                                                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/35 transition-all duration-300 flex items-center justify-center">
                                                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-center">
                                                                                    <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                                                                    </svg>
                                                                                    <span className="text-[10px]">Preview</span>
                                                                                </div>
                                                                            </div>

                                                                            {/* Date Badge */}
                                                                            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                                                <div className="bg-black/60 backdrop-blur-sm text-white text-xs px-1 py-0.5 rounded">
                                                                                    {formatDocumentDate(document.created_at)}
                                                                                </div>
                                                                            </div>
                                                                        </button>
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
                                                        <div key={project.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
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
                                                                                {projectImages.length} {projectImages.length === 1 ? 'document' : 'documents'}
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
                                                                <div className="flex flex-wrap gap-3.5">
                                                                    {projectImages.map((document, documentIndex) => (
                                                                        <button
                                                                            key={document.id}
                                                                            type="button"
                                                                            className="group relative w-32 h-24 overflow-hidden rounded-lg cursor-pointer bg-white border border-slate-200 hover:shadow-md transition-all duration-300 hover:scale-[1.02] flex-shrink-0 text-left"
                                                                            onClick={() => openImageModal({
                                                                                ...document,
                                                                                projectTitle: project.title,
                                                                                projectIndex: allImages.find(doc => doc.id === document.id && doc.projectTitle === project.title)?.projectIndex ?? 0,
                                                                            })}
                                                                        >
                                                                            <div className="p-2 h-full flex flex-col justify-between">
                                                                                <div className="flex items-start space-x-1">
                                                                                    <span className="inline-flex items-center justify-center h-4 px-1 rounded bg-blue-100 text-blue-700 text-[9px] font-bold tracking-wide flex-shrink-0">
                                                                                        DOCS
                                                                                    </span>
                                                                                    <div className="flex-1 min-w-0">
                                                                                        <p className="text-xs font-medium text-slate-800 truncate leading-tight">
                                                                                            {document.filename || 'Document'}
                                                                                        </p>
                                                                                        <p className="text-[11px] text-slate-500">
                                                                                            {formatDocumentSize(document)}
                                                                                        </p>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="flex justify-end">
                                                                                    <a
                                                                                        href={document.url || '#'}
                                                                                        download={document.filename || `document_${document.id}.docx`}
                                                                                        className="text-blue-600 hover:text-blue-800 transition-colors p-1 rounded hover:bg-blue-50"
                                                                                        onClick={(e) => e.stopPropagation()}
                                                                                        title="Download document"
                                                                                    >
                                                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                                                        </svg>
                                                                                    </a>
                                                                                </div>
                                                                            </div>
                                                                            
                                                                            {/* Image Info */}
                                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                                                <div className="absolute bottom-0 left-0 right-0 p-1 text-white">
                                                                                    {document.caption && (
                                                                                        <p className="text-xs text-white/90 truncate leading-tight">{document.caption}</p>
                                                                                    )}
                                                                                    <div className="flex items-center gap-1">
                                                                                        <span className="text-xs text-white/60">
                                                                                            {formatDocumentDate(document.created_at)}
                                                                                        </span>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </button>
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
                    className="relative w-full bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col"
                    style={{
                        maxWidth: '96vw',
                        maxHeight: '94vh',
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Document Header */}
                    <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-6 border-b border-slate-700">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">{selectedDocument.filename || 'Document'}</h3>
                                    <div className="flex items-center space-x-4 text-sm text-slate-300">
                                        <span>Size: {selectedDocument.document ? `${(selectedDocument.document.length / 1024).toFixed(1)} KB` : 'Unknown'}</span>
                                        <span>Created: {new Date(selectedDocument.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="flex items-center bg-white/10 rounded-lg p-1 mr-1">
                                    <button
                                        type="button"
                                        onClick={() => setModalScale((prev) => Math.max(0.6, Number((prev - 0.1).toFixed(1))))}
                                        className="px-2 py-1 text-sm hover:bg-white/20 rounded"
                                        title="Zoom out document"
                                    >
                                        -
                                    </button>
                                    <span className="px-2 text-xs text-slate-200 min-w-[52px] text-center">
                                        {Math.round(modalScale * 100)}%
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setModalScale((prev) => Math.min(1.8, Number((prev + 0.1).toFixed(1))))}
                                        className="px-2 py-1 text-sm hover:bg-white/20 rounded"
                                        title="Zoom in document"
                                    >
                                        +
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setModalScale(1)}
                                        className="ml-1 px-2 py-1 text-xs hover:bg-white/20 rounded"
                                        title="Reset document zoom"
                                    >
                                        Reset
                                    </button>
                                </div>
                                <a
                                    href={selectedDocument.url || '#'}
                                    download={selectedDocument.filename || `document_${selectedDocument.id}.docx`}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    <span>Download</span>
                                </a>
                            </div>
                        </div>
                    </div>
                    
                    {/* Document Preview */}
                    <div className="flex-1 p-6 bg-slate-200/60 overflow-auto">
                        <div className="mx-auto w-full max-w-none flex justify-center">
                            {docxPreviewLoading ? (
                                <div className="h-[500px] flex items-center justify-center text-slate-500">
                                    Loading document preview...
                                </div>
                            ) : docxPreviewError ? (
                                <div className="h-[500px] flex flex-col items-center justify-center text-center px-6">
                                    <p className="text-red-600 font-medium">Could not preview this DOCX file.</p>
                                    <p className="text-slate-500 mt-2">{docxPreviewError}</p>
                                </div>
                            ) : isDocxPreview && !useIframeFallback ? (
                                <div
                                    className="mx-auto"
                                    style={{ zoom: modalScale }}
                                >
                                    <div
                                        ref={docxContainerRef}
                                        className="docx-preview-root"
                                    />
                                </div>
                            ) : (
                                <div
                                    className="mx-auto bg-white shadow-xl border border-slate-300"
                                    style={{
                                        width: `${Math.round(794 * modalScale)}px`,
                                        minHeight: `${Math.round(1123 * modalScale)}px`,
                                    }}
                                >
                                    <iframe
                                        src={selectedDocument.url || ''}
                                        className="w-full"
                                        style={{ height: `${Math.round(1123 * modalScale)}px` }}
                                        title={`Preview of ${selectedDocument.filename || 'Document'}`}
                                    />
                                </div>
                            )}
                        </div>
                        <div className="mt-4 text-center text-sm text-slate-500">
                            <p>Preview is shown in A4-like paper mode. Download if layout differs from Word.</p>
                        </div>
                    </div>
                </div>
            </div>
        )}
            </div>
        </PageLayout>
    );
}
