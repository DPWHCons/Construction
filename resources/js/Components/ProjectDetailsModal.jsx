import React from 'react';

export default function ProjectDetailsModal({ show, project, onClose, onShowImages }) {
    if (!show || !project) return null;

    // Normalize nested data
    const scope = project.scope?.[0] || {};
    const progress = project.progress?.[0] || {};
    const remarks = project.remarks?.[0] || {};

    // Status functions
    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-blue-100 text-blue-800';
            case 'ongoing': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
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
        return date.toLocaleDateString('en-GB');
    };

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 flex items-center justify-between bg-gray-50 px-5 py-4 z-10 border-b border-gray-200">
                    <div className="flex items-center gap-3 flex-1 min-w-0 mr-4">
                        <h3 className="text-lg font-semibold text-gray-900 break-words leading-tight">
                            {project.title}
                        </h3>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                        {project.images?.length > 0 && (
                            <button
                                onClick={onShowImages}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                                Gallery
                            </button>
                        )}

                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-800 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-5">

                    {/* Basic Info Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                            <span className="text-sm text-gray-500">Contract ID</span>
                            <p className="text-sm font-medium text-gray-900">{project.contract_id || '-'}</p>
                        </div>
                        <div>
                            <span className="text-sm text-gray-500">Project ID</span>
                            <p className="text-sm font-medium text-gray-900">{project.project_id || '-'}</p>
                        </div>
                        <div className="flex items-start justify-between">
                            <div>
                                <span className="text-sm text-gray-500">Year</span>
                                <p className="text-sm font-medium text-gray-900">{project.project_year || '-'}</p>
                            </div>
                            {project.status && (
                                <span className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                                    {getStatusDisplay(project.status)}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Category */}
                    <div>
                        <span className="text-sm text-gray-500">Category</span>
                        <p className="text-sm font-medium text-gray-900">{project.category?.name || '-'}</p>
                    </div>

                    {/* Financial Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <span className="text-sm text-gray-500">Program Amount</span>
                            <p className="text-sm font-medium text-gray-900">{project.formatted_program_amount || formatPeso(project.program_amount)}</p>
                        </div>
                        <div>
                            <span className="text-sm text-gray-500">Project Cost</span>
                            <p className="text-sm font-medium text-gray-900">{project.formatted_project_cost || formatPeso(project.project_cost)}</p>
                        </div>
                        <div>
                            <span className="text-sm text-gray-500">Revised Cost</span>
                            <p className="text-sm font-medium text-gray-900">{project.formatted_revised_project_cost || formatPeso(project.revised_project_cost)}</p>
                        </div>
                    </div>

                    {/* Scope & Progress */}
                    <div className="space-y-5">
                        {/* Scope of Work - Full Width */}
                        <div className="bg-gray-50 p-5 rounded-lg">
                            <h4 className="text-sm font-semibold text-gray-700 mb-4">Scope of Work</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <span className="text-sm text-gray-500">Scope of Work</span>
                                    <p className="text-sm font-medium text-gray-900">{scope.scope_of_work_main || '-'}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500">Contractor</span>
                                    <p className="text-sm font-medium text-gray-900">{scope.contractor_name || '-'}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500">Project Engineer</span>
                                    <p className="text-sm font-medium text-gray-900">{scope.project_engineer || '-'}</p>
                                </div>
                                {/* <div>
                                    <span className="text-sm text-gray-500">Unit of Measure</span>
                                    <p className="text-sm font-medium text-gray-900">{scope.unit_of_measure || '-'}</p>
                                </div> */}
                            </div>
                        </div>

                        {/* Progress & Timeline - Full Width */}
                        <div className="bg-gray-50 p-5 rounded-lg">
                            <h4 className="text-sm font-semibold text-gray-700 mb-4">Progress & Timeline</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500">Duration, CD</span>
                                        <span className="text-sm font-medium text-right">{scope.duration_cd || '-'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500">Physical Measures - ({scope.unit_of_measure || '-'})</span>
                                        <span className="text-sm font-medium text-right">{progress.target_actual || '-'}</span>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500">Start Date</span>
                                        <span className="text-sm font-medium text-right">{formatDate(progress.target_start_actual)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500">Completion Date</span>
                                        <span className="text-sm font-medium text-right">{formatDate(progress.target_completion_actual)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Assigned Engineers */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Assigned Engineers</h4>
                        <div className="flex flex-wrap gap-2">
                            {project.assignedEngineers?.length ? (
                                project.assignedEngineers.map((eng, i) => (
                                    <span
                                        key={i}
                                        className="inline-flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded text-sm font-medium"
                                    >
                                        {eng.engineer_title && eng.engineer_name
                                            ? `${eng.engineer_title} – ${eng.engineer_name}`
                                            : 'Invalid data'}
                                    </span>
                                ))
                            ) : (
                                <span className="text-sm italic text-gray-400">No assigned engineers</span>
                            )}
                        </div>
                    </div>

                    {/* Remarks */}
                    {remarks.remarks && (
                        <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">Remarks</h4>
                            <p className="text-sm text-gray-600 leading-relaxed">{remarks.remarks}</p>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}