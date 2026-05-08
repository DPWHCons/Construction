import React, { useState, useMemo, useEffect } from 'react';
import { showSuccessToast, showErrorToast, showArchiveConfirmation } from '../Utils/alerts';
import { Head, router } from '@inertiajs/react';
import GallerySkeleton from './GallerySkeleton';
import Swal from 'sweetalert2';

export default function ProjectGalleryModal({ show, project, onClose, onBackToDetails }) {
    const [selectedDocuments, setSelectedDocuments] = useState(new Set()); // Set of selected document indices
    const [isSelectionMode, setIsSelectionMode] = useState(false); // For multi-select
    const [selectedDocument, setSelectedDocument] = useState(null); // For popup display
    const [lastSelectedIndex, setLastSelectedIndex] = useState(null); // For shift-click range selection
    const [selectedYear, setSelectedYear] = useState(null); // For year filtering
    const [isLoading, setIsLoading] = useState(true); // Start with true, will be set to false when ready

    // Group documents by month
    const groupedDocuments = useMemo(() => {
        if (!project?.images || project.images.length === 0) {
            return {};
        }

        const result = project.images.reduce((groups, doc) => {
            const dateSource = doc.document_date || doc.created_at || new Date().toISOString();
            if (!dateSource) return groups;

            const date = new Date(dateSource);
            const year = date.getFullYear();
            const month = date.toLocaleString('default', { month: 'long' });

            const key = `${month} ${year}`;

            if (!groups[key]) groups[key] = [];
            groups[key].push(doc);

            return groups;
        }, {});
        
        return result;
    }, [project?.images]);

    // Sort documents within each month group (newest first)
    const sortedGroupedDocuments = useMemo(() => {
        const sorted = {};
        Object.entries(groupedDocuments).forEach(([monthKey, docs]) => {
            sorted[monthKey] = docs.sort((a, b) => {
                const dateA = new Date(a.document_date || a.created_at);
                const dateB = new Date(b.document_date || b.created_at);
                return dateB - dateA; // Newest first
            });
        });
        return sorted;
    }, [groupedDocuments]);

    // Extract unique years from documents
    const availableYears = useMemo(() => {
        const years = new Set();
        project?.images?.forEach(doc => {
            const dateSource = doc.document_date || doc.created_at || new Date().toISOString();
            const date = new Date(dateSource);
            years.add(date.getFullYear());
        });
        return Array.from(years).sort((a, b) => b - a); // Latest first
    }, [project?.images]);

    // Sort months (latest first)
    const sortedMonths = useMemo(() => {
        return Object.entries(sortedGroupedDocuments).sort((a, b) => {
            const dateA = new Date(a[1][0]?.document_date || a[1][0]?.created_at);
            const dateB = new Date(b[1][0]?.document_date || b[1][0]?.created_at);
            return dateB - dateA;
        });
    }, [sortedGroupedDocuments]);

    // Filter months by selected year
    const filteredMonths = useMemo(() => {
        if (!selectedYear) return sortedMonths;
        return sortedMonths.filter(([monthKey]) => monthKey.includes(selectedYear.toString()));
    }, [sortedMonths, selectedYear]);

    // Keyboard navigation for document popup
    useEffect(() => {
        const handleKey = (e) => {
            if (!selectedDocument) return;
            
            if (e.key === 'ArrowLeft') {
                navigateDocument(-1);
            } else if (e.key === 'ArrowRight') {
                navigateDocument(1);
            } else if (e.key === 'Escape') {
                closeDocumentPopup();
            }
        };

        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [selectedDocument]);

    useEffect(() => {
        if (!show) {
            return; 
        }

        // If no project or images, loading is done
        if (!project?.images) {
            setIsLoading(false);
            return;
        }

        // If images array is empty, loading is done
        if (project.images.length === 0) {
            setIsLoading(false);
            return;
        }

        // If we have grouped documents, loading is done
        if (Object.keys(groupedDocuments).length > 0) {
            setIsLoading(false);
            return;
        }

        // Otherwise, we're still loading
        setIsLoading(true);
    }, [show, project?.images, groupedDocuments]);

    // Toggle month collapse
    const toggleMonth = (month) => {
        setOpenMonths(prev => {
            const newSet = new Set(prev);
            if (newSet.has(month)) newSet.delete(month);
            else newSet.add(month);
            return newSet;
        });
    };

    const formatDocumentSize = (document) => {
        if (!document?.document) return 'Unknown size';
        return `${(document.document.length / (1024 * 1024)).toFixed(2)} MB`;
    };

    if (!show || !project) return null;

    const GridIcon = () => (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
    );

    
    const handleDocumentClick = (document) => {
        if (isSelectionMode) return; // Don't show popup when in selection mode

        if (!document) return;
        if (!document.url) return;

        const previewUrl = `/document-preview?url=${encodeURIComponent(document.url)}&filename=${encodeURIComponent(document.filename || 'Document')}`;
        window.open(previewUrl, '_blank', 'noopener,noreferrer');
    };

    const closeDocumentPopup = () => {
        setSelectedDocument(null);
    };

    const getDocumentType = (filename) => {
        if (!filename) return 'Unknown';

        const ext = filename.split('.').pop()?.toLowerCase();
        const types = {
            'pdf': 'PDF Document',
            'doc': 'Word Document',
            'docx': 'Word Document',
            'xls': 'Excel Spreadsheet',
            'xlsx': 'Excel Spreadsheet',
            'ppt': 'PowerPoint Presentation',
            'pptx': 'PowerPoint Presentation',
            'txt': 'Text File'
        };

        return types[ext] || 'Document';
    };

    const navigateDocument = (direction) => {
        if (!project.images || project.images.length === 0) return;

        // Find current document index with multiple fallback methods
        let currentIndex = -1;

        // Method 1: Direct object comparison
        currentIndex = project.images.findIndex(doc => doc === selectedDocument);

        // Method 2: Compare by document path
        if (currentIndex === -1 && selectedDocument?.document) {
            currentIndex = project.images.findIndex(doc => doc.document === selectedDocument.document);
        }

        // Method 3: Compare by url
        if (currentIndex === -1 && selectedDocument?.url) {
            currentIndex = project.images.findIndex(doc => doc.url === selectedDocument.url);
        }

        // Method 4: Compare by id if available
        if (currentIndex === -1 && selectedDocument?.id) {
            currentIndex = project.images.findIndex(doc => doc.id === selectedDocument.id);
        }

        // If still not found, use first document
        if (currentIndex === -1) {
            currentIndex = 0;
        }

        let newIndex = currentIndex + direction;

        // Wrap around for circular navigation
        if (newIndex < 0) newIndex = project.images.length - 1;
        if (newIndex >= project.images.length) newIndex = 0;

        setSelectedDocument(project.images[newIndex]);
    };

    const handleDocumentSelect = (index, isShiftClick = false) => {
        const newSelected = new Set(selectedDocuments);

        if (isShiftClick && lastSelectedIndex !== null) {
            // Select range between lastSelectedIndex and current index
            const start = Math.min(lastSelectedIndex, index);
            const end = Math.max(lastSelectedIndex, index);
            for (let i = start; i <= end; i++) {
                newSelected.add(i);
            }
        } else {
            // Toggle selection for single document
            if (newSelected.has(index)) {
                newSelected.delete(index);
            } else {
                newSelected.add(index);
            }
        }

        setSelectedDocuments(newSelected);
        setLastSelectedIndex(index);
    };

    const handleSelectAll = () => {
        if (selectedDocuments.size === project.images?.length) {
            setSelectedDocuments(new Set()); // Deselect all
        } else {
            setSelectedDocuments(new Set(project.images?.map((_, index) => index))); // Select all
        }
    };

    const handleDeleteDocuments = async () => {
        if (selectedDocuments.size === 0) return;

        // Get selected document IDs
        const documentIds = Array.from(selectedDocuments).map(index => project.images[index]?.id).filter(id => id);

        if (documentIds.length === 0) {
            showErrorToast('No valid documents selected');
            return;
        }

        // Modern SweetAlert confirmation
        const result = await Swal.fire({
            title: 'Archive documents?',
            html: `Archive <strong>${documentIds.length} document${documentIds.length > 1 ? 's' : ''}</strong>?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Archive',
            cancelButtonText: 'Cancel',
            reverseButtons: true,
            customClass: {
                popup: 'rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.18)] border border-slate-100 bg-white',
                title: 'text-base font-semibold text-slate-900 tracking-tight font-sans',
                htmlContainer: 'text-sm text-slate-600 text-center font-sans mt-2',
                actions: 'gap-3 mt-6',
                confirmButton:
                    'inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-xs font-semibold bg-[#Eb3505] text-white hover:opacity-95 transition-all duration-150 active:scale-95',
                cancelButton:
                    'inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all duration-150 active:scale-95',
            },
        });

        if (!result.isConfirmed) {
            return;
        }

        try {
            const response = await fetch('/project-images/archive', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                },
                body: JSON.stringify({ image_ids: documentIds })
            });

            if (response.ok) {
                showSuccessToast(`${documentIds.length} document(s) archived successfully`);
                setSelectedDocuments(new Set());
                setIsSelectionMode(false);
                router.reload();
            } else {
                const errorData = await response.text();
                console.error('Archive failed:', response.status, errorData);
                showErrorToast(`Failed to archive documents (${response.status})`);
            }
        } catch (error) {
            console.error('Error archiving documents:', error);
            showErrorToast('Error occurred while archiving documents');
        }
    };

    const toggleSelectionMode = () => {
        setIsSelectionMode(!isSelectionMode);
        setSelectedDocuments(new Set()); // Clear selections when toggling
        setLastSelectedIndex(null); // Reset last selected index to prevent shift-click issues
    };

    return (
        <>
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4 py-8 transition-all duration-300"
                onClick={onClose}
            >
                <div
                    className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[85vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#cbd5e1 transparent'
                    }}
                >
                    {/* 🔥 Header */}
                    <div className="sticky top-0 flex items-center justify-between bg-gray-50 px-5 py-4 z-10 border-b border-gray-200">

                        <div className="flex items-center gap-3">
                            <h3 className="text-xl font-bold text-gray-900">
                                Project Gallery — {project.project_year || '-'}
                            </h3>
                        </div>
                        <div className="flex items-center gap-3">
                            {project.images?.length > 0 && (
                                <div className="inline-flex items-center bg-slate-200 rounded-full p-1">
                                    <button
                                        onClick={onBackToDetails}
                                        className="px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 text-slate-600 hover:text-slate-900"
                                    >
                                        Details
                                    </button>
                                    <button
                                        className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 flex items-center gap-1.5 ${
                                            true
                                                ? 'bg-[#010066] text-white shadow-sm'
                                                : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        Gallery
                                    </button>
                                </div>
                            )}
                            <button
                                onClick={onClose}
                                className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-600 hover:text-slate-800 transition-colors"
                            >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>   
                        </div>
                    </div>

                    {/* Gallery Content */}
                    <div className="flex-1 relative overflow-hidden">
                        <div className="h-full overflow-y-auto bg-gray-50 rounded-b-xl shadow-lg">
                            {/* Sticky Gallery Header with Display Buttons */}
                            <div className="p-4 pb-2 bg-gray-50 sticky top-0 z-10 border-b border-slate-200">
                                {/* Top Row: Project Info + Controls */}
                                <div className="flex items-start justify-between gap-4 mb-3">
                                    {/* Left side: Project title & contract */}
                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-900">{project.title}</h4>
                                        <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                                            <span>Contract ID: {project.contract_id || '-'}</span>
                                        </div>
                                    </div>
                                    
                                    {/* Right side: All Controls */}
                                    <div className="flex items-center gap-2">
                                        {/* Year Navigation */}
                                        {availableYears.length > 1 && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-gray-600">Filter year:</span>
                                                <select
                                                    value={selectedYear || ''}
                                                    onChange={(e) => setSelectedYear(e.target.value ? parseInt(e.target.value) : null)}
                                                    className="w-32 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#010066] focus:border-[#010066] transition-all"
                                                >
                                                    <option value="">All Years</option>
                                                    {availableYears.map(year => (
                                                        <option key={year} value={year}>
                                                            {year}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}

                                        {/* Selection Controls */}
                                        {isSelectionMode && (
                                            <button
                                                onClick={handleSelectAll}
                                                className="px-3 py-1 bg-[#010066] text-white rounded-full text-xs font-montserrat hover:bg-[#010066]/80 transition-all"
                                                aria-label={selectedDocuments.size === project?.images?.length ? 'Deselect all documents' : 'Select all documents'}
                                            >
                                                {selectedDocuments.size === project?.images?.length ? 'Deselect All' : 'Select All'}
                                            </button>
                                        )}
                                        <button
                                            onClick={toggleSelectionMode}
                                            className={`px-3 py-1 rounded-full text-xs font-montserrat transition-all flex items-center gap-1 ${isSelectionMode
                                                    ? 'bg-gray-500 text-white hover:bg-gray-600'
                                                    : 'bg-red-500 text-white hover:bg-red-600'
                                                }`}
                                            aria-label={isSelectionMode ? 'Cancel selection mode' : 'Enter archive selection mode'}
                                        >
                                            {isSelectionMode ? 'Cancel' : 'Archive'}
                                        </button>
                                        {isSelectionMode && selectedDocuments.size > 0 && (
                                            <button
                                                onClick={handleDeleteDocuments}
                                                className="px-3 py-1 bg-red-600 text-white rounded-full text-xs font-montserrat hover:bg-red-700 transition-all"
                                                aria-label={`Archive ${selectedDocuments.size} selected documents`}
                                            >
                                                Archive ({selectedDocuments.size})
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Gallery Documents */}
                            <div className="p-4">
                                {isLoading ? (
                                    <GallerySkeleton />
                                ) : filteredMonths.length > 0 ? (
                                    <div className="space-y-8">
                                        {filteredMonths.map(([monthKey, docs]) => (
                                            <React.Fragment key={monthKey}>
                                                <div>
                                                {/* Simple Month Separator */}
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="h-px bg-gray-300 flex-1"></div>
                                                    <div className="px-4 py-2 bg-gray-100 rounded-full">
                                                        <h4 className="text-sm font-semibold text-gray-700">
                                                            {monthKey}
                                                        </h4>
                                                    </div>
                                                    <div className="h-px bg-gray-300 flex-1"></div>
                                                </div>

                                                {/* Documents */}
                                                {docs.length > 0 ? (
                                                    <div className="grid gap-4 ml-4 grid-cols-[repeat(auto-fill,_minmax(120px,_1fr))]">
                                                            {docs.map((document, docIndex) => {
                                                                // Find the original index for selection
                                                                const originalIndex = project.images?.findIndex(img => img.id === document.id) ?? -1;
                                                                return (
                                                                    <div
                                                                        key={docIndex}
                                                                        className={`relative group cursor-pointer w-full aspect-[4/3] ${selectedDocuments.has(originalIndex) ? 'border-blue-500 bg-blue-50' : 'hover:border-blue-400 hover:shadow-lg hover:scale-[1.05] transition-all duration-300'
                                                                            } rounded-lg border-2 border-slate-200 overflow-hidden flex-shrink-0 text-left`}
                                                                        onClick={(e) => {
                                                                            if (isSelectionMode) {
                                                                                handleDocumentSelect(originalIndex, e.shiftKey);
                                                                            } else {
                                                                                handleDocumentClick(document);
                                                                            }
                                                                        }}
                                                                    >
                                                                        {/* Selection Checkbox */}
                                                                        {isSelectionMode && (
                                                                            <div className="absolute top-2 left-2">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={selectedDocuments.has(originalIndex)}
                                                                                    onChange={(e) => handleDocumentSelect(originalIndex, e.shiftKey)}
                                                                                    className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
                                                                                    onClick={(e) => e.stopPropagation()}
                                                                                />
                                                                            </div>
                                                                        )}
                                                                        
                                                                        {/* Document Content */}
                                                                        <div className="p-2 h-full flex flex-col justify-between overflow-hidden">
                                                                            <div className="flex justify-center mb-2">
                                                                                <a
                                                                                    href={document.url || '#'}
                                                                                    download={document.filename || `document_${document.id}.docx`}
                                                                                    className="hover:bg-blue-200 text-blue-600 hover:text-blue-800 transition-all duration-200 p-2 rounded-full relative z-10 shadow-sm hover:shadow-md"
                                                                                    onClick={(e) => e.stopPropagation()}
                                                                                    title="Download document"
                                                                                >
                                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                                                    </svg>
                                                                                </a>
                                                                            </div>
                                                                            <div className="text-center">
                                                                                <p className="text-xs font-semibold text-black truncate leading-tight mb-1" title={document.filename || `Document ID: ${document.id}`}>
                                                                                    {document.filename || `Document_${document.id}`}
                                                                                </p>
                                                                                <p className="text-[8px] text-slate-500 font-medium">
                                                                                    {formatDocumentSize(document)}
                                                                                </p>
                                                                            </div>
                                                                        </div>

                                                                        {/* Hover Overlay */}
                                                                        <div className="absolute inset-0 bg-gray-200/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center rounded-lg">
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    ) : (
                                                        <div className="text-xs text-gray-400 italic py-4 text-center">
                                                            No documents uploaded this month
                                                        </div>
                                                    )}
                                                </div>
                                            </React.Fragment>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="text-gray-400 text-sm">
                                            {selectedYear ? `No documents found for ${selectedYear}` : 'No documents found'}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Document Popup */}
            {selectedDocument && (
                <div
                    className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={closeDocumentPopup}
                >
                    {/* Previous Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            navigateDocument(-1);
                        }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-3 transition-all duration-200"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    {/* Next Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            navigateDocument(1);
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
                            closeDocumentPopup();
                        }}
                        className="absolute top-8 right-8 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all z-10"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    <div
                        className="relative max-w-4xl max-h-[90vh] w-full h-full sm:w-auto sm:h-auto flex flex-col items-center justify-center p-4 sm:p-8 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Project Information */}
                        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-6 text-white">
                            <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                            <div className="flex flex-wrap gap-4 text-sm">
                                <div>
                                    <span className="text-gray-300">Project ID:</span>
                                    <span className="ml-1 font-mono">{project.project_id || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="text-gray-300">Contract ID:</span>
                                    <span className="ml-1 font-mono">{project.contract_id || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="text-gray-300">Category:</span>
                                    <span className="ml-1">{project.category?.name || 'Uncategorized'}</span>
                                </div>
                                <div>
                                    <span className="text-gray-300">Year:</span>
                                    <span className="ml-1">{project.project_year || 'Unknown'}</span>
                                </div>
                                <div>
                                    <span className="text-gray-300">Status:</span>
                                    <span className={`ml-1 px-2 py-1 rounded text-xs font-medium ${project.status === 'completed' ? 'bg-green-600' :
                                            project.status === 'ongoing' ? 'bg-blue-600' :
                                                'bg-yellow-600'
                                        }`}>
                                        {project.status}
                                    </span>
                                </div>
                            </div>
                            {selectedDocument.caption && (
                                <p className="mt-2 text-sm text-gray-200 italic">{selectedDocument.caption}</p>
                            )}
                        </div>

                        {/* Document Preview */}
                        <div className="flex-1 bg-gray-100 rounded-lg p-4 flex items-center justify-center">
                            {selectedDocument.url ? (
                                <iframe
                                    src={selectedDocument.url}
                                    className="w-full h-full rounded-lg border-0"
                                    title={selectedDocument.filename || 'Document'}
                                />
                            ) : (
                                <div className="text-center text-gray-500">
                                    <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.707.293H19a2 2 0 012 2v11a2 2 0 01-2 2H7a2 2 0 01-2-2V9z" />
                                    </svg>
                                    <p className="mb-2">Cannot preview this document type</p>
                                    <p className="text-sm text-gray-400 mb-4">
                                        {selectedDocument.filename ? 
                                            `File type: ${selectedDocument.filename.split('.').pop()?.toUpperCase() || 'Unknown'}` : 
                                            'Unsupported format'
                                        }
                                    </p>
                                    <a
                                        href={selectedDocument.url || '#'}
                                        download={selectedDocument.filename || 'document.docx'}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                        Download Document
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}