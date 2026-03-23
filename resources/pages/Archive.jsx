import React, { useState, useMemo } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import PageLayout from '../js/Layouts/PageLayout';
import useAutoRefresh from '../js/Hooks/useAutoRefresh';
import { router } from '@inertiajs/react';
import { showRestoreConfirmation, showDeleteConfirmation, showSuccessToast, showErrorToast, showInfoToast } from '@/Utils/alerts';

export default function Archive({ archivedImages }) {
    const { archivedProjects, archivedCategories, archivedContractors } = usePage().props;
    const page = usePage();
    const [activeTab, setActiveTab] = useState('images');
    const [selectedImage, setSelectedImage] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [expandedProjects, setExpandedProjects] = useState(new Set());
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProject, setSelectedProject] = useState('all');
    const [selectedYear, setSelectedYear] = useState('all');
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedImages, setSelectedImages] = useState(new Set());
    const [isModalSelectionMode, setIsModalSelectionMode] = useState(false);
    const [modalSelectedImages, setModalSelectedImages] = useState(new Set());

    // Helper function to check if all images in a project are selected
    const areProjectImagesSelected = (groupKey, images) => {
        return images.every((image, imageIndex) => {
            const key = getImageKey(image, groupKey, imageIndex);
            return selectedImages.has(key);
        });
    };

    // Helper function to toggle selection for all images in a project
    const toggleProjectSelection = (groupKey, images) => {
        const allSelected = areProjectImagesSelected(groupKey, images);
        const newSelected = new Set(selectedImages);
        
        if (allSelected) {
            // Deselect all images in this project
            images.forEach((image, imageIndex) => {
                const key = getImageKey(image, groupKey, imageIndex);
                newSelected.delete(key);
            });
        } else {
            // Select all images in this project
            images.forEach((image, imageIndex) => {
                const key = getImageKey(image, groupKey, imageIndex);
                newSelected.add(key);
            });
        }
        
        setSelectedImages(newSelected);
    };

    const getImageKey = (image, groupKey, imageIndex) => {
        return `${groupKey}-${image.id}`;
    };

    const getAllArchivedImages = () => {
        return Object.values(filteredGroups).flatMap(group => group.images);
    };

    const getTotalArchivedImagesCount = () => {
        return getAllArchivedImages().length;
    };

    const areAllImagesSelected = () => {
        const allImages = getAllArchivedImages();
        if (allImages.length === 0) return false;
        
        return allImages.every(image => {
            const key = getImageKey(image, 
                `${getArchiveYear(image)}__${image.originalProject}`, 
                allImages.findIndex(img => img.id === image.id)
            );
            return selectedImages.has(key);
        });
    };

    // Modal selection functions
    const handleModalImageSelect = (index) => {
        const newSelected = new Set(modalSelectedImages);
        
        if (newSelected.has(index)) {
            newSelected.delete(index);
        } else {
            newSelected.add(index);
        }
        
        setModalSelectedImages(newSelected);
    };

    const handleModalSelectAll = () => {
        const allImages = getAllArchivedImages();
        
        if (modalSelectedImages.size === allImages.length) {
            setModalSelectedImages(new Set()); // Deselect all
        } else {
            setModalSelectedImages(new Set(allImages.map((_, index) => index))); // Select all
        }
    };

    const handleModalRestore = async () => {
        if (modalSelectedImages.size === 0) return;
        
        try {
            // Extract image IDs from selected indices
            const allImages = getAllArchivedImages();
            const imageIds = Array.from(modalSelectedImages).map(index => allImages[index]?.id).filter(id => id);
            
            const response = await fetch('/archive/restore', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                },
                body: JSON.stringify({
                    image_ids: imageIds
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                showSuccessToast(result.message);
                setModalSelectedImages(new Set());
                setIsModalSelectionMode(false);
                closeModal();
                // Refresh the page to show updated images
                window.location.reload();
            } else {
                showErrorToast(result.message);
            }
        } catch (error) {
            showErrorToast('Failed to restore images. Please try again.');
        }
    };

    const handleModalPermanentDelete = async () => {
        if (modalSelectedImages.size === 0) return;
        
        const result = await showDeleteConfirmation(`${modalSelectedImages.size} selected archived images`, 'images');
        
        if (result.isConfirmed) {
            try {
                const allImages = getAllArchivedImages();
                const imageIds = Array.from(modalSelectedImages).map(index => allImages[index]?.id).filter(id => id);
                
                const response = await fetch(route('archive.permanent-delete'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                    },
                    body: JSON.stringify({
                        image_ids: imageIds
                    })
                });
                
                const deleteResult = await response.json();
                
                if (deleteResult.success) {
                    showSuccessToast(deleteResult.message);
                    setModalSelectedImages(new Set());
                    setIsModalSelectionMode(false);
                    closeModal();
                    // Refresh the page to show updated images
                    window.location.reload();
                } else {
                    showErrorToast(deleteResult.message);
                }
            } catch (error) {
                showErrorToast('Failed to delete images. Please try again.');
            }
        }
    };

    const toggleModalSelectionMode = () => {
        setIsModalSelectionMode(!isModalSelectionMode);
        setModalSelectedImages(new Set()); // Clear selections when toggling
    };

    // Helper function to extract year from archived_at
    const getArchiveYear = (image) => {
        if (!image.archived_at) return "Unknown Year";
        return new Date(image.archived_at).getFullYear();
    };

    // Group archived images by year and project
    const groupedArchivedImages = useMemo(() => {
        // Handle both Laravel Collections and regular arrays
        const images = archivedImages && archivedImages.data ? archivedImages.data : 
                       archivedImages && Array.isArray(archivedImages) ? archivedImages :
                       archivedImages && typeof archivedImages.toArray === 'function' ? archivedImages.toArray() :
                       [];
        return images.reduce((groups, image) => {
            const year = getArchiveYear(image) || 'Unknown Year';
            const projectTitle = image.originalProject || 'Unknown Project';
            const groupKey = `${year}__${projectTitle}`;

            if (!groups[groupKey]) groups[groupKey] = { year, projectTitle, images: [] };
            groups[groupKey].images.push(image);
            return groups;
        }, {});
    }, [archivedImages]);

    // Get unique projects for filter
    const uniqueProjects = useMemo(() => {
        const images = archivedImages && archivedImages.data ? archivedImages.data : 
                       archivedImages && Array.isArray(archivedImages) ? archivedImages :
                       archivedImages && typeof archivedImages.toArray === 'function' ? archivedImages.toArray() :
                       [];
        return ['all', ...new Set(images.map(img => img.originalProject))];
    }, [archivedImages]);

    // Get available years for filter
    const getAvailableYears = () => {
        const images = archivedImages && archivedImages.data ? archivedImages.data : 
                       archivedImages && Array.isArray(archivedImages) ? archivedImages :
                       archivedImages && typeof archivedImages.toArray === 'function' ? archivedImages.toArray() :
                       [];
        const years = new Set();
        images.forEach(image => {
            const year = getArchiveYear(image);
            if (year && year !== 'Unknown Year') {
                years.add(String(year));
            }
        });
        return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
    };

    // Filter archived images
    const filteredGroups = useMemo(() => {
        const result = {};
        Object.entries(groupedArchivedImages).forEach(([groupKey, group]) => {
            const matchesProject = selectedProject === 'all' || group.projectTitle === selectedProject;
            const matchesYear = selectedYear === 'all' || String(group.year) === String(selectedYear);
            const matchesSearch = !searchTerm || 
                group.projectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                group.images.some(img => 
                    img.caption?.toLowerCase().includes(searchTerm.toLowerCase())
                );
            
            if (matchesProject && matchesYear && matchesSearch) {
                result[groupKey] = group;
            }
        });
        return result;
    }, [groupedArchivedImages, selectedProject, selectedYear, searchTerm]);

    // Clear all filters
    const clearAllFilters = () => {
        setSearchTerm('');
        setSelectedProject('all');
        setSelectedYear('all');
    };

    const openImageModal = (image, index) => {
        setSelectedImage(image);
        setCurrentImageIndex(index);
    };

    const closeModal = () => {
        setSelectedImage(null);
    };

    const navigateImage = (direction) => {
        const flatImages = Object.values(filteredGroups).flatMap(group => group.images);
        if (flatImages.length === 0) return;
        
        let currentIndex = flatImages.findIndex(img => img.id === selectedImage?.id);
        if (currentIndex === -1) currentIndex = 0;
        
        let newIndex = currentIndex + direction;
        if (newIndex < 0) newIndex = flatImages.length - 1;
        if (newIndex >= flatImages.length) newIndex = 0;
        
        setSelectedImage(flatImages[newIndex]);
        setCurrentImageIndex(newIndex);
    };

    React.useEffect(() => {
        const handleKeyDown = (e) => {
            if (!selectedImage) return;
            
            if (e.key === 'ArrowRight') navigateImage(1);
            if (e.key === 'ArrowLeft') navigateImage(-1);
            if (e.key === 'Escape') closeModal();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedImage]);

    const toggleImageSelection = (image, groupKey, imageIndex) => {
        const key = getImageKey(image, groupKey, imageIndex);
        const newSelected = new Set(selectedImages);
        
        if (newSelected.has(key)) {
            newSelected.delete(key);
        } else {
            newSelected.add(key);
        }
        
        setSelectedImages(newSelected);
    };

    const toggleSelectAll = () => {
        const allImages = getAllArchivedImages();
        
        if (areAllImagesSelected()) {
            // Deselect all
            setSelectedImages(new Set());
        } else {
            // Select all
            const allKeys = new Set();
            allImages.forEach(image => {
                const groupKey = `${getArchiveYear(image)}__${image.originalProject}`;
                const imageIndex = allImages.findIndex(img => img.id === image.id);
                const key = getImageKey(image, groupKey, imageIndex);
                allKeys.add(key);
            });
            setSelectedImages(allKeys);
        }
    };

    const toggleProjectExpansion = (groupKey) => {
        setExpandedProjects(prev => {
            const newSet = new Set(prev);
            if (newSet.has(groupKey)) {
                newSet.delete(groupKey);
            } else {
                newSet.add(groupKey);
            }
            return newSet;
        });
    };

    // Individual image restore function
    const handleRestoreImage = async (image) => {
        try {
            const result = await showRestoreConfirmation(image.caption || 'Image');
            
            if (result.isConfirmed) {
                router.post(route('archive.images.restore', image.id), {}, {
                    onSuccess: (page) => {
                        showSuccessToast(`Image "${image.caption || 'Untitled'}" restored successfully!`);
                        window.location.reload();
                    },
                    onError: (errors) => {
                        const errorMessage = errors?.message || errors?.error || 'Failed to restore image. Please try again.';
                        showErrorToast(errorMessage);
                    },
                    preserveState: false,
                });
            }
        } catch (error) {
            showErrorToast('An unexpected error occurred. Please try again.');
        }
    };

    // Individual image delete function
    const handleDeleteImage = async (image) => {
        try {
            const result = await showDeleteConfirmation(image.caption || 'Image', 'image');
            
            if (result.isConfirmed) {
                router.delete(route('archive.images.delete', image.id), {}, {
                    onSuccess: (page) => {
                        showSuccessToast(`Image "${image.caption || 'Untitled'}" permanently deleted!`);
                        window.location.reload();
                    },
                    onError: (errors) => {
                        const errorMessage = errors?.message || errors?.error || 'Failed to delete image. Please try again.';
                        showErrorToast(errorMessage);
                    },
                    preserveState: false,
                });
            }
        } catch (error) {
            showErrorToast('An unexpected error occurred. Please try again.');
        }
    };

    const handleRestore = async () => {
        if (selectedImages.size === 0) return;
        
        try {
            // Extract image IDs from selected keys - the image ID is the last part after the last dash
            const imageIds = Array.from(selectedImages).map(key => {
                const lastDashIndex = key.lastIndexOf('-');
                return parseInt(key.substring(lastDashIndex + 1));
            });
            
            
            // Check if we have valid IDs
            if (imageIds.some(id => isNaN(id))) {
                showErrorToast('Invalid image selection. Please try again.');
                return;
            }
            
            // Try multiple sources for CSRF token
            let csrfToken = page.props.csrf_token;
            
            // If not in props, try meta tag
            if (!csrfToken) {
                csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            }
            
            // If still not found, try to get from cookie (Laravel default)
            if (!csrfToken) {
                const cookies = document.cookie.split(';');
                for (let cookie of cookies) {
                    const [name, value] = cookie.trim().split('=');
                    if (name === 'XSRF-TOKEN') {
                        csrfToken = decodeURIComponent(value);
                        break;
                    }
                }
            }
            
            
            if (!csrfToken) {
                showErrorToast('Security token missing. Please refresh the page.');
                return;
            }
            
            const response = await fetch('/archive/restore', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    image_ids: imageIds
                })
            });
            
            
            // Check if response is JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                showErrorToast('Server error. Please try again.');
                return;
            }
            
            const result = await response.json();
            
            if (result.success) {
                showSuccessToast(result.message);
                setSelectedImages(new Set());
                // Refresh the page to show updated images
                window.location.reload();
            } else {
                showErrorToast(result.message || 'Failed to restore images');
            }
        } catch (error) {
            showErrorToast('Failed to restore images. Please try again.');
        }
    };

    const handlePermanentDelete = async () => {
        if (selectedImages.size === 0) return;
        
        const result = await showDeleteConfirmation(`${selectedImages.size} selected archived images`, 'images');
        
        if (result.isConfirmed) {
            try {
                // Extract image IDs from selected keys - the image ID is the last part after the last dash
                const imageIds = Array.from(selectedImages).map(key => {
                    const lastDashIndex = key.lastIndexOf('-');
                    return parseInt(key.substring(lastDashIndex + 1));
                });
                
                
                const response = await fetch(route('archive.permanent-delete'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                    },
                    body: JSON.stringify({
                        image_ids: imageIds
                    })
                });
                
                const deleteResult = await response.json();
                
                if (deleteResult.success) {
                    showSuccessToast(deleteResult.message);
                    setSelectedImages(new Set());
                    // Refresh the page to show updated images
                    window.location.reload();
                } else {
                    showErrorToast(deleteResult.message);
                }
            } catch (error) {
                showErrorToast('Failed to delete images. Please try again.');
            }
        }
    };

    
    // Archived Projects Component
    const ArchivedProjectsContent = ({ archivedProjects }) => {
        const [searchTerm, setSearchTerm] = useState('');

        const handleSearch = (term) => {
            setSearchTerm(term);
            router.get(route('archive.index'), {
                search: term || null
            }, { preserveState: true, replace: true });
        };

        const handleRestore = async (project) => {
            try {
                const result = await showRestoreConfirmation(project.title);
                
                if (result.isConfirmed) {
                    router.post(route('archive.projects.restore', project.id), {}, {
                        onSuccess: () => {
                            showSuccessToast(`Project "${project.title}" restored successfully!`);
                        },
                        onError: (errors) => {
                            showErrorToast('Failed to restore project. Please try again.');
                        }
                    });
                }
            } catch (error) {
                showErrorToast('An unexpected error occurred. Please try again.');
            }
        };

        const handlePermanentDelete = async (project) => {
            try {
                const result = await showDeleteConfirmation(project.title, 'project');
                
                if (result.isConfirmed) {
                    router.delete(route('archive.projects.delete', project.id), {}, {
                        onSuccess: () => {
                            showSuccessToast(`Project "${project.title}" permanently deleted!`);
                        },
                        onError: (errors) => {
                            showErrorToast('Failed to delete project. Please try again.');
                        }
                    });
                }
            } catch (error) {
                showErrorToast('An unexpected error occurred. Please try again.');
            }
        };

        return (
            <div>
                {/* Search for Projects */}
                <div className="p-4 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search archived projects..."
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#Eb3505] focus:border-transparent font-montserrat text-sm w-64"
                            />
                        </div>
                        <div className="text-sm text-slate-600">
                            {archivedProjects?.total || 0} archived projects
                        </div>
                    </div>
                </div>

                {/* Archived Projects Table */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    {(!archivedProjects?.data || archivedProjects.data.length === 0) ? (
                        <div className="text-center py-12">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
                                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-slate-600 mt-4">No Archived Projects</h3>
                            <p className="text-slate-500 mt-2">Projects that you archive will appear here for recovery.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left bg-white">
                                {/* Header */}
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold text-slate-700 uppercase tracking-wider">
                                            Project Name
                                        </th>
                                        <th className="px-6 py-4 font-semibold text-slate-700 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th className="px-6 py-4 font-semibold text-slate-700 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 font-semibold text-slate-700 uppercase tracking-wider">
                                            Archived Date
                                        </th>
                                        <th className="px-6 py-4 text-center font-semibold text-slate-700 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                {/* Body */}
                                <tbody className="divide-y divide-slate-100">
                                    {archivedProjects.data.map((project) => (
                                        <tr
                                            key={project.id}
                                            className="hover:bg-slate-50 transition-colors border-b border-slate-100"
                                        >
                                            {/* Project Name */}
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-slate-900">{project.title}</div>
                                            </td>

                                            {/* Category */}
                                            <td className="px-6 py-4 text-slate-600">
                                                {project.category?.name || 'Uncategorized'}
                                            </td>

                                            {/* Status */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                                    project.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                                                    project.status === 'pending' ? 'bg-red-100 text-red-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {project.status}
                                                </span>
                                            </td>

                                            {/* Archived Date */}
                                            <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                                                {new Date(project.updated_at).toLocaleDateString()}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="flex items-center justify-center gap-3">
                                                    <button
                                                        onClick={() => handleRestore(project)}
                                                        className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium shadow-sm"
                                                    >
                                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                                        </svg>
                                                        Restore
                                                    </button>
                                                    <button
                                                        onClick={() => handlePermanentDelete(project)}
                                                        className="inline-flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium shadow-sm"
                                                    >
                                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination for Projects */}
                    {archivedProjects?.data && archivedProjects.data.length > 0 && (
                        <div className="mt-6 flex items-center justify-between">
                            <div className="text-sm text-slate-600">
                                Showing {archivedProjects.from || 1} to {archivedProjects.to || (archivedProjects?.data?.length || 0)} of {archivedProjects.total || 0} archived projects
                            </div>
                            <div className="flex items-center justify-center gap-2">
                                {/* Previous Button */}
                                <Link
                                    href={archivedProjects.prev_page_url || '#'}
                                    className={`p-2 rounded-lg border transition font-montserrat text-sm font-medium ${
                                        archivedProjects.prev_page_url
                                            ? "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                                            : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                                    }`}
                                    preserveScroll
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                    </svg>
                                </Link>

                                {/* Page Numbers */}
                                <div className="flex items-center gap-1">
                                    {archivedProjects.links?.map((link, index) => {
                                        // Skip first and last links (they are arrow buttons)
                                        if (index === 0 || index === archivedProjects.links.length - 1) {
                                            return null;
                                        }
                                        if (link.label === '...' || !link.url) {
                                            return (
                                                <span key={index} className="px-3 py-2 text-slate-500">
                                                    {link.label}
                                                </span>
                                            );
                                        }
                                        return (
                                            <Link
                                                key={index}
                                                href={link.url || '#'}
                                                className={`px-3 py-2 rounded-lg border transition font-montserrat text-sm font-medium ${
                                                    link.active
                                                        ? "bg-[#Eb3505] text-white border-[#Eb3505]"
                                                        : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                                                }`}
                                                preserveScroll
                                            >
                                                {link.label}
                                            </Link>
                                        );
                                    })}
                                </div>

                                {/* Next Button */}
                                <Link
                                    href={archivedProjects.next_page_url || '#'}
                                    className={`p-2 rounded-lg border transition font-montserrat text-sm font-medium ${
                                        archivedProjects.next_page_url
                                            ? "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                                            : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                                    }`}
                                    preserveScroll
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Archived Categories Component
    const ArchivedCategoriesContent = ({ archivedCategories }) => {
        const [searchTerm, setSearchTerm] = useState('');

        const handleSearch = (term) => {
            setSearchTerm(term);
            router.get(route('archive.index'), {
                search: term || null
            }, { preserveState: true, replace: true });
        };

        const handleRestore = async (category) => {
            try {
                console.log('Attempting to restore category:', category);
                const result = await showRestoreConfirmation(category.name);
                
                if (result.isConfirmed) {
                    console.log('User confirmed, sending request to:', route('archive.categories.restore', category.id));
                    
                    router.post(route('archive.categories.restore', category.id), {}, {
                        onSuccess: (page) => {
                            console.log('Category restore successful:', page);
                            showSuccessToast(`Category "${category.name}" restored successfully!`);
                            // Redirect to categories page to see the restored category
                            window.location.href = route('categories.index');
                        },
                        onError: (errors) => {
                            console.error('Category restore errors:', errors);
                            const errorMessage = errors?.message || errors?.error || 'Failed to restore category. Please try again.';
                            showErrorToast(errorMessage);
                        }
                    });
                }
            } catch (error) {
                console.error('Category restore error:', error);
                showErrorToast('An unexpected error occurred. Please try again.');
            }
        };

        const handlePermanentDelete = async (category) => {
            try {
                const result = await showDeleteConfirmation(category.name, 'category');
                
                if (result.isConfirmed) {
                    router.delete(route('archive.categories.delete', category.id), {}, {
                        onSuccess: () => {
                            showSuccessToast(`Category "${category.name}" permanently deleted!`);
                        },
                        onError: (errors) => {
                            showErrorToast('Failed to delete category. Please try again.');
                        }
                    });
                }
            } catch (error) {
                showErrorToast('An unexpected error occurred. Please try again.');
            }
        };

        return (
            <div>
                {/* Search for Categories */}
                <div className="p-4 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search archived categories..."
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#Eb3505] focus:border-transparent font-montserrat text-sm w-64"
                            />

                        </div>
                        <div className="text-sm text-slate-600">
                            {archivedCategories?.total || 0} archived categories
                        </div>
                    </div>
                </div>

                {/* Archived Categories Table */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    {(!archivedCategories?.data || archivedCategories.data.length === 0) ? (
                        <div className="text-center py-12">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
                                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-slate-600 mt-4">No Archived Categories</h3>
                            <p className="text-slate-500 mt-2">Categories that you archive will appear here for recovery.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left bg-white">
                                {/* Header */}
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold text-slate-700 uppercase tracking-wider">
                                            Category Name
                                        </th>
                                        <th className="px-6 py-4 font-semibold text-slate-700 uppercase tracking-wider text-center">
                                            Total Projects
                                        </th>
                                        <th className="px-6 py-4 font-semibold text-slate-700 uppercase tracking-wider">
                                            Archived Date
                                        </th>
                                        <th className="px-6 py-4 text-center font-semibold text-slate-700 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                {/* Body */}
                                <tbody className="divide-y divide-slate-100">
                                    {archivedCategories.data.map((category) => (
                                        <tr
                                            key={category.id}
                                            className="hover:bg-slate-50 transition-colors border-b border-slate-100"
                                        >
                                            {/* Category Name */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-semibold text-slate-900">{category.name}</div>
                                            </td>

                                            {/* Project Count */}
                                            <td className="px-6 py-4 whitespace-nowrap text-slate-600 text-center">
                                                {category.projects_count}
                                            </td>

                                            {/* Archived Date */}
                                            <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                                                {category.archived_at ? new Date(category.archived_at).toLocaleDateString() : 'N/A'}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="flex items-center justify-center gap-3">
                                                    <button
                                                        onClick={() => handleRestore(category)}
                                                        className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium shadow-sm"
                                                    >
                                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                                        </svg>
                                                        Restore
                                                    </button>
                                                    <button
                                                        onClick={() => handlePermanentDelete(category)}
                                                        className="inline-flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium shadow-sm"
                                                    >
                                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination for Categories */}
                    {archivedCategories?.data && archivedCategories.data.length > 0 && (
                        <div className="mt-6 flex items-center justify-between">
                            <div className="text-sm text-slate-600">
                                Showing {archivedCategories.from || 1} to {archivedCategories.to || (archivedCategories?.data?.length || 0)} of {archivedCategories.total || 0} archived categories
                            </div>
                            <div className="flex items-center justify-center gap-2">
                                {/* Previous Button */}
                                <Link
                                    href={archivedCategories.prev_page_url || '#'}
                                    className={`p-2 rounded-lg border transition font-montserrat text-sm font-medium ${
                                        archivedCategories.prev_page_url
                                            ? "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                                            : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                                    }`}
                                    preserveScroll
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                    </svg>
                                </Link>

                                {/* Page Numbers */}
                                <div className="flex items-center gap-1">
                                    {archivedCategories.links?.map((link, index) => {
                                        // Skip first and last links (they are arrow buttons)
                                        if (index === 0 || index === archivedCategories.links.length - 1) {
                                            return null;
                                        }
                                        if (link.label === '...' || !link.url) {
                                            return (
                                                <span key={index} className="px-3 py-2 text-slate-500">
                                                    {link.label}
                                                </span>
                                            );
                                        }
                                        return (
                                            <Link
                                                key={index}
                                                href={link.url || '#'}
                                                className={`px-3 py-2 rounded-lg border transition font-montserrat text-sm font-medium ${
                                                    link.active
                                                        ? "bg-[#Eb3505] text-white border-[#Eb3505]"
                                                        : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                                                }`}
                                                preserveScroll
                                            >
                                                {link.label}
                                            </Link>
                                        );
                                    })}
                                </div>

                                {/* Next Button */}
                                <Link
                                    href={archivedCategories.next_page_url || '#'}
                                    className={`p-2 rounded-lg border transition font-montserrat text-sm font-medium ${
                                        archivedCategories.next_page_url
                                            ? "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                                            : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                                    }`}
                                    preserveScroll
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Archived Contractors Component
    const ArchivedContractorsContent = ({ archivedContractors }) => {
        const [searchTerm, setSearchTerm] = useState('');

        const handleSearch = (term) => {
            setSearchTerm(term);
            router.get(route('archive.index'), {
                search: term || null
            }, { preserveState: true, replace: true });
        };

        const handleRestore = async (contractor) => {
            try {
                console.log('Attempting to restore contractor:', contractor);
                const result = await showRestoreConfirmation(contractor.contractor_name);
                
                if (result.isConfirmed) {
                    console.log('User confirmed, sending request to:', route('archive.contractors.restore', contractor.contractor_name));
                    
                    router.post(route('archive.contractors.restore', contractor.contractor_name), {}, {
                        onSuccess: (page) => {
                            console.log('Contractor restore successful:', page);
                            showSuccessToast(`Contractor "${contractor.contractor_name}" restored successfully!`);
                        },
                        onError: (errors) => {
                            console.error('Contractor restore errors:', errors);
                            const errorMessage = errors?.message || errors?.error || 'Failed to restore contractor. Please try again.';
                            showErrorToast(errorMessage);
                        }
                    });
                }
            } catch (error) {
                console.error('Contractor restore error:', error);
                showErrorToast('An unexpected error occurred. Please try again.');
            }
        };

        const handlePermanentDelete = async (contractor) => {
            try {
                const result = await showDeleteConfirmation(contractor.contractor_name, 'contractor');
                
                if (result.isConfirmed) {
                    router.delete(route('archive.contractors.delete', contractor.contractor_name), {}, {
                        onSuccess: () => {
                            showSuccessToast(`Contractor "${contractor.contractor_name}" permanently deleted!`);
                        },
                        onError: (errors) => {
                            showErrorToast('Failed to delete contractor. Please try again.');
                        }
                    });
                }
            } catch (error) {
                showErrorToast('An unexpected error occurred. Please try again.');
            }
        };

        return (
            <div>
                {/* Search for Contractors */}
                <div className="p-4 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search archived contractors..."
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#Eb3505] focus:border-transparent font-montserrat text-sm w-64"
                            />

                        </div>
                        <div className="text-sm text-slate-600">
                            {archivedContractors?.total || 0} archived contractors
                        </div>
                    </div>
                </div>

                {/* Archived Contractors Table */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    {(!archivedContractors?.data || archivedContractors.data.length === 0) ? (
                        <div className="text-center py-12">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
                                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-slate-600 mt-4">No Archived Contractors</h3>
                            <p className="text-slate-500 mt-2">Contractors that you archive will appear here for recovery.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left bg-white">
                                {/* Header */}
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold text-slate-700 uppercase tracking-wider">
                                            Contractor Name
                                        </th>
                                        <th className="px-6 py-4 font-semibold text-slate-700 uppercase tracking-wider text-center">
                                            Total Projects
                                        </th>
                                        <th className="px-6 py-4 font-semibold text-slate-700 uppercase tracking-wider">
                                            Archived Date
                                        </th>
                                        <th className="px-6 py-4 text-center font-semibold text-slate-700 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                {/* Body */}
                                <tbody className="divide-y divide-slate-100">
                                    {archivedContractors.data.map((contractor) => (
                                        <tr
                                            key={contractor.contractor_name}
                                            className="hover:bg-slate-50 transition-colors border-b border-slate-100"
                                        >
                                            {/* Contractor Name */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-semibold text-slate-900">{contractor.contractor_name}</div>
                                            </td>

                                            {/* Project Count */}
                                            <td className="px-6 py-4 whitespace-nowrap text-slate-600 text-center">
                                                {contractor.projects_count}
                                            </td>

                                            {/* Archived Date */}
                                            <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                                                {contractor.archived_at ? new Date(contractor.archived_at).toLocaleDateString() : 'N/A'}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="flex items-center justify-center gap-3">
                                                    <button
                                                        onClick={() => handleRestore(contractor)}
                                                        className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium shadow-sm"
                                                    >
                                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                                        </svg>
                                                        Restore
                                                    </button>
                                                    <button
                                                        onClick={() => handlePermanentDelete(contractor)}
                                                        className="inline-flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium shadow-sm"
                                                    >
                                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination for Contractors */}
                    {archivedContractors?.data && archivedContractors.data.length > 0 && (
                        <div className="mt-6 flex items-center justify-between">
                            <div className="text-sm text-slate-600">
                                Showing {archivedContractors.from || 1} to {archivedContractors.to || (archivedContractors?.data?.length || 0)} of {archivedContractors.total || 0} archived contractors
                            </div>
                            <div className="flex items-center justify-center gap-2">
                                {/* Previous Button */}
                                <Link
                                    href={archivedContractors.prev_page_url || '#'}
                                    className={`p-2 rounded-lg border transition font-montserrat text-sm font-medium ${
                                        archivedContractors.prev_page_url
                                            ? "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                                            : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                                    }`}
                                    preserveScroll
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                    </svg>
                                </Link>

                                {/* Page Numbers */}
                                <div className="flex items-center gap-1">
                                    {archivedContractors.links?.map((link, index) => {
                                        // Skip first and last links (they are arrow buttons)
                                        if (index === 0 || index === archivedContractors.links.length - 1) {
                                            return null;
                                        }
                                        if (link.label === '...' || !link.url) {
                                            return (
                                                <span key={index} className="px-3 py-2 text-slate-500">
                                                    {link.label}
                                                </span>
                                            );
                                        }
                                        return (
                                            <Link
                                                key={index}
                                                href={link.url || '#'}
                                                className={`px-3 py-2 rounded-lg border transition font-montserrat text-sm font-medium ${
                                                    link.active
                                                        ? "bg-[#Eb3505] text-white border-[#Eb3505]"
                                                        : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                                                }`}
                                                preserveScroll
                                            >
                                                {link.label}
                                            </Link>
                                        );
                                    })}
                                </div>

                                {/* Next Button */}
                                <Link
                                    href={archivedContractors.next_page_url || '#'}
                                    className={`p-2 rounded-lg border transition font-montserrat text-sm font-medium ${
                                        archivedContractors.next_page_url
                                            ? "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                                            : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                                    }`}
                                    preserveScroll
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <PageLayout
            header={
                <Head title="Archive" />
            }
        >
            <div className="py-20">
                <h1 className="text-3xl font-bold text-slate-900 font-montserrat leading-none" style={{ fontSize: '2rem', lineHeight: '0.8' }}>Archive</h1>
            </div>
            
            <div className="min-h-screen">
                {/* Tab Navigation */}
                <div className="sticky top-0 z-30">
                    <div className="max-w-7xl mx-auto px-6 py-4">
                        <div className="flex gap-2">
                            {['images', 'projects', 'categories', 'contractors'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-2 rounded-full text-sm font-montserrat transition-all ${
                                        activeTab === tab
                                            ? 'bg-[#010066] text-white shadow'
                                            : 'bg-gray-100 text-[#010066] hover:bg-gray-200'
                                    }`}
                                >
                                    {tab === 'images' ? 'Archived Images' : tab === 'projects' ? 'Archived Projects' : tab === 'categories' ? 'Archived Categories' : 'Archived Contractors'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Content based on active tab */}
                {activeTab === 'images' ? (
                    /* Images Content */
                    <div>
                        {/* Filters */}
                        <div className="max-w-7xl mx-auto px-6 py-4">
                            <div className="flex justify-end">
                                <div className="flex items-center gap-2">
                                    {/* Search */}
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Search archived photos..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#Eb3505] focus:border-transparent"
                                            style={{ width: '200px', minWidth: '300px' }}
                                        />
                                        
                                    </div>

                                    {/* Project Filter */}
                                    <select
                                        value={selectedProject}
                                        onChange={(e) => setSelectedProject(e.target.value)}
                                        className="px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#Eb3505] focus:border-transparent"
                                        style={{ width: '200px', minWidth: '200px' }}
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
                                        className="px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#Eb3505] focus:border-transparent"
                                        style={{ width: '180px', minWidth: '180px' }}
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

                        {/* Archived Images Gallery */}
                        <div className="max-w-7xl mx-auto px-6 py-8">
                            {Object.keys(filteredGroups).length === 0 ? (
                                <div className="text-center py-20">
                                    <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 rounded-full mb-6">
                                        <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold text-slate-900 mb-2">No archived images found</h3>
                                    <p className="text-slate-500">Archived images will appear here for recovery.</p>
                                </div>
                            ) : (
                                <div className="space-y-12">
                                    {Object.entries(filteredGroups).map(([groupKey, group]) => {
                                        const { year, projectTitle, images } = group;
                                        
                                        return (
                                            <div key={groupKey} className="space-y-0">
                                                {/* Year Display - Bookmark Style */}
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

                                                {/* Project Section */}
                                                <div className="bg-white border border-slate-200 overflow-hidden shadow-sm">
                                                    {/* Project Header */}
                                                    <div 
                                                        onClick={() => toggleProjectExpansion(groupKey)}
                                                        className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200 cursor-pointer shadow-sm hover:shadow-md transition-all duration-200"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex-1">
                                                                <h3 className="text-xl font-bold text-slate-900 font-montserrat">
                                                                    {projectTitle}
                                                                </h3>
                                                                <div className="flex items-center gap-4 mt-2">
                                                                    <span className="text-sm text-slate-500">
                                                                        Archived
                                                                    </span>
                                                                    <span className="text-sm text-slate-500 font-medium">
                                                                        {images.length} {images.length === 1 ? 'photo' : 'photos'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {/* Select All Checkbox - Always Visible */}
                                                                <div className="flex items-center gap-2 px-3 py-1 bg-[#010066] text-white rounded-full text-xs font-montserrat">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={areProjectImagesSelected(groupKey, images)}
                                                                        onChange={(e) => {
                                                                            e.stopPropagation();
                                                                            toggleProjectSelection(groupKey, images);
                                                                        }}
                                                                        className="w-3 h-3 text-white rounded focus:ring-[#010066] bg-[#010066] border-white"
                                                                    />
                                                                    <span className="text-white">
                                                                        {areProjectImagesSelected(groupKey, images) ? 'Deselect All' : 'Select All'}
                                                                    </span>
                                                                </div>
                                                                
                                                                {/* Restore and Delete Buttons */}
                                                                <button
                                                                    onClick={async (e) => {
                                                                        e.stopPropagation();
                                                                        try {
                                                                            // Try multiple sources for CSRF token
                                                                            let csrfToken = page.props.csrf_token;
                                                                            
                                                                            // If not in props, try meta tag
                                                                            if (!csrfToken) {
                                                                                csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
                                                                            }
                                                                            
                                                                            // If still not found, try to get from cookie (Laravel default)
                                                                            if (!csrfToken) {
                                                                                const cookies = document.cookie.split(';');
                                                                                for (let cookie of cookies) {
                                                                                    const [name, value] = cookie.trim().split('=');
                                                                                    if (name === 'XSRF-TOKEN') {
                                                                                        csrfToken = decodeURIComponent(value);
                                                                                        break;
                                                                                    }
                                                                                }
                                                                            }
                                                                            
                                                                            
                                                                            if (!csrfToken) {
                                                                                showErrorToast('Security token missing. Please refresh the page.');
                                                                                return;
                                                                            }
                                                                            
                                                                            const response = await fetch('/archive/projects/restore-images', {
                                                                                method: 'POST',
                                                                                headers: {
                                                                                    'Content-Type': 'application/json',
                                                                                    'X-CSRF-TOKEN': csrfToken,
                                                                                    'Accept': 'application/json'
                                                                                },
                                                                                body: JSON.stringify({
                                                                                    project_title: projectTitle
                                                                                })
                                                                            });
                                                                            
                                                                            
                                                                            // Check if response is JSON
                                                                            const contentType = response.headers.get('content-type');
                                                                            if (!contentType || !contentType.includes('application/json')) {
                                                                                const text = await response.text();
                                                                                showErrorToast('Server error. Please try again.');
                                                                                return;
                                                                            }
                                                                            
                                                                            const result = await response.json();
                                                                            
                                                                            if (result.success) {
                                                                                showSuccessToast(result.message);
                                                                                // Refresh the page to show updated images
                                                                                window.location.reload();
                                                                            } else {
                                                                                showErrorToast(result.message);
                                                                            }
                                                                        } catch (error) {
                                                                            showErrorToast('Failed to restore images. Please try again.');
                                                                        }
                                                                    }}
                                                                    className="px-2 py-1 bg-green-600 text-white rounded text-xs font-montserrat hover:bg-green-700 transition-all flex items-center gap-1"
                                                                    title={`Restore all ${images.length} images`}
                                                                >
                                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                                                    </svg>
                                                                    Restore
                                                                </button>
                                                                <button
                                                                    onClick={async (e) => {
                                                                        e.stopPropagation();
                                                                        
                                                                        const result = await showDeleteConfirmation(`${images.length} archived images from "${projectTitle}"`, 'images');
                                                                        
                                                                        if (result.isConfirmed) {
                                                                            try {
                                                                                const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
                                                                                const response = await fetch('/archive/projects/delete-images', {
                                                                                    method: 'POST',
                                                                                    headers: {
                                                                                        'Content-Type': 'application/json',
                                                                                        'X-CSRF-TOKEN': csrfToken
                                                                                    },
                                                                                    body: JSON.stringify({
                                                                                        project_title: projectTitle
                                                                                    })
                                                                                });
                                                                                
                                                                                const deleteResult = await response.json();
                                                                                
                                                                                if (deleteResult.success) {
                                                                                    showSuccessToast(deleteResult.message);
                                                                                    // Refresh the page to show updated images
                                                                                    window.location.reload();
                                                                                } else {
                                                                                    showErrorToast(deleteResult.message);
                                                                                }
                                                                            } catch (error) {
                                                                                showErrorToast('Failed to delete images. Please try again.');
                                                                            }
                                                                        }
                                                                    }}
                                                                    className="px-2 py-1 bg-red-600 text-white rounded text-xs font-montserrat hover:bg-red-700 transition-all flex items-center gap-1"
                                                                    title={`Permanently delete all ${images.length} images`}
                                                                >
                                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                    </svg>
                                                                    Delete
                                                                </button>
                                                                <button
                                                                    onClick={() => toggleProjectExpansion(groupKey)}
                                                                    className="cursor-pointer hover:text-slate-600 transition-colors"
                                                                >
                                                                    <svg 
                                                                        className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
                                                                            expandedProjects.has(groupKey) ? 'rotate-180' : ''
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
                                                        style={{ maxHeight: expandedProjects.has(groupKey) ? '1000px' : '0px' }}
                                                    >
                                                        <div className="p-4">
                                                            <div className="flex flex-wrap gap-3">
                                                                {images.map((image, imageIndex) => {
                                                                    const key = getImageKey(image, groupKey, imageIndex);
                                                                    return (
                                                                        <div
                                                                            key={image.id}
                                                                            className="group relative w-20 h-20 overflow-hidden rounded cursor-pointer bg-slate-50 hover:shadow-md transition-all duration-300 hover:scale-105 flex-shrink-0"
                                                                            onClick={() => {
                                                                                // If no images are selected yet, start selection with this image
                                                                                if (selectedImages.size === 0) {
                                                                                    const key = getImageKey(image, groupKey, imageIndex);
                                                                                    setSelectedImages(new Set([key]));
                                                                                } else {
                                                                                    toggleImageSelection(image, groupKey, imageIndex);
                                                                                }
                                                                            }}
                                                                        >
                                                                            {/* Always show checkbox when images are selected OR when this image is the first one being selected */}
                                                                            {(selectedImages.size > 0) && (
                                                                                <div className="absolute top-1 left-1 z-10">
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        checked={selectedImages.has(key)}
                                                                                        onChange={(e) => {
                                                                                            e.stopPropagation();
                                                                                            toggleImageSelection(image, groupKey, imageIndex);
                                                                                        }}
                                                                                        className="w-3 h-3 text-[#Eb3505] rounded focus:ring-[#Eb3505]"
                                                                                    />
                                                                                </div>
                                                                            )}
                                                                            <img
                                                                                src={image.url}
                                                                                alt={image.caption || `Archived image ${imageIndex + 1}`}
                                                                                className="w-full h-full object-cover"
                                                                                loading="lazy"
                                                                                width="96"
                                                                                height="96"
                                                                            />
                                                                            
                                                                            {/* Hover Overlay */}
                                                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                                                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-center">
                                                                                    <div className="flex flex-col gap-1">
                                                                                        <div 
                                                                                            className="cursor-pointer"
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                openImageModal(image, imageIndex);
                                                                                            }}
                                                                                        >
                                                                                            <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                                                                            </svg>
                                                                                        </div>
                                                                                        <div className="flex gap-1 justify-center">
                                                                                            <button
                                                                                                onClick={(e) => {
                                                                                                    e.stopPropagation();
                                                                                                    handleRestoreImage(image);
                                                                                                }}
                                                                                                className="p-0.5 bg-green-600 rounded hover:bg-green-700 transition-colors"
                                                                                                title="Restore this image"
                                                                                            >
                                                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                                                                                </svg>
                                                                                            </button>
                                                                                            <button
                                                                                                onClick={(e) => {
                                                                                                    e.stopPropagation();
                                                                                                    handleDeleteImage(image);
                                                                                                }}
                                                                                                className="p-0.5 bg-red-600 rounded hover:bg-red-700 transition-colors"
                                                                                                title="Delete this image permanently"
                                                                                            >
                                                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                                                </svg>
                                                                                            </button>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>

                                                                            {/* Archive Date Badge */}
                                                                            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                                                <div className="bg-black/60 backdrop-blur-sm text-white text-xs px-1 py-0.5 rounded">
                                                                                    {image.archived_at ? new Date(image.archived_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                ) : activeTab === 'projects' ? (
                    /* Projects Content */
                    <ArchivedProjectsContent archivedProjects={archivedProjects} />
                ) : activeTab === 'categories' ? (
                    /* Categories Content */
                    <ArchivedCategoriesContent archivedCategories={archivedCategories} />
                ) : (
                    /* Contractors Content */
                    <ArchivedContractorsContent archivedContractors={archivedContractors} />
                )}
            </div>

            {/* Floating Action Buttons */}
            {selectedImages.size > 0 && (
                <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-40">
                    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex flex-col gap-2">
                        <div className="text-xs font-medium text-gray-600 px-2 py-1">
                            {selectedImages.size} selected
                        </div>
                        <button
                            onClick={handleRestore}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                            </svg>
                            Restore
                        </button>
                        <button
                            onClick={handlePermanentDelete}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                        </button>
                        <button
                            onClick={() => setSelectedImages(new Set())}
                            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            )}

            {/* Image Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={closeModal}
                >
                    {/* Selection Controls Header */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                        <div className="flex items-center gap-2">
                            {/* Selection Mode Toggle */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleModalSelectionMode();
                                }}
                                className={`px-3 py-1 rounded-full text-xs font-montserrat transition-all flex items-center gap-1 ${
                                    isModalSelectionMode
                                        ? 'bg-red-500 text-white hover:bg-red-600'
                                        : 'bg-white/20 text-white hover:bg-white/30'
                                }`}
                            >
                                {isModalSelectionMode ? 'Cancel' : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Select
                                    </>
                                )}
                            </button>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            {/* Selection Controls */}
                            {isModalSelectionMode && (
                                <>
                                    {/* Select All Checkbox */}
                                    <div className="flex items-center gap-2 px-3 py-1 bg-white/20 text-white rounded-full text-xs font-montserrat">
                                        <input
                                            type="checkbox"
                                            checked={modalSelectedImages.size === getAllArchivedImages().length && getAllArchivedImages().length > 0}
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                handleModalSelectAll();
                                            }}
                                            className="w-3 h-3 text-white rounded focus:ring-white bg-white/20 border-white"
                                        />
                                        <span className="text-white">
                                            {modalSelectedImages.size === getAllArchivedImages().length && getAllArchivedImages().length > 0 ? 'Deselect All' : 'Select All'}
                                        </span>
                                    </div>
                                    
                                    {modalSelectedImages.size > 0 && (
                                        <>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleModalRestore();
                                                }}
                                                className="px-3 py-1 bg-green-500 rounded-full text-xs font-montserrat text-white hover:bg-green-600 transition-all"
                                            >
                                                Restore ({modalSelectedImages.size})
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleModalPermanentDelete();
                                                }}
                                                className="px-3 py-1 bg-red-600 rounded-full text-xs font-montserrat text-white hover:bg-red-700 transition-all"
                                            >
                                                Delete ({modalSelectedImages.size})
                                            </button>
                                        </>
                                    )}
                                </>
                            )}
                            
                            {/* Image Counter */}
                            <div className="text-white text-sm font-montserrat bg-white/20 px-3 py-1 rounded-full">
                                {currentImageIndex + 1} / {getAllArchivedImages().length}
                            </div>
                        </div>
                    </div>

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

                    {/* Main Image Container */}
                    <div
                        className="relative max-w-4xl max-h-[90vh] flex items-center justify-center p-8 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Selection Checkbox Overlay */}
                        {isModalSelectionMode && (
                            <div
                                className="absolute top-4 left-4 z-20"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <input
                                    type="checkbox"
                                    checked={modalSelectedImages.has(currentImageIndex)}
                                    onChange={() => handleModalImageSelect(currentImageIndex)}
                                    className="w-5 h-5 text-white rounded focus:ring-white bg-white/20 border-white cursor-pointer"
                                />
                            </div>
                        )}
                        
                        <img
                            src={selectedImage.url}
                            alt={selectedImage.caption || 'Archived image'}
                            className="w-full h-full object-contain rounded-lg cursor-pointer"
                            onClick={() => isModalSelectionMode ? handleModalImageSelect(currentImageIndex) : null}
                        />
                    </div>
                </div>
            )}
        </PageLayout>
    );
}
