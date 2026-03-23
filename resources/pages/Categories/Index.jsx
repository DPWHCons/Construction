import PageLayout from '@/Layouts/PageLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { router } from '@inertiajs/react';
import { showSuccessToast, showErrorToast } from '@/Utils/alerts';
import EditCategoryModal from '@/Components/EditCategoryModal';
import FeedbackAlert from '@/Components/FeedbackAlert';
import DPWHLoading from '@/Components/DPWHLoading';

export default function Categories() {
    const { categories, totalProjects, selectedYear: initialYear } = usePage().props;
    const urlParams = new URLSearchParams(window.location.search);
    const [searchTerm, setSearchTerm] = useState(urlParams.get('search') || '');
    const [selectedYear, setSelectedYear] = useState(initialYear || 'all');
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [archiveAlert, setArchiveAlert] = useState({
        show: false,
        category: null,
        hasProjects: false,
        projectCount: 0
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleArchive = (category) => {
        const hasProjects = category.projects_count > 0;
        setArchiveAlert({
            show: true,
            category: category,
            hasProjects: hasProjects,
            projectCount: category.projects_count
        });
    };

    const proceedWithArchive = () => {
        if (!archiveAlert.category) return;
        
        const category = archiveAlert.category;
        setIsLoading(true);
        
        router.post(route('categories.archive', category.id), {}, {
            onSuccess: () => {
                showSuccessToast(`Category "${category.name}" archived successfully!`);
                setArchiveAlert({ show: false, category: null, hasProjects: false, projectCount: 0 });
                setIsLoading(false);
            },
            onError: () => {
                showErrorToast('Failed to archive category. Please try again.');
                setArchiveAlert({ show: false, category: null, hasProjects: false, projectCount: 0 });
                setIsLoading(false);
            }
        });
    };

    const handleSearch = (term) => {
        setSearchTerm(term);
        setIsLoading(true);
        router.get(route('categories.index'), {
            search: term || null,
            year: selectedYear === 'all' ? null : selectedYear
        }, { 
            preserveState: true, 
            replace: true,
            onFinish: () => setIsLoading(false)
        });
    };

    const handleYearChange = (year) => {
        setSelectedYear(year);
        setIsLoading(true);
        router.get(route('categories.index'), {
            search: searchTerm || null,
            year: year === 'all' ? null : year
        }, { 
            preserveState: true, 
            replace: true,
            onFinish: () => setIsLoading(false)
        });
    };

    // Search Input Component
    const SearchInput = ({ placeholder, value, onChange, className = "" }) => (
        <div className="relative">
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className={`pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#Eb3505] focus:border-transparent font-montserrat text-sm w-64 ${className}`}
            />
        </div>
    );

    // Get available years for filter - extract from categories data
    const getAvailableYears = () => {
        const years = [];
        const categoryYears = new Set();
        
        // Extract years from categories that have projects
        if (categories?.data) {
            categories.data.forEach(category => {
                // You might need to adjust this based on your category data structure
                // If categories have project_year field or similar
                if (category.created_at) {
                    const year = new Date(category.created_at).getFullYear();
                    categoryYears.add(String(year));
                }
            });
        }
        
        // Sort years in descending order (most recent first)
        const sortedYears = Array.from(categoryYears).sort((a, b) => parseInt(b) - parseInt(a));
        years.push(...sortedYears);
        
        return years;
    };

    // Clear all filters
    const clearAllFilters = () => {
        setSearchTerm('');
        setSelectedYear('all');
        setIsLoading(true);
        router.get(route('categories.index'), {}, { 
            preserveState: true, 
            replace: true,
            onFinish: () => setIsLoading(false)
        });
    };

    return (
        <PageLayout>
            <Head title="Categories" />

            <div className="space-y-12">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 font-montserrat leading-none" style={{ fontSize: '2rem', lineHeight: '0.8' }}>
                            Categories Overview
                        </h2>
                    </div>
                    <div className="flex space-x-3">
                        <Link
                            href={route('categories.create')}
                            className="inline-flex items-center px-4 py-2 bg-[#Eb3505] text-white rounded-xl text-sm font-semibold shadow-md hover:bg-[#d12e04] transition-all font-montserrat"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Category
                        </Link>
                    </div>
                </div>

                {/* Categories Table */}
                <div className="pl-12 pr-16 py-10" style={{marginTop: '1rem'}}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-bold text-slate-800 font-montserrat"> </h3>
                        <div className="flex items-center gap-3">
                            {/* Search Input */}
                            <SearchInput 
                                placeholder="Search categories..."
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                            
                            {/* Year Filter */}
                            <select
                                value={selectedYear}
                                onChange={(e) => handleYearChange(e.target.value)}
                                className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#Eb3505] focus:border-transparent font-montserrat text-sm bg-white text-black"
                                style={{width: '120px'}}
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
                                disabled={isLoading}
                                className={`px-4 py-2 rounded-lg transition font-montserrat font-medium text-sm ${
                                    isLoading 
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                        : 'bg-[#Eb3505] text-white hover:bg-[#c42a03]'
                                }`}
                            >
                                {isLoading ? 'Clearing...' : 'Clear'}
                            </button>
                        </div>
                    </div>

                    <div className="border border-slate-200 rounded-xl shadow-sm overflow-hidden">
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

                                        <th className="px-6 py-4 text-center font-semibold text-slate-700 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                {/* Body */}
                                <tbody className="divide-y divide-slate-100">
                                    {categories?.data?.map((category) => (
                                        <tr
                                            key={category.id}
                                            className="hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-100"
                                        >
                                            {/* Category Name */}
                                            <td className="px-6 py-4 max-w-xs">
                                                <div className="font-semibold text-slate-900 break-words">{category.name}</div>
                                            </td>

                                            {/* Project Count */}
                                            <td className="px-6 py-4 whitespace-nowrap text-slate-600 text-center">
                                                {category.projects_count}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="flex items-center justify-center gap-3">

                                                    <form
                                                        onSubmit={(e) => {
                                                            e.preventDefault();
                                                            handleArchive(category);
                                                        }}
                                                        className="inline-block"
                                                    >
                                                        <button
                                                            type="submit"
                                                            disabled={isLoading}
                                                            className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors text-sm font-medium shadow-sm ${
                                                                isLoading
                                                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                                    : 'bg-orange-500 text-white hover:bg-orange-600'
                                                            }`}
                                                        >
                                                            {isLoading ? (
                                                                <>
                                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                    </svg>
                                                                    Archiving...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                                                    </svg>
                                                                    Archive
                                                                </>
                                                            )}
                                                        </button>
                                                    </form>

                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    {categories?.data && categories.data.length > 0 && (
                        <div className="mt-6 flex items-center justify-between">
                            <div className="text-sm text-slate-600">
                                Showing {categories.from || 1} to {categories.to || (categories?.data?.length || 0)} of {categories.total || 0} categories
                            </div>
                            <div className="flex items-center justify-center gap-2">
                                {/* Previous Button */}
                                <Link
                                    href={categories.prev_page_url || '#'}
                                    className={`p-2 rounded-lg border transition font-montserrat text-sm font-medium ${
                                        categories.prev_page_url
                                            ? "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                                            : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                                    }`}
                                    preserveScroll
                                    disabled={isLoading}
                                    onClick={(e) => {
                                        if (isLoading || !categories.prev_page_url) {
                                            e.preventDefault();
                                            return;
                                        }
                                        setIsLoading(true);
                                    }}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                    </svg>
                                </Link>

                                {/* Page Numbers */}
                                <div className="flex items-center gap-1">
                                    {categories.links?.map((link, index) => {
                                        // Skip the first and last links (they are the arrow buttons)
                                        if (index === 0 || index === categories.links.length - 1) {
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
                                                disabled={isLoading}
                                                onClick={(e) => {
                                                    if (isLoading || !link.url) {
                                                        e.preventDefault();
                                                        return;
                                                    }
                                                    setIsLoading(true);
                                                }}
                                            >
                                                {link.label}
                                            </Link>
                                        );
                                    })}
                                </div>

                                {/* Next Button */}
                                <Link
                                    href={categories.next_page_url || '#'}
                                    className={`p-2 rounded-lg border transition font-montserrat text-sm font-medium ${
                                        categories.next_page_url
                                            ? "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                                            : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                                    }`}
                                    preserveScroll
                                    disabled={isLoading}
                                    onClick={(e) => {
                                        if (isLoading || !categories.next_page_url) {
                                            e.preventDefault();
                                            return;
                                        }
                                        setIsLoading(true);
                                    }}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Empty State */}
                {(!categories?.data || categories.data.length === 0) && (
                    <div className="text-center py-12 mt-8 flex flex-col items-center justify-center" style={{marginTop: '5rem'}}>
                         <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                            <span className="text-slate-600 font-medium font-montserrat">
                                No categories found
                            </span>
                   </div>
                )}

                {/* Feedback Alert for Archive Confirmation */}
                <FeedbackAlert
                    show={archiveAlert.show}
                    type={archiveAlert.hasProjects ? 'warning' : 'info'}
                    title="Archive Category?"
                    isModal={true}
                    html={
                        archiveAlert.hasProjects
                            ? `<div class="space-y-4 text-left">
                                <p class="text-slate-700">
                                    Archive <span class="font-semibold text-slate-900">"${archiveAlert.category?.name}"</span>?
                                </p>
                                <div class="rounded-xl border border-amber-200 bg-amber-50 p-4">
                                    <div class="flex items-start gap-3">
                                        <div class="flex-shrink-0">
                                            <svg class="w-6 h-6 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                                            </svg>
                                        </div>
                                        <div class="flex-1">
                                            <h4 class="text-amber-900 font-semibold text-sm">Proceed with caution</h4>
                                            <p class="text-amber-800 text-sm mt-1">
                                                Category has currently <span class="font-bold">${archiveAlert.projectCount}</span> active/recorded project${archiveAlert.projectCount > 1 ? 's' : ''}.
                                            </p>
                                            <p class="text-amber-700 text-xs mt-2">
                                                Projects won't be deleted, but they'll become uncategorized.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>`
                            : `<p class="text-slate-700">Are you sure you want to archive <span class="font-semibold text-slate-900">"${archiveAlert.category?.name}"</span>?</p>`
                    }
                    confirmButtonText="Archive"
                    cancelButtonText="Cancel"
                    onConfirm={proceedWithArchive}
                    onCancel={() => setArchiveAlert({ show: false, category: null, hasProjects: false, projectCount: 0 })}
                    onClose={() => setArchiveAlert({ show: false, category: null, hasProjects: false, projectCount: 0 })}
                    customClass={{
                        confirmButton: 'bg-orange-500 text-white hover:bg-orange-600 shadow-md',
                        cancelButton: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
                    }}
                />

                {/* Edit Category Modal */}
                <EditCategoryModal
                    show={showEditModal}
                    category={editingCategory}
                    onClose={() => {
                        setShowEditModal(false);
                        setEditingCategory(null);
                    }}
                    onUpdate={() => {
                        // Refresh the categories list
                        setIsLoading(true);
                        router.reload({ only: ['categories'], onFinish: () => setIsLoading(false) });
                    }}
                />

                {/* Global Loading Indicator */}
                {isLoading && (
                    <DPWHLoading
                        message="Processing..."
                        subMessage="Please wait while we process your request"
                    />
                )}
            </div>
        </PageLayout>
    );
}
