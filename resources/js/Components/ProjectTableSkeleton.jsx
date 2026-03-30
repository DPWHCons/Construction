import React from 'react';

const ProjectTableSkeleton = ({ rows = 5 }) => {
    return (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden animate-pulse">
            <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                        <th className="px-4 py-3 text-left">
                            <div className="h-4 bg-slate-200 rounded w-20"></div>
                        </th>
                        <th className="px-4 py-3 text-left">
                            <div className="h-4 bg-slate-200 rounded w-24"></div>
                        </th>
                        <th className="px-4 py-3 text-left">
                            <div className="h-4 bg-slate-200 rounded w-16"></div>
                        </th>
                        <th className="px-4 py-3 text-left">
                            <div className="h-4 bg-slate-200 rounded w-12"></div>
                        </th>
                        <th className="px-4 py-3 text-left w-32">
                            <div className="h-4 bg-slate-200 rounded w-16"></div>
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                    {Array.from({ length: rows }).map((_, index) => (
                        <tr key={index} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3">
                                <div className="h-4 bg-slate-200 rounded w-16 font-mono"></div>
                            </td>
                            <td className="px-4 py-3">
                                <div className="space-y-2">
                                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                                    <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                                </div>
                            </td>
                            <td className="px-4 py-3">
                                <div className="h-4 bg-slate-200 rounded w-20"></div>
                            </td>
                            <td className="px-4 py-3">
                                <div className="h-4 bg-slate-200 rounded w-12"></div>
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-slate-200 rounded"></div>
                                    <div className="w-8 h-8 bg-slate-200 rounded"></div>
                                    <div className="w-8 h-8 bg-slate-200 rounded"></div>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ProjectTableSkeleton;
