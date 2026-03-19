import React, { useState } from 'react';
import { showSuccessToast, showErrorToast } from '../Utils/alerts';
import { Head, router } from '@inertiajs/react';

export default function ProjectGalleryModal({ show, project, onClose, onBackToDetails }) {
    const [displayMode, setDisplayMode] = useState('grid'); // grid, list
    const [selectedImages, setSelectedImages] = useState(new Set()); // Set of selected image indices
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null); // For popup display
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

    const handleImageClick = (image) => {
        if (isSelectionMode) return; // Don't show popup when in selection mode
        setSelectedImage(image);
    };

    const closeImagePopup = () => {
        setSelectedImage(null);
    };

    const navigateImage = (direction) => {
        if (!project.images || project.images.length === 0) return;
        
        // Find current image index with multiple fallback methods
        let currentIndex = -1;
        
        // Method 1: Direct object comparison
        currentIndex = project.images.findIndex(img => img === selectedImage);
        
        // Method 2: Compare by image_path
        if (currentIndex === -1 && selectedImage?.image_path) {
            currentIndex = project.images.findIndex(img => img.image_path === selectedImage.image_path);
        }
        
        // Method 3: Compare by url
        if (currentIndex === -1 && selectedImage?.url) {
            currentIndex = project.images.findIndex(img => img.url === selectedImage.url);
        }
        
        // Method 4: Compare by id if available
        if (currentIndex === -1 && selectedImage?.id) {
            currentIndex = project.images.findIndex(img => img.id === selectedImage.id);
        }
        
        // If still not found, use first image
        if (currentIndex === -1) {
            currentIndex = 0;
        }
        
        let newIndex = currentIndex + direction;
        
        // Wrap around for circular navigation
        if (newIndex < 0) newIndex = project.images.length - 1;
        if (newIndex >= project.images.length) newIndex = 0;
        
        setSelectedImage(project.images[newIndex]);
    };

    const handleImageSelect = (index, isShiftClick = false) => {
        const newSelected = new Set(selectedImages);
        
        if (isShiftClick && lastSelectedIndex !== null) {
            // Select range between lastSelectedIndex and current index
            const start = Math.min(lastSelectedIndex, index);
            const end = Math.max(lastSelectedIndex, index);
            for (let i = start; i <= end; i++) {
                newSelected.add(i);
            }
        } else {
            // Toggle selection for single image
            if (newSelected.has(index)) {
                newSelected.delete(index);
            } else {
                newSelected.add(index);
            }
        }
        
        setSelectedImages(newSelected);
        setLastSelectedIndex(index);
    };

    const handleSelectAll = () => {
        if (selectedImages.size === project.images?.length) {
            setSelectedImages(new Set()); // Deselect all
        } else {
            setSelectedImages(new Set(project.images?.map((_, index) => index))); // Select all
        }
    };

    const handleDeleteImages = async () => {
        if (selectedImages.size === 0) return;
        
        // Get selected image IDs
        const imageIds = Array.from(selectedImages).map(index => project.images[index]?.id).filter(id => id);
        
        if (imageIds.length === 0) {
            showErrorToast('No valid images selected for archiving');
            return;
        }
        
        try {
            // Use Inertia router to make the request
            router.post('/api/archive-images', {
                imageIds: imageIds
            }, {
                onSuccess: (page) => {
                    const result = page.props.flash?.success || { archivedCount: imageIds.length };
                    showSuccessToast(`Moved ${result.archivedCount || imageIds.length} image(s) to archive`);
                    setSelectedImages(new Set());
                    setIsSelectionMode(false);
                },
                onError: (errors) => {
                    showErrorToast('Failed to archive images: ' + (errors.message || 'Unknown error'));
                },
                preserveScroll: true,
                preserveState: false
            });
        } catch (error) {
            showErrorToast('Error occurred while archiving images: ' + error.message);
        }
    };

    const toggleSelectionMode = () => {
        setIsSelectionMode(!isSelectionMode);
        setSelectedImages(new Set()); // Clear selections when toggling
    };

    return (
        <>
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4 py-8 transition-all duration-300"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-xl shadow-2xl w-[1800px] h-[600px] overflow-hidden border border-slate-200 transition-all duration-300 flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="flex items-center justify-between bg-[#Eb3505] text-white rounded-t-2xl px-6 py-4 sticky top-0 z-20">
                    <div className="flex-1 flex items-center">
                        <h3 className="text-lg font-semibold font-montserrat">Project Gallery</h3>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onBackToDetails}
                            className="px-4 py-2 bg-white/20 rounded-full text-sm font-montserrat hover:bg-white/30 transition"
                        >
                            Project Details
                        </button>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-white/20 rounded-full text-sm font-montserrat hover:bg-white/30 transition"
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
                                        {selectedImages.size === project.images?.length ? 'Deselect All' : 'Select All'}
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
                                    {isSelectionMode ? 'Cancel Selection' : 'Delete Images'}
                                </button>
                                {isSelectionMode && selectedImages.size > 0 && (
                                    <button
                                        onClick={handleDeleteImages}
                                        className="px-3 py-1 bg-red-600 text-white rounded-full text-xs font-montserrat hover:bg-red-700 transition-all"
                                    >
                                        Archived Images ({selectedImages.size})
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Gallery Images */}
                        <div className="p-4">
                            {project.images && project.images.length > 0 ? (
                                <div className={`grid gap-4 ${
                                    displayMode === 'grid' ? 'grid-cols-6' : 'grid-cols-1'
                                }`}>
                                    {project.images.map((image, index) => (
                                        <div
                                            key={index}
                                            className={`relative group cursor-pointer ${
                                                displayMode === 'grid' ? 'aspect-square' : 'h-32'
                                            }`}
                                            onClick={(e) => {
                                        if (isSelectionMode) {
                                            handleImageSelect(index, e.shiftKey);
                                        } else {
                                            handleImageClick(image);
                                        }
                                    }}
                                        >
                                            <img
                                                src={image.url || (image.image_path ? `/storage/${image.image_path}` : '')}
                                                alt={image.title || `Image ${index + 1}`}
                                                className={`w-full h-full object-cover rounded-lg transition-all ${
                                                    isSelectionMode ? selectedImages.has(index) ? 'ring-4 ring-red-500' : 'ring-2 ring-transparent hover:ring-blue-300' : ''
                                                }`}
                                            />
                                            {isSelectionMode && (
                                                <div className="absolute top-2 left-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedImages.has(index)}
                                                        onChange={(e) => handleImageSelect(index, e.shiftKey)}
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
                                    No images available for this project
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Image Popup */}
        {selectedImage && (
            <div
                className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                onClick={closeImagePopup}
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
                        {selectedImage.caption && (
                            <p className="mt-2 text-sm text-gray-200 italic">{selectedImage.caption}</p>
                        )}
                    </div>
                    
                    {/* Image */}
                    <img
                        src={selectedImage.url || (selectedImage.image_path ? `/storage/${selectedImage.image_path}` : '')}
                        alt={selectedImage.title || 'Project image'}
                        className="w-full h-full object-contain rounded-lg mt-20"
                    />
                </div>
            </div>
        )}
        </>
    );
}