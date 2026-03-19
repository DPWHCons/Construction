import PageLayout from '@/Layouts/PageLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { router } from '@inertiajs/react';
import { showArchiveConfirmation, showSuccessToast, showErrorToast } from '@/Utils/alerts';

export default function Categories() {
    const { categories, totalProjects, selectedYear: initialYear } = usePage().props;
    const urlParams = new URLSearchParams(window.location.search);
    const [searchTerm, setSearchTerm] = useState(urlParams.get('search') || '');
    const [selectedYear, setSelectedYear] = useState(initialYear || 'all');

    const handleArchive = async (category) => {
        try {
            const result = await showArchiveConfirmation(category.name, category.projects_count);
            
            if (result.isConfirmed) {
                router.post(route('categories.archive', category.id), {}, {
                    onSuccess: () => {
                        showSuccessToast(`Category "${category.name}" archived successfully!`);
                    },
                    onError: (errors) => {
                        showErrorToast('Failed to archive category. Please try again.');
                    }
                });
            }
        } catch (error) {
            showErrorToast('An unexpected error occurred. Please try again.');
        }
    };

    const handleSearch = (term) => {
        setSearchTerm(term);
        router.get(route('categories.index'), {
            search: term || null,
            year: selectedYear === 'all' ? null : selectedYear
        }, { preserveState: true, replace: true });
    };

    const handleYearChange = (year) => {
        setSelectedYear(year);
        router.get(route('categories.index'), {
            search: searchTerm || null,
            year: year === 'all' ? null : year
        }, { preserveState: true, replace: true });
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
        router.get(route('categories.index'), {}, { preserveState: true, replace: true });
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
                                className="px-4 py-2 bg-[#Eb3505] text-white rounded-lg hover:bg-[#c42a03] transition font-montserrat font-medium text-sm"
                            >
                                Clear
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
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-semibold text-slate-900">{category.name}</div>
                                            </td>

                                            {/* Project Count */}
                                            <td className="px-6 py-4 whitespace-nowrap text-slate-600 text-center">
                                                {category.projects_count}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="flex items-center justify-center gap-3">

                                                    <Link
                                                        href={route('categories.edit', category.id)}
                                                        className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium shadow-sm"
                                                    >
                                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                        Edit
                                                    </Link>

                                                    <form
                                                        onSubmit={(e) => {
                                                            e.preventDefault();
                                                            handleArchive(category);
                                                        }}
                                                        className="inline-block"
                                                    >
                                                        <button
                                                            type="submit"
                                                            className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium shadow-sm"
                                                        >
                                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                                            </svg>
                                                            Archive
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
            </div>
        </PageLayout>
    );
}
