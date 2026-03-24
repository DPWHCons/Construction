import React from 'react';

export default function ProjectDetailsModal({ show, project, onClose, onShowImages }) {
    if (!show || !project) return null;

    // ✅ Normalize nested data (no more [0] everywhere)
    const scope = project.scope?.[0] || {};
    const progress = project.progress?.[0] || {};
    const remarks = project.remarks?.[0] || {};

    // ✅ Status functions
    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'ongoing': return 'bg-green-100 text-green-800 border-green-200';
            case 'pending': return 'bg-red-100 text-red-800 border-red-200';
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

    // ✅ Formatters
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
        return date.toLocaleDateString('en-GB'); // cleaner
    };

    return (
        <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* 🔥 Header */}
                <div className="flex items-center justify-between 
                    bg-white/80 backdrop-blur border-b border-gray-200 
                    text-gray-900 px-6 py-4 sticky top-0 z-20 border-b-2 border-gray-200 shadow-lg">
                    
                    <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-gray-900">
                            Project Details — {project.project_year || '-'}
                        </h3>
                        {project.status && (
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                                {getStatusDisplay(project.status)}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {project.images?.length > 0 && (
                            <button
                                onClick={onShowImages}
                                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm hover:shadow-md"
                            >
                                📸 Gallery
                            </button>
                        )}

                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm hover:shadow-md"
                        >
                            Close
                        </button>
                    </div>
                </div>

                {/* 📦 Content */}
                <div className="p-6 space-y-6">

                    {/* Title */}
                    <div>
                        <h4 className="text-2xl font-semibold text-gray-900">
                            {project.title}
                        </h4>
                    </div>
                    
                    {/* Grid Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Contract */}
                        <Section title="Contract Information">
                            <InfoRow label="Contract ID" value={project.contract_id} />
                            <InfoRow label="Project ID" value={project.project_id} />
                        </Section>

                        {/* Financial */}
                        <Section title="Financial Information">
                            <InfoRow label="Program Amount" value={project.formatted_program_amount || formatPeso(project.program_amount)} />
                            <InfoRow label="Project Cost" value={project.formatted_project_cost || formatPeso(project.project_cost)} />
                            <InfoRow label="Revised Cost" value={project.formatted_revised_project_cost || formatPeso(project.revised_project_cost)} />
                        </Section>

                        {/* Scope */}
                        <Section title="Scope of Work" className="md:col-span-2">
                            <div className="grid md:grid-cols-2 gap-6">

                                <div className="space-y-3">
                                    <InfoBlock label="Duration, CD" value={scope.duration_cd} />
                                    <InfoBlock label="Project Engineer" value={scope.project_engineer} />
                                    <InfoBlock label="Contractor" value={scope.contractor_name} />
                                </div>

                                <div className="space-y-3">
                                    <InfoBlock label="Scope of Work - Unit of Measure" value={`${scope.scope_of_work_main} - ${scope.unit_of_measure}`} />

                                    <div>
                                        <span className="text-sm text-gray-500">Assigned Engineers</span>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {project.assignedEngineers?.length ? (
                                                project.assignedEngineers.map((eng, i) => (
                                                    <span
                                                        key={i}
                                                        className="inline-flex items-center bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-medium"
                                                    >
                                                        {eng.engineer_title && eng.engineer_name
                                                            ? `${eng.engineer_title} – ${eng.engineer_name}`
                                                            : 'Invalid data'}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-sm italic text-gray-400">
                                                    No assigned engineers
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Section>

                        {/* Progress */}
                        <Section title="Progress & Timeline" className="md:col-span-2">
                            <div className="grid md:grid-cols-3 gap-6">

                                <StatBlock
                                    label={`Physical Length Measures (${scope.unit_of_measure || 'units'})`}
                                    value={progress.target_actual}
                                />

                                <StatBlock
                                    label="Start Date"
                                    value={formatDate(progress.target_start_actual)}
                                />

                                <StatBlock
                                    label="Completion Date"
                                    value={formatDate(progress.target_completion_actual)}
                                />

                            </div>
                        </Section>

                        {/* Remarks */}
                        <Section title="Remarks" className="md:col-span-2">
                            <p className="text-sm text-gray-700 leading-relaxed">
                                {remarks.remarks || '-'}
                            </p>
                        </Section>

                    </div>
                </div>
            </div>
        </div>
    );
}

/* 🧩 Reusable Components */

function Section({ title, children, className = '' }) {
    return (
        <div className={`bg-white p-5 rounded-2xl border border-gray-100 shadow-sm ${className}`}>
            <h5 className="text-sm font-semibold text-gray-800 mb-4">
                {title}
            </h5>
            <div className="space-y-2">
                {children}
            </div>
        </div>
    );
}

function InfoRow({ label, value }) {
    return (
        <div className="flex justify-between text-sm">
            <span className="text-gray-500">{label}</span>
            <span className="font-medium text-gray-800">{value || '-'}</span>
        </div>
    );
}

function InfoBlock({ label, value }) {
    return (
        <div>
            <span className="text-sm text-gray-500">{label}</span>
            <p className="text-sm font-medium text-gray-800">
                {value || '-'}
            </p>
        </div>
    );
}

function StatBlock({ label, value }) {
    return (
        <div className="space-y-2">
            <h6 className="text-sm font-medium text-gray-500">
                {label}
            </h6>
            <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-emerald-500 rounded-full"></div>
                <span className="text-base font-semibold text-gray-900">
                    {value || '-'}
                </span>
            </div>
        </div>
    );
}