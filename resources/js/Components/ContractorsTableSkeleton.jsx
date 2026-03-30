import React from 'react';

const ContractorsTableSkeleton = ({ rows = 10 }) => {
    return (
        <div className="border border-slate-200 rounded-xl shadow-sm overflow-hidden animate-pulse">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left bg-white">
                    {/* Header */}
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-slate-700 uppercase tracking-wider">
                                <div className="h-4 bg-slate-200 rounded w-40"></div>
                            </th>
                            <th className="px-6 py-4 font-semibold text-slate-700 uppercase tracking-wider text-center">
                                <div className="h-4 bg-slate-200 rounded w-32 mx-auto"></div>
                            </th>
                            <th className="px-6 py-4 text-center font-semibold text-slate-700 uppercase tracking-wider">
                                <div className="h-4 bg-slate-200 rounded w-20 mx-auto"></div>
                            </th>
                        </tr>
                    </thead>
                    {/* Body */}
                    <tbody className="divide-y divide-slate-100">
                        {Array.from({ length: rows }).map((_, index) => (
                            <tr key={index} className="hover:bg-slate-50 transition-colors cursor-pointer">
                                {/* Contractor Name */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="h-4 bg-slate-200 rounded w-48"></div>
                                </td>
                                {/* Project Count */}
                                <td className="px-6 py-4 text-center">
                                    <div className="h-6 bg-slate-200 rounded w-24 mx-auto"></div>
                                </td>
                                {/* Actions */}
                                <td className="px-6 py-4 text-center">
                                    <div className="flex items-center justify-center gap-3">
                                        <div className="w-20 h-8 bg-slate-200 rounded"></div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ContractorsTableSkeleton;
