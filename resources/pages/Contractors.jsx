import PageLayout from '@/Layouts/PageLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { useState, useRef, useCallback, useEffect } from 'react';
import { router } from '@inertiajs/react';
import ContractorsTableSkeleton from '@/Components/ContractorsTableSkeleton';

export default function ContractorsIndex() {
    const { contractors, filters } = usePage().props;
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
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
            router.get(route('contractors.index'), {
                search: term || null,
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
    }, []);

    // Cleanup debounce timeout on unmount
    useEffect(() => {
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, []);


    return (
        <PageLayout>
            <Head title="Contractors" />

            <div className="space-y-12">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 font-montserrat leading-none" style={{ fontSize: '2rem', lineHeight: '0.8' }}>
                            Contractors Overview
                        </h2>
                    </div>
                </div>

                {/* Contractors Table */}
                <div className="pl-12 pr-16 py-10" style={{ marginTop: '1rem' }}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-bold text-slate-800 font-montserrat"> </h3>
                        <div className="flex items-center gap-3">
                            {/* Search Input */}
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search contractors..."
                                    value={searchTerm}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#Eb3505] focus:border-transparent font-montserrat text-sm w-64"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Show skeleton when loading, otherwise show actual table */}
                    {isLoading ? (
                        <ContractorsTableSkeleton rows={10} />
                    ) : (
                        <div className="border border-slate-200 rounded-xl shadow-sm overflow-hidden">
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

                                        </tr>
                                    </thead>

                                    {/* Body */}
                                    <tbody className="divide-y divide-slate-100">
                                        {contractors?.data?.map((contractor) => (
                                            <tr
                                                key={contractor.id}
                                                className="hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-100"
                                            >
                                                {/* Contractor Name */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="font-semibold text-slate-900">{contractor.name}</div>
                                                </td>

                                                {/* Project Count */}
                                                <td className="px-6 py-4 whitespace-nowrap text-slate-600 text-center">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium text-blue-800">
                                                        {contractor.projects_count} project/s
                                                    </span>
                                                </td>

                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    <>
                        {/* Pagination */}
                        {contractors?.data && contractors.data.length > 0 && (
                            <div className="mt-6 flex items-center justify-between">
                                <div className="text-sm text-slate-600">
                                    Showing {contractors.from || 1} to {contractors.to || (contractors?.data?.length || 0)} of {contractors.total || 0} contractors
                                </div>
                                <div className="flex items-center justify-center gap-2">
                                    {/* Previous Button */}
                                    <Link
                                        href={contractors.prev_page_url || '#'}
                                        className={`p-2 rounded-lg border transition font-montserrat text-sm font-medium ${contractors.prev_page_url
                                                ? "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                                                : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                                            }`}
                                        preserveScroll
                                        disabled={isLoading}
                                        onClick={(e) => {
                                            if (isLoading || !contractors.prev_page_url) {
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
                                        {contractors.links?.map((link, index) => {
                                            // Skip the first and last links (they are the arrow buttons)
                                            if (index === 0 || index === contractors.links.length - 1) {
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
                                                    className={`px-3 py-2 rounded-lg border transition font-montserrat text-sm font-medium ${link.active
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
                                        href={contractors.next_page_url || '#'}
                                        className={`p-2 rounded-lg border transition font-montserrat text-sm font-medium ${contractors.next_page_url
                                                ? "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                                                : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                                            }`}
                                        preserveScroll
                                        disabled={isLoading}
                                        onClick={(e) => {
                                            if (isLoading || !contractors.next_page_url) {
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

                        {/* Empty State */}
                        {(!contractors?.data || contractors.data.length === 0) && (
                            <div className="text-center py-12 mt-8 flex flex-col items-center justify-center" style={{ marginTop: '5rem' }}>
                                <svg className="w-16 h-16 text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <span className="text-slate-600 font-medium font-montserrat text-lg">
                                    No contractors found
                                </span>
                                <p className="text-slate-500 mt-2 font-montserrat">
                                    Contractors from project scopes will appear here once projects are assigned.
                                </p>
                            </div>
                        )}


                    </>

                </div>
            </div>
        </PageLayout>
    );
}
