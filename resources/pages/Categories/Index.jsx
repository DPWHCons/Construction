import PageLayout from '@/Layouts/PageLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { useState, useRef, useCallback, useEffect } from 'react';
import { router } from '@inertiajs/react';
import CategoriesTableSkeleton from '@/Components/CategoriesTableSkeleton';

export default function Categories() {
    const { categories, totalProjects, selectedYear: initialYear } = usePage().props;
    const urlParams = new URLSearchParams(window.location.search);
    const [searchTerm, setSearchTerm] = useState(urlParams.get('search') || '');
    const [selectedYear, setSelectedYear] = useState(initialYear || 'all');
    const [isLoading, setIsLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const debounceRef = useRef(null);


    const handleSearch = useCallback((term) => {
        setSearchTerm(term);

        // Clear existing timeout
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        // Set searching state immediately for visual feedback
        setIsSearching(true);

        // Don't set loading immediately - wait for debounce
        debounceRef.current = setTimeout(() => {
            setIsLoading(true);
            router.get(route('categories.index'), {
                search: term || null,
                year: selectedYear === 'all' ? null : selectedYear
            }, { 
                preserveState: true, 
                preserveScroll: true,
                replace: true,
                onFinish: () => {
                    setIsLoading(false);
                    setIsSearching(false);
                }
            });
        }, 400); // Wait 400ms after typing stops
    }, [selectedYear]);

    // Cleanup debounce timeout on unmount
    useEffect(() => {
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, []);

    const handleYearChange = (year) => {
        setSelectedYear(year);
        setIsLoading(true);
        router.get(route('categories.index'), {
            search: searchTerm || null,
            year: year === 'all' ? null : year
        }, { 
            preserveState: true, 
            preserveScroll: true,
            replace: true,
            onFinish: () => setIsLoading(false)
        });
    };

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
            preserveScroll: true,
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
                </div>

                {/* Categories Table */}
                <div className="pl-12 pr-16 py-10" style={{marginTop: '1rem'}}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-bold text-slate-800 font-montserrat"> </h3>
                        <div className="flex items-center gap-3">
                            {/* Search Input */}
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                </div>
                                <input
                                    key="search-input"
                                    type="text"
                                    placeholder="Search categories..."
                                    value={searchTerm}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#Eb3505] focus:border-transparent font-montserrat text-sm w-64"
                                />
                            </div>
                            {/* Year Filter */}
                            <select
                                value={selectedYear}
                                onChange={(e) => handleYearChange(e.target.value)}
                                className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#Eb3505] focus:border-transparent font-montserrat text-sm bg-white text-black"
                                style={{width: '120px'}}
                            >
                                <option value="all">All Years</option>
                                {getAvailableYears().map((year) => (
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

                    {/* Show skeleton when loading, otherwise show actual table */}
                    {isLoading ? (
                        <CategoriesTableSkeleton rows={10} />
                    ) : (
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

                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    )}

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
            </div>
        </PageLayout>
    );
}
