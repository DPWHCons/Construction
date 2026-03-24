import React, { useState } from 'react';
import { showSuccessToast, showErrorToast } from '../Utils/alerts';
import { Head, router } from '@inertiajs/react';

export default function ProjectGalleryModal({ show, project, onClose, onBackToDetails }) {
    const [displayMode, setDisplayMode] = useState('grid'); // grid, list
    const [selectedDocuments, setSelectedDocuments] = useState(new Set()); // Set of selected document indices
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null); // For popup display
    const [lastSelectedIndex, setLastSelectedIndex] = useState(null); // For shift-click range selection

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
        
        if (!confirm(`Are you sure you want to archive ${documentIds.length} document(s)?`)) {
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
                showErrorToast('Failed to archive documents');
            }
        } catch (error) {
            console.error('Error archiving documents:', error);
            showErrorToast('Error occurred while archiving documents');
        }
    };

    const toggleSelectionMode = () => {
        setIsSelectionMode(!isSelectionMode);
        setSelectedDocuments(new Set()); // Clear selections when toggling
    };

    return (
        <>
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4 py-8 transition-all duration-300"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-xl shadow-2xl w-[1200px] h-[600px] overflow-hidden border border-slate-200 transition-all duration-300 flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* 🔥 Header */}
                <div className="flex items-center justify-between 
                    bg-white/80 backdrop-blur border-b border-gray-200 
                    text-gray-900 px-6 py-4 sticky top-0 z-20 border-b-2 border-gray-200 shadow-lg">
                    
                    <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-gray-900">
                            Project Gallery — {project.project_year || '-'}
                        </h3>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onBackToDetails}
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm hover:shadow-md"
                        >
                            Project Details
                        </button>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm hover:shadow-md"
                        >
                            Close
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
                                <h4 className="font-semibold text-slate-800 font-montserrat text-lg mt-0">{project.title}</h4>
                                <div className="flex flex-wrap gap-3 text-sm text-slate-600 font-montserrat mb-0">
                                    <span>Project ID: {project.project_id || '-'}</span>
                                    <span>Contract ID: {project.contract_id || '-'}</span>
                                </div>
                            </div>

                            {/* Right side: Display Mode Buttons + Selection Controls */}
                            <div className="flex items-center gap-2">
                                {/* Display Mode Buttons */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setDisplayMode('grid')}
                                        className={`px-3 py-2 rounded-lg transition-all duration-300 ${
                                            displayMode === 'grid' ? 'bg-[#010066] text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100'
                                        }`}
                                    >
                                        <GridIcon />
                                    </button>
                                    <button
                                        onClick={() => setDisplayMode('list')}
                                        className={`px-3 py-2 rounded-lg transition-all duration-300 ${
                                            displayMode === 'list' ? 'bg-[#010066] text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100'
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
                                    >
                                        {selectedDocuments.size === project.images?.length ? 'Deselect All' : 'Select All'}
                                    </button>
                                )}
                                <button
                                    onClick={toggleSelectionMode}
                                    className={`px-3 py-1 rounded-full text-xs font-montserrat transition-all flex items-center gap-1 ${
                                        isSelectionMode
                                            ? 'bg-red-500 text-white hover:bg-red-600'
                                            : 'bg-red-500 text-white hover:bg-red-600'
                                    }`}
                                >
                                    {isSelectionMode ? 'Cancel Selection' : 'Delete Documents'}
                                </button>
                                {isSelectionMode && selectedDocuments.size > 0 && (
                                    <button
                                        onClick={handleDeleteDocuments}
                                        className="px-3 py-1 bg-red-600 text-white rounded-full text-xs font-montserrat hover:bg-red-700 transition-all"
                                    >
                                        Archived Documents ({selectedDocuments.size})
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Gallery Documents */}
                        <div className="p-4">
                            {project.images && project.images.length > 0 ? (
                                <div className={`grid gap-4 ${
                                    displayMode === 'grid' ? 'grid-cols-6' : 'grid-cols-1'
                                }`}>
                                    {project.images.map((document, index) => (
                                        <div
                                            key={index}
                                            className={`relative group cursor-pointer ${
                                                displayMode === 'grid' ? 'aspect-square' : 'h-32'
                                            } ${selectedDocuments.has(index) ? 'border-blue-500 bg-blue-50' : 'hover:border-blue-400 hover:shadow-lg'
                                            } rounded-lg border-2 border-slate-200 overflow-hidden transition-all duration-200`}
                                            onClick={(e) => {
                                                if (isSelectionMode) {
                                                    handleDocumentSelect(index, e.shiftKey);
                                                } else {
                                                    handleDocumentClick(document);
                                                }
                                            }}
                                        >
                                            {/* Document Content */}
                                            <div className="w-full h-full bg-gradient-to-br from-slate-50 to-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
                                                {/* Document Type Badge */}
                                                <div className="absolute top-2 right-2">
                                                    <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full">
                                                        DOCS
                                                    </span>
                                                </div>
                                                
                                                {/* Document Icon */}
                                                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg mb-3">
                                                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.707.293H19a2 2 0 012 2v11a2 2 0 01-2 2H7a2 2 0 01-2-2V9z" />
                                                    </svg>
                                                </div>
                                                
                                                {/* Document Info */}
                                                <div className="text-center space-y-2">
                                                    <p className="text-xs font-semibold text-gray-800 truncate max-w-full px-2">
                                                        {document.filename || 'Document'}
                                                    </p>
                                                    <p className="text-[11px] text-gray-500">
                                                        {document.filename ? getDocumentType(document.filename) : 'Unknown Type'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Hover Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/40 to-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                                                <div className="text-white text-center">
                                                    <svg className="w-5 h-5 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                    </svg>
                                                    <span className="text-xs font-medium">Preview Document</span>
                                                </div>
                                            </div>

                                            {/* Selection Checkbox */}
                                            {isSelectionMode && (
                                                <div className="absolute top-2 left-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedDocuments.has(index)}
                                                        onChange={(e) => handleDocumentSelect(index, e.shiftKey)}
                                                        className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    No documents available for this project
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
                        closeImagePopup();
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
                                <span className={`ml-1 px-2 py-1 rounded text-xs font-medium ${
                                    project.status === 'completed' ? 'bg-green-600' :
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
                                <p>No preview available</p>
                                <a
                                    href={selectedDocument.url || '#'}
                                    download={selectedDocument.filename || 'document.docx'}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mt-4"
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