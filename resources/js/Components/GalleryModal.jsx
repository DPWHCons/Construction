import React, { useState, useMemo, useEffect } from 'react';
import { showSuccessToast, showErrorToast, showDocumentArchiveConfirmation } from '../Utils/alerts';
import { Head, router } from '@inertiajs/react';

export default function GalleryModal({ show, project, onClose }) {
    const [displayMode, setDisplayMode] = useState('grid'); // grid, list
    const [selectedDocuments, setSelectedDocuments] = useState(new Set()); // Set of selected document indices
    const [isSelectionMode, setIsSelectionMode] = useState(false); // For multi-select
    const [selectedDocument, setSelectedDocument] = useState(null); // For popup display
    const [lastSelectedIndex, setLastSelectedIndex] = useState(null); // For shift-click range selection
    const [openMonths, setOpenMonths] = useState(new Set()); // For collapsible months
    const [localImages, setLocalImages] = useState(project?.images || []); // Local state for images
    const [isLoading, setIsLoading] = useState(false); // Loading state for archive operations

    // Update local images when project prop changes
    useEffect(() => {
        setLocalImages(project?.images || []);
    }, [project]);

    // Group documents by month
    const groupedDocuments = useMemo(() => {
        if (!localImages || localImages.length === 0) return {};

        return localImages.reduce((groups, doc) => {
            // Use document_date if available, fallback to created_at
            const dateSource = doc.document_date || doc.created_at;
            if (!dateSource) return groups;

            const date = new Date(dateSource);
            const year = date.getFullYear();
            const month = date.toLocaleString('default', { month: 'long' });

            const key = `${month} ${year}`;

            if (!groups[key]) groups[key] = [];
            groups[key].push(doc);

            return groups;
        }, {});
    }, [localImages]);

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

    // Sort months (latest first)
    const sortedMonths = useMemo(() => {
        return Object.entries(sortedGroupedDocuments).sort((a, b) => {
            const dateA = new Date(a[1][0]?.document_date || a[1][0]?.created_at);
            const dateB = new Date(b[1][0]?.document_date || b[1][0]?.created_at);
            return dateB - dateA;
        });
    }, [sortedGroupedDocuments]);

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

    const ListIcon = () => (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
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
        if (!localImages || localImages.length === 0) return;

        // Find current document index with multiple fallback methods
        let currentIndex = -1;

        // Method 1: Direct object comparison
        currentIndex = localImages.findIndex(doc => doc === selectedDocument);

        // Method 2: Compare by document path
        if (currentIndex === -1 && selectedDocument?.document) {
            currentIndex = localImages.findIndex(doc => doc.document === selectedDocument.document);
        }

        // Method 3: Compare by url
        if (currentIndex === -1 && selectedDocument?.url) {
            currentIndex = localImages.findIndex(doc => doc.url === selectedDocument.url);
        }

        // Method 4: Compare by id if available
        if (currentIndex === -1 && selectedDocument?.id) {
            currentIndex = localImages.findIndex(doc => doc.id === selectedDocument.id);
        }

        // If still not found, use first document
        if (currentIndex === -1) {
            currentIndex = 0;
        }

        let newIndex = currentIndex + direction;

        // Wrap around for circular navigation
        if (newIndex < 0) newIndex = localImages.length - 1;
        if (newIndex >= localImages.length) newIndex = 0;

        setSelectedDocument(localImages[newIndex]);
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
        if (selectedDocuments.size === localImages?.length) {
            setSelectedDocuments(new Set()); // Deselect all
        } else {
            setSelectedDocuments(new Set(localImages?.map((_, index) => index))); // Select all
        }
    };

    const handleDeleteDocuments = async () => {
        if (selectedDocuments.size === 0) return;

        // Get selected document IDs
        const documentIds = Array.from(selectedDocuments).map(index => localImages[index]?.id).filter(id => id);

        if (documentIds.length === 0) {
            showErrorToast('No valid documents selected');
            return;
        }

        const result = await showDocumentArchiveConfirmation(`${documentIds.length} document${documentIds.length > 1 ? 's' : ''}`);
        
        if (!result.isConfirmed) {
            return;
        }

        try {
            const response = await fetch('/project-images/archive', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ image_ids: documentIds })
            });

            const responseText = await response.text();

            let data;
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                showErrorToast('Server returned invalid response. Please refresh the page.');
                setIsLoading(false);
                return;
            }

            if (response.ok && data.success) {
                showSuccessToast(`${documentIds.length} document(s) archived successfully`);
                
                // Remove archived documents from local state
                const idsToRemove = documentIds.map(id => String(id));
                setLocalImages(prevImages => prevImages.filter(img => !idsToRemove.includes(String(img.id))));
                setSelectedDocuments(new Set());
                setIsSelectionMode(false);
            } else {
                const errorMsg = data.message || data.error || `Failed to archive (${response.status})`;
                showErrorToast(errorMsg);
            }
        } catch (error) {
            showErrorToast('Error occurred while archiving documents');
        } finally {
            setIsLoading(false);
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
                    className="bg-white rounded-xl shadow-2xl w-[900px] h-[600px] overflow-hidden border border-slate-200 flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="sticky top-0 flex items-center justify-between bg-gray-50 px-5 py-4 z-10 border-b border-gray-200">

                        <div className="flex items-center gap-3">
                            <h3 className="text-xl font-bold text-gray-900">
                                Project Gallery — {project.project_year || '-'}
                            </h3>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={onClose}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-800 transition-colors"
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
                            <div className="p-4 pb-2 bg-gray-50 sticky top-0 z-10 flex items-center justify-between border-b border-slate-200">
                                {/* Left side: Project title & contract */}
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-900">{project.title}</h4>
                                    <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                                        <span>Contract ID: {project.contract_id || '-'}</span>
                                    </div>
                                </div>

                                {/* Right side: Display Mode Buttons + Selection Controls */}
                                <div className="flex items-center gap-2">
                                    {/* Display Mode Buttons */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setDisplayMode('grid')}
                                            className={`px-3 py-2 rounded-lg transition-all duration-300 ${displayMode === 'grid' ? 'bg-[#010066] text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100'
                                                }`}
                                        >
                                            <GridIcon />
                                        </button>
                                        <button
                                            onClick={() => setDisplayMode('list')}
                                            className={`px-3 py-2 rounded-lg transition-all duration-300 ${displayMode === 'list' ? 'bg-[#010066] text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100'
                                                }`}
                                        >
                                            <ListIcon />
                                        </button>
                                    </div>

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

                            {/* Gallery Documents */}
                            <div className="p-4">
                                {sortedMonths.length > 0 ? (
                                    <div className="space-y-6">
                                        {sortedMonths.map(([monthKey, docs]) => (
                                            <div key={monthKey}>
                                                {/* Month Header */}
                                                <div 
                                                    className="flex items-center justify-between mb-3 cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition-colors"
                                                    onClick={() => toggleMonth(monthKey)}
                                                >
                                                    <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                                                        {monthKey}
                                                        <svg 
                                                            className={`w-4 h-4 transition-transform ${openMonths.has(monthKey) ? 'rotate-90' : ''}`}
                                                            fill="none" 
                                                            stroke="currentColor" 
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </h4>
                                                    <span className="text-xs text-gray-500">
                                                        {docs.length} document{docs.length > 1 ? 's' : ''}
                                                    </span>
                                                </div>

                                                {/* Documents */}
                                                {openMonths.has(monthKey) && (
                                                    docs.length > 0 ? (
                                                        <div className={`grid gap-4 ml-4 ${displayMode === 'grid' ? 'grid-cols-[repeat(auto-fit,_minmax(120px,_1fr))]' : 'grid-cols-1'}`}>
                                                            {docs.map((document, docIndex) => {
                                                                // Find the original index for selection
                                                                const originalIndex = localImages?.findIndex(img => img.id === document.id) ?? -1;
                                                                return (
                                                                    <div
                                                                        key={docIndex}
                                                                        className={`relative group cursor-pointer ${displayMode === 'grid' ? 'w-full aspect-[4/3]' : 'w-full h-24'
                                                                            } ${selectedDocuments.has(originalIndex) ? 'border-blue-500 bg-blue-50' : 'hover:border-blue-400 hover:shadow-lg hover:scale-[1.05] transition-all duration-300'
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
                                                        <div className="text-xs text-gray-400 italic py-4 ml-4">
                                                            No documents uploaded this month
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="text-gray-400 text-sm">
                                            No documents found
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
