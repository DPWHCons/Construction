import PageLayout from '@/Layouts/PageLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { router } from '@inertiajs/react';
import FeedbackAlert from '@/Components/FeedbackAlert';
import { showSuccessToast, showErrorToast } from '@/Utils/alerts';

export default function Contractors() {
    const { contractors, filters } = usePage().props;
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [archiveAlert, setArchiveAlert] = useState({
        show: false,
        contractor: null
    });

    const handleSearch = (term) => {
        setSearchTerm(term);
        router.get(route('contractors.index'), {
            search: term || null,
        }, { preserveState: true, replace: true });
    };

    const handleArchive = (contractor) => {
        setArchiveAlert({
            show: true,
            contractor: contractor
        });
    };

    const proceedWithArchive = () => {
        if (!archiveAlert.contractor) return;
        
        const contractor = archiveAlert.contractor;
        
        router.post(route('contractors.archive', contractor.id), {}, {
            onSuccess: () => {
                showSuccessToast(`Contractor "${contractor.name}" archived successfully!`);
                setArchiveAlert({ show: false, contractor: null });
            },
            onError: () => {
                showErrorToast('Failed to archive contractor. Please try again.');
                setArchiveAlert({ show: false, contractor: null });
            }
        });
    };

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
                    <div className="flex space-x-3">
                        <Link
                            href={route('contractors.create')}
                            className="inline-flex items-center px-4 py-2 bg-[#Eb3505] text-white rounded-xl text-sm font-semibold shadow-md hover:bg-[#d12e04] transition-all font-montserrat"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Contractor
                        </Link>
                    </div>
                </div>

                {/* Contractors Table */}
                <div className="pl-12 pr-16 py-10" style={{marginTop: '1rem'}}>
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
                                    className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#Eb3505] focus:border-transparent font-montserrat text-sm w-64"
                                />
                            </div>
                        </div>
                    </div>

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
                                            Contact Number
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
                                    {contractors?.data?.map((contractor) => (
                                        <tr
                                            key={contractor.id}
                                            className="hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-100"
                                        >
                                            {/* Contractor Name */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-semibold text-slate-900">{contractor.name}</div>
                                            </td>

                                            {/* Contact Number */}
                                            <td className="px-6 py-4 whitespace-nowrap text-slate-600 text-center">
                                                {contractor.contact_number || '-'}
                                            </td>

                                            {/* Project Count */}
                                            <td className="px-6 py-4 whitespace-nowrap text-slate-600 text-center">
                                                {contractor.projects_count}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="flex items-center justify-center gap-3">
                                                    <Link
                                                        href={route('contractors.show', contractor.id)}
                                                        className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium shadow-sm"
                                                    >
                                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                        View
                                                    </Link>

                                                    <Link
                                                        href={route('contractors.edit', contractor.id)}
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
                                                            handleArchive(contractor);
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
                    {contractors?.data && contractors.data.length > 0 && (
                        <div className="mt-6 flex items-center justify-between">
                            <div className="text-sm text-slate-600">
                                Showing {contractors.from || 1} to {contractors.to || (contractors?.data?.length || 0)} of {contractors.total || 0} contractors
                            </div>
                            <div className="flex items-center justify-center gap-2">
                                {/* Previous Button */}
                                <Link
                                    href={contractors.prev_page_url || '#'}
                                    className={`p-2 rounded-lg border transition font-montserrat text-sm font-medium ${
                                        contractors.prev_page_url
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
                                    href={contractors.next_page_url || '#'}
                                    className={`p-2 rounded-lg border transition font-montserrat text-sm font-medium ${
                                        contractors.next_page_url
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

                    {/* Empty State */}
                    {(!contractors?.data || contractors.data.length === 0) && (
                        <div className="text-center py-12 mt-8 flex flex-col items-center justify-center" style={{marginTop: '5rem'}}>
                             <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                                <span className="text-slate-600 font-medium font-montserrat">
                                    No contractors found
                                </span>
                       </div>
                    )}

                    {/* Archive Confirmation Alert */}
                    <FeedbackAlert
                        show={archiveAlert.show}
                        type="info"
                        title="Archive Contractor?"
                        isModal={true}
                        html={`<p class="text-slate-700">Are you sure you want to archive <span class="font-semibold text-slate-900">"${archiveAlert.contractor?.name}"</span>?</p>`}
                        confirmButtonText="Archive"
                        cancelButtonText="Cancel"
                        onConfirm={proceedWithArchive}
                        onCancel={() => setArchiveAlert({ show: false, contractor: null })}
                        onClose={() => setArchiveAlert({ show: false, contractor: null })}
                        customClass={{
                            confirmButton: 'bg-orange-500 text-white hover:bg-orange-600 shadow-md',
                            cancelButton: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
                        }}
                    />
                </div>
            </div>
        </PageLayout>
    );
}
