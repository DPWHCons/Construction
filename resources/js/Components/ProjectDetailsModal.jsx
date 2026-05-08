import React, { useMemo, useState } from 'react';

// Icons
const IconX = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const IconImages = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const IconCalendar = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const IconUser = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const IconBriefcase = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0124 12c0-3.259-4.003-4.646-8.021-6.091C14.988 4.912 12.771 4 12 4c-.771 0-2.988.912-3.979 2.909C4.003 7.354 0 8.741 0 12c0 3.259 4.003 4.646 8.021 6.091C9.012 20.088 11.229 21 12 21c.771 0 2.988-.912 3.979-2.909C19.997 16.646 24 15.259 24 12c0-1.637-1.25-2.945-3.14-4.255M12 4v8m0 0l3-3m-3 3l-3-3" />
    </svg>
);

const IconMoney = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const IconClipboard = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
);

const IconClock = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const IconTag = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
);

const IconHash = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
    </svg>
);

const IconFileText = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const IconHardHat = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
);

// Format document size
const formatDocumentSize = (document) => {
    if (!document?.document) return 'Unknown size';
    const sizeInBytes = document.document.length || 0;
    if (sizeInBytes === 0) return '0 B';
    if (sizeInBytes < 1024) return `${sizeInBytes} B`;
    if (sizeInBytes < 1024 * 1024) return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
};

export default function ProjectDetailsModal({ show, project, onClose, onShowImages, showImages, onBackToDetails }) {
    if (!show || !project) return null;

    // Group documents by month for easy understanding
    const groupedDocuments = useMemo(() => {
        if (!project?.images || project.images.length === 0) return {};

        return project.images.reduce((groups, doc) => {
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
        if (!project?.images) return [];
        const years = new Set();
        project.images.forEach(doc => {
            const dateSource = doc.document_date || doc.created_at || new Date().toISOString();
            const date = new Date(dateSource);
            years.add(date.getFullYear());
        });
        return Array.from(years).sort((a, b) => b - a); // Latest first
    }, [project?.images]);

    // State for year filter
    const [selectedYear, setSelectedYear] = useState(null);

    // Filter months by selected year
    const filteredMonths = useMemo(() => {
        if (!selectedYear) return Object.entries(sortedGroupedDocuments).sort((a, b) => {
            const dateA = new Date(a[1][0]?.document_date || a[1][0]?.created_at);
            const dateB = new Date(b[1][0]?.document_date || b[1][0]?.created_at);
            return dateB - dateA;
        });
        return Object.entries(sortedGroupedDocuments).filter(([monthKey]) => monthKey.includes(selectedYear.toString())).sort((a, b) => {
            const dateA = new Date(a[1][0]?.document_date || a[1][0]?.created_at);
            const dateB = new Date(b[1][0]?.document_date || b[1][0]?.created_at);
            return dateB - dateA;
        });
    }, [sortedGroupedDocuments, selectedYear]);

    // Normalize nested data
    const scope = project.scope?.[0] || {};
    const progress = project.progress?.[0] || {};
    const remarks = project.remarks?.[0] || {};

    // Status functions
    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-blue-500';
            case 'ongoing': return 'bg-green-500';
            case 'pending': return 'bg-amber-500';
            default: return 'bg-gray-400';
        }
    };

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'ongoing': return 'bg-green-100 text-green-800 border-green-200';
            case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusDisplay = (status) => {
        switch (status) {
            case 'completed': return 'Completed';
            case 'ongoing': return 'Ongoing';
            case 'pending': return 'Pending';
            default: return status || 'Unknown';
        }
    };

    // Formatters
    const formatPeso = (amount) => {
        if (!amount || amount === 0) return '₱0.00';
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '-';
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    // Calculate progress percentage (mock logic - adjust based on actual data)
    const progressPercentage = progress?.percentage || 0;

    return (
        <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-lg shadow-2xl w-full max-w-6xl h-[85vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200"
                onClick={(e) => e.stopPropagation()}
                style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#cbd5e1 transparent'
                }}
            >
                {/* Header with Status Badge */}
                <div className="sticky top-0 z-10 bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
                    <div className="flex items-start justify-between gap-4">
                        {/* Left - Project Title */}
                        <div className="flex-1 min-w-0">
                            <h2 className="text-xl font-bold text-slate-900 leading-tight">
                                {project.title}
                            </h2>
                        </div>

                        {/* Right - Gallery, X, Status, Year */}
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                            {/* Top - Pill Toggle and X */}
                            <div className="flex items-center gap-2">
                                {project.images?.length > 0 && (
                                    <div className="inline-flex items-center bg-slate-200 rounded-full p-1">
                                        <button
                                            onClick={onBackToDetails}
                                            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${
                                                !showImages
                                                    ? 'bg-[#010066] text-white shadow-sm'
                                                    : 'text-slate-600 hover:text-slate-900'
                                            }`}
                                        >
                                            Details
                                        </button>
                                        <button
                                            onClick={onShowImages}
                                            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 flex items-center gap-1.5 ${
                                                showImages
                                                    ? 'bg-[#010066] text-white shadow-sm'
                                                    : 'text-slate-600 hover:text-slate-900'
                                            }`}
                                        >
                                            <IconImages />
                                            Gallery
                                        </button>
                                    </div>
                                )}

                                <button
                                    onClick={onClose}
                                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-600 hover:text-slate-800 transition-colors"
                                >
                                    <IconX />
                                </button>
                            </div>

                            {/* Bottom - Status and Year */}
                            <div className="flex items-center gap-2">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadgeColor(project.status)}`}>
                                    {getStatusDisplay(project.status)}
                                </span>
                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                    <IconCalendar />
                                    {project.project_year || '-'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content - only show when not viewing gallery */}
                {!showImages && (
                <div className="p-6 space-y-6">

                    {/* Project Overview Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                            <div className="flex items-center gap-2 text-slate-500 mb-1">
                                <IconHash />
                                <span className="text-xs font-medium uppercase tracking-wide">Contract ID</span>
                            </div>
                            <p className="text-sm font-semibold text-slate-900">{project.contract_id || '-'}</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                            <div className="flex items-center gap-2 text-slate-500 mb-1">
                                <IconFileText />
                                <span className="text-xs font-medium uppercase tracking-wide">Project ID</span>
                            </div>
                            <p className="text-sm font-semibold text-slate-900">{project.project_id || '-'}</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                            <div className="flex items-center gap-2 text-slate-500 mb-1">
                                <IconTag />
                                <span className="text-xs font-medium uppercase tracking-wide">Category</span>
                            </div>
                            <p className="text-sm font-semibold text-slate-900">{project.category?.name || '-'}</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                            <div className="flex items-center gap-2 text-slate-500 mb-1">
                                <IconClock />
                                <span className="text-xs font-medium uppercase tracking-wide">Duration</span>
                            </div>
                            <p className="text-sm font-semibold text-slate-900">{scope.duration_cd ? `${scope.duration_cd} days` : '-'}</p>
                        </div>
                    </div>

                    {/* Financial Overview */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-4">
                            <IconMoney />
                            Financial Overview
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white/70 backdrop-blur rounded-lg p-4">
                                <span className="text-xs text-slate-500 block mb-1">Program Amount</span>
                                <p className="text-lg font-bold text-slate-900">{project.formatted_program_amount || formatPeso(project.program_amount)}</p>
                            </div>
                            <div className="bg-white/70 backdrop-blur rounded-lg p-4">
                                <span className="text-xs text-slate-500 block mb-1">Project Cost</span>
                                <p className="text-lg font-bold text-slate-900">{project.formatted_project_cost || formatPeso(project.project_cost)}</p>
                            </div>
                            <div className="bg-white/70 backdrop-blur rounded-lg p-4">
                                <span className="text-xs text-slate-500 block mb-1">Revised Cost</span>
                                <p className="text-lg font-bold text-slate-900">{project.formatted_revised_project_cost || formatPeso(project.revised_project_cost)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Scope & Team */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-4">
                                <IconBriefcase />
                                Scope of Work
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <span className="text-xs text-slate-500 block mb-1">Work Description</span>
                                    <p className="text-sm font-medium text-slate-900">{scope.scope_of_work_main || '-'}</p>
                                </div>
                                <div className="pt-3 border-t border-slate-200">
                                    <span className="text-xs text-slate-500 block mb-1">Unit of Measure</span>
                                    <p className="text-sm font-medium text-slate-900">{scope.unit_of_measure || '-'}</p>
                                </div>
                                <div className="pt-3 border-t border-slate-200">
                                    <span className="text-xs text-slate-500 block mb-1">Target/Actual</span>
                                    <p className="text-sm font-medium text-slate-900">{progress.target_actual || '-'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-4">
                                <IconUser />
                                Project Team
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <span className="text-xs text-slate-500 block mb-1">Contractor</span>
                                    <p className="text-sm font-medium text-slate-900">{scope.contractor_name || '-'}</p>
                                </div>
                                <div className="pt-3 border-t border-slate-200">
                                    <span className="text-xs text-slate-500 block mb-1">Project Engineer</span>
                                    <p className="text-sm font-medium text-slate-900">{scope.project_engineer || '-'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-4">
                            <IconCalendar />
                            Project Timeline
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                    <IconCalendar />
                                </div>
                                <div>
                                    <span className="text-xs text-slate-500 block">Start Date</span>
                                    <p className="text-base font-semibold text-slate-900">{formatDate(progress.target_start_actual)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                    <IconClipboard />
                                </div>
                                <div>
                                    <span className="text-xs text-slate-500 block">Target Completion</span>
                                    <p className="text-base font-semibold text-slate-900">{formatDate(progress.target_completion_actual)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                                <IconHardHat />
                                Progress Status
                            </h3>
                            <span className="text-sm font-bold text-slate-900">{progressPercentage}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-3">
                            <div 
                                className={`h-3 rounded-full transition-all duration-500 ${getStatusColor(project.status)}`}
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                    </div>

                    {/* Assigned Engineers */}
                    {project.assignedEngineers?.length > 0 && (
                        <div>
                            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-3">
                                <IconHardHat />
                                Assigned Engineers
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {project.assignedEngineers.map((eng, i) => (
                                    <span
                                        key={i}
                                        className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-sm font-medium border border-indigo-100"
                                    >
                                        <IconUser />
                                        {eng.engineer_title && eng.engineer_name
                                            ? `${eng.engineer_title} ${eng.engineer_name}`
                                            : 'Unknown'}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Remarks */}
                    {remarks.remarks && (
                        <div className="bg-amber-50 rounded-xl p-5 border border-amber-100">
                            <h3 className="flex items-center gap-2 text-sm font-semibold text-amber-800 mb-2">
                                <IconClipboard />
                                Remarks
                            </h3>
                            <p className="text-sm text-amber-700 leading-relaxed">{remarks.remarks}</p>
                        </div>
                    )}

                </div>
                )}

                {/* Gallery View - only show when viewing gallery */}
                {showImages && (
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-xs text-slate-500 flex items-center gap-1.5">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                                </svg>
                                {selectedYear ? `Showing ${selectedYear}` : 'Showing all years'}
                            </p>
                            {/* Year Filter + Clear Button */}
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
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={() => setSelectedYear(null)}
                                        className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#010066] focus:border-[#010066] transition-all"
                                    >
                                        Clear
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="space-y-8 overflow-y-auto pr-2" style={{ maxHeight: 'calc(100vh - 300px)' }}>
                            {filteredMonths.map(([monthKey, docs]) => (
                                <React.Fragment key={monthKey}>
                                    <div>
                                        {/* Simple Month Separator */}
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="h-px bg-gray-300 flex-1"></div>
                                            <div className="px-4 py-2 bg-gray-100 rounded-full">
                                                <h4 className="text-sm font-semibold text-gray-700">{monthKey}</h4>
                                            </div>
                                            <div className="h-px bg-gray-300 flex-1"></div>
                                        </div>
                                    {/* Documents Grid for this Month */}
                                    <div className="grid gap-4 ml-4 grid-cols-[repeat(auto-fill,_minmax(120px,_1fr))]">
                                        {docs.map((image, index) => (
                                            <div
                                                key={index}
                                                className="relative group cursor-pointer w-full aspect-[4/3] hover:border-blue-400 hover:shadow-lg hover:scale-[1.05] transition-all duration-300 rounded-lg border-2 border-slate-200 overflow-hidden flex-shrink-0 text-left"
                                                onClick={() => {
                                                    if (image?.url) {
                                                        window.open(`/document-preview?url=${encodeURIComponent(image.url)}&filename=${encodeURIComponent(image.filename || 'Document')}`, '_blank');
                                                    }
                                                }}
                                            >
                                                {/* Document Content */}
                                                <div className="p-2 h-full flex flex-col justify-between overflow-hidden">
                                                    <div className="flex justify-center mb-2">
                                                        <a
                                                            href={image.url || '#'}
                                                            download={image.filename || `document_${image.id}.docx`}
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
                                                        <p className="text-xs font-semibold text-black truncate leading-tight mb-1" title={image.filename || `Document ID: ${image.id}`}>
                                                            {image.filename || `Document_${image.id}`}
                                                        </p>
                                                        <p className="text-[8px] text-slate-500 font-medium">
                                                            {formatDocumentSize(image)}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Hover Overlay */}
                                                <div className="absolute inset-0 bg-gray-200/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center rounded-lg">
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}