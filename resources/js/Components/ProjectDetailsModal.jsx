import React from 'react';
import { router } from '@inertiajs/react';

export default function ProjectDetailsModal({ show, project, onClose, onShowImages }) {
    if (!show || !project) return null;

    const formatPeso = (amount) => {
        if (!amount || amount === 0) return '₱0.00';
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '-';
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    return (
        <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto border border-gray-200 flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between bg-[#Eb3505] text-white rounded-t-2xl px-6 py-4 sticky top-0 z-20">
                    <h3 className="text-xl font-bold font-montserrat">Project Details - {project.project_year || '-'}</h3>
                    <div className="flex items-center gap-3">
                        {project.images?.length > 0 && (
                            <button
                                onClick={onShowImages}
                                className="px-4 py-2 bg-white/20 rounded-full text-sm font-montserrat hover:bg-white/30 transition"
                            >
                                Project Gallery
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-white/20 rounded-full text-sm font-montserrat hover:bg-white/30 transition"
                        >
                            Close
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col gap-6">
                    {/* Project Title & Contract */}
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                        <h4 className="text-2xl font-semibold font-montserrat text-gray-800">{project.title}</h4>   
                    </div>

                    {/* Information Sections */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       

                        {/* Contract Information */}
                        <div className="bg-gray-50 p-4 rounded-xl shadow-sm border border-gray-200">
                            <h5 className="text-lg font-semibold mb-2">Contract Information</h5>
                            <div className="flex flex-col gap-2 text-sm text-gray-700">
                                <p><span className="font-semibold">Contract ID:</span> {project.contract_id || '-'}</p>
                                <p><span className="font-semibold">Project Name:</span> {project.title}</p>
                                <p><span className="font-semibold">Project ID:</span> {project.project_id || '-'}</p>
                            </div>
                        </div>

                        {/* Financial Info */}
                        <div className="bg-gray-50 p-4 rounded-xl shadow-sm border border-gray-200">
                            <h5 className="text-lg font-semibold mb-2">Financial Information</h5>
                            <div className="flex flex-col gap-2 text-sm text-gray-700">
                                <p><span className="font-semibold">Program Amount ('000):</span> {project.formatted_program_amount || formatPeso(project.program_amount || 0)}</p>
                                <p><span className="font-semibold">Project Cost ('000):</span> {project.formatted_project_cost || formatPeso(project.project_cost || 0)}</p>
                                <p><span className="font-semibold">Revised Project Cost ('000):</span> {project.formatted_revised_project_cost || formatPeso(project.revised_project_cost || 0)}</p>
                            </div>
                        </div>

                        {/* Scope of Work */}
                        <div className="bg-gray-50 p-4 rounded-xl shadow-sm border border-gray-200 col-span-1 md:col-span-2">
                            <h5 className="text-lg font-semibold mb-4">Scope of Work</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                     <div>
                                        <span className="font-semibold text-gray-800">Duration, CD:</span>
                                        <p className="text-sm text-gray-700">{project.scope?.[0]?.duration_cd || '-'}</p>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-gray-800">Project Engineer:</span>
                                        <p className="text-sm text-gray-700">{project.scope?.[0]?.project_engineer || '-'}</p>
                                    </div>
                                     <div>
                                        <span className="font-semibold text-gray-800">Contractor:</span>
                                        <p className="text-sm text-gray-700">{project.scope?.[0]?.contractor_name || '-'}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <span className="font-semibold text-gray-800">Unit of Measure:</span>
                                        <p className="text-sm text-gray-700">{project.scope?.[0]?.unit_of_measure || '-'}</p>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-gray-800">Scope of Work:</span>
                                        <p className="text-sm text-gray-700">{project.scope?.[0]?.scope_of_work_main || '-'}</p>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-gray-800">Assigned Engineers:</span>
                                        <div className="mt-1">
                                            {project.assignedEngineers?.length
                                                ? project.assignedEngineers.map((eng, i) => (
                                                    <span key={i} className="inline-block text-indigo-800 px-2 py-1 rounded-full text-sm mr-1 mb-1">
                                                        {eng.engineer_title && eng.engineer_name ? `${eng.engineer_title} – ${eng.engineer_name}` : "Invalid data"}
                                                    </span>
                                                ))
                                                : <span className="italic text-gray-500 text-sm">No assigned engineers</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Progress & Scope */}
                        <div className="bg-gray-50 p-4 rounded-xl shadow-sm border border-gray-200 col-span-1 md:col-span-2">
                            <h5 className="text-lg font-semibold mb-4">Progress & Scope</h5>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                {/* Target Quantities */}
                                <div className="space-y-3">
                                    <h6 className="font-semibold text-gray-800 border-b border-gray-300 pb-1">Target ({project.scope?.[0]?.unit_of_measure || 'units'})</h6>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Planned:</span>
                                            <span className="font-medium text-blue-600">{project.progress?.[0]?.target_planned || '-'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Revised:</span>
                                            <span className="font-medium text-orange-600">{project.progress?.[0]?.target_revised || '-'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Actual:</span>
                                            <span className="font-medium text-green-600">{project.progress?.[0]?.target_actual || '-'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Start Dates */}
                                <div className="space-y-3">
                                    <h6 className="font-semibold text-gray-800 border-b border-gray-300 pb-1">Start Date (d,m,y)</h6>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Planned:</span>
                                            <span className="font-medium text-blue-600">{formatDate(project.progress?.[0]?.target_start_planned)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Revised:</span>
                                            <span className="font-medium text-orange-600">{formatDate(project.progress?.[0]?.target_start_revised)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Actual:</span>
                                            <span className="font-medium text-green-600">{formatDate(project.progress?.[0]?.target_start_actual)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Completion Dates */}
                                <div className="space-y-3">
                                    <h6 className="font-semibold text-gray-800 border-b border-gray-300 pb-1">Completion Date (d,m,y)</h6>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Planned:</span>
                                            <span className="font-medium text-blue-600">{formatDate(project.progress?.[0]?.target_completion_planned)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Revised:</span>
                                            <span className="font-medium text-orange-600">{formatDate(project.progress?.[0]?.target_completion_revised)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Actual:</span>
                                            <span className="font-medium text-green-600">{formatDate(project.progress?.[0]?.target_completion_actual)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Completion Percentages */}
                                <div className="space-y-3">
                                    <h6 className="font-semibold text-gray-800 border-b border-gray-300 pb-1">Completion Percentage (%)</h6>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Planned:</span>
                                            <span className="font-medium text-blue-600">{(project.progress?.[0]?.completion_percentage_planned || '-') + '%'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Actual:</span>
                                            <div className="text-right">
                                                <span className="font-medium text-green-600">{(parseFloat(project.progress?.[0]?.completion_percentage_actual) || '-') + '%'}</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Slippage: </span>
                                            <span className={
                                                (() => {
                                                    const planned = parseFloat(project.progress?.[0]?.completion_percentage_planned) || 0;
                                                    const actual = parseFloat(project.progress?.[0]?.completion_percentage_actual) || 0;
                                                    const slippage = actual - planned;
                                                    return slippage > 0 ? 'text-blue-600 font-semibold' : slippage < 0 ? 'text-red-600 font-semibold' : 'text-gray-700';
                                                })()
                                            }>
                                                {(() => {
                                                    const planned = parseFloat(project.progress?.[0]?.completion_percentage_planned) || 0;
                                                    const actual = parseFloat(project.progress?.[0]?.completion_percentage_actual) || 0;
                                                    return (actual - planned).toFixed(2) + '%';
                                                })()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Remarks */}
                        <div className="bg-gray-50 p-4 rounded-xl shadow-sm border border-gray-200 col-span-1 md:col-span-2">
                            <h5 className="text-lg font-semibold mb-2">Remarks</h5>
                            <p className="text-gray-700 text-sm">{project.remarks?.[0]?.remarks || '-'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
