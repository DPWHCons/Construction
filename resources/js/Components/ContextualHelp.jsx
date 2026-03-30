import React, { useState } from 'react';
import { QuestionMarkCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

const ContextualHelp = ({ title, content, position = 'top-right' }) => {
    const [isOpen, setIsOpen] = useState(false);

    const positionClasses = {
        'top-right': 'top-0 right-0',
        'top-left': 'top-0 left-0',
        'bottom-right': 'bottom-0 right-0',
        'bottom-left': 'bottom-0 left-0',
        'center': 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
    };

    return (
        <div className="relative inline-block">
            {/* Help Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors mt-4"
                title="Help"
            >
                <QuestionMarkCircleIcon className="w-4 h-4" />
            </button>

            {/* Help Modal */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 bg-black/20 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    
                    {/* Help Content */}
                    <div className={`absolute ${positionClasses[position]} z-50 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 p-6`}>
                        <div className="flex items-start justify-between mb-4">
                            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="text-sm text-slate-600 space-y-3">
                            {content}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

// Predefined help content for different sections
export const DashboardHelp = () => (
    <ContextualHelp
        title="Dashboard Overview"
        position="top-right"
        content={
            <div>
                <p className="mb-3">
                    Welcome to your DPWH Project Management Dashboard! Here's what you can see here:
                </p>
                
                <div className="space-y-2">
                    <div className="flex items-start gap-2">
                        <span className="text-blue-600">•</span>
                        <div>
                            <strong>KPI Cards:</strong> Get quick insights about projects status.
                        </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                        <span className="text-blue-600">•</span>
                        <div>
                            <strong>Status Distribution:</strong> Visual breakdown of project completion rates.
                        </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                        <span className="text-blue-600">•</span>
                        <div>
                            <strong>Recent Projects:</strong> Latest project updates at a glance.
                        </div>
                    </div>
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-700">
                        <strong>Tip:</strong> Use the year filter to focus on specific time periods.
                    </p>
                </div>
            </div>
        }
    />
);

export const ProjectManagementHelp = () => (
    <ContextualHelp
        title="Project Management"
        position="top-right"
        content={
            <div>
                <p className="mb-3">
                    Manage your DPWH projects efficiently with these features:
                </p>
                
                <div className="space-y-2">
                    <div className="flex items-start gap-2">
                        <span className="text-green-600">•</span>
                        <div>
                            <strong>Search:</strong> Find projects by contract ID or title instantly.
                        </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                        <span className="text-green-600">•</span>
                        <div>
                            <strong>Filters:</strong> Sort by status (Ongoing, Completed, Pending) and year.
                        </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                        <span className="text-green-600">•</span>
                        <div>
                            <strong>Project Cards:</strong> Hover to reveal action buttons for quick access.
                        </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                        <span className="text-green-600">•</span>
                        <div>
                            <strong>Bulk Actions:</strong> Import multiple projects or export data for reporting.
                        </div>
                    </div>
                </div>
                
                <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-xs text-green-700">
                        <strong>Pro Tip:</strong> Click on any project card to view detailed information and images.
                    </p>
                </div>
            </div>
        }
    />
);

export const FilterHelp = () => (
    <ContextualHelp
        title="Search & Filters"
        position="bottom-right"
        content={
            <div>
                <p className="mb-3">
                    Find exactly what you're looking for:
                </p>
                
                <div className="space-y-2">
                    <div className="flex items-start gap-2">
                        <span className="text-purple-600">🔍</span>
                        <div>
                            <strong>Search:</strong> Type contract IDs or project titles. Results update automatically.
                        </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                        <span className="text-purple-600">📊</span>
                        <div>
                            <strong>Status Filter:</strong> Focus on specific project stages.
                        </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                        <span className="text-purple-600">📅</span>
                        <div>
                            <strong>Year Filter:</strong> Navigate through different project years.
                        </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                        <span className="text-purple-600">❌</span>
                        <div>
                            <strong>Clear All:</strong> Reset filters to view all projects.
                        </div>
                    </div>
                </div>
            </div>
        }
    />
);

export default ContextualHelp;
