import React, { useState } from 'react';
import {
    BookOpenIcon,
    XMarkIcon,
    PlayIcon,
    LightBulbIcon,
    QuestionMarkCircleIcon,
    CogIcon
} from '@heroicons/react/24/outline';

const tabs = [
    { key: 'overview', label: 'Overview', icon: PlayIcon },
    { key: 'navigation', label: 'Navigation', icon: BookOpenIcon },
    { key: 'workflow', label: 'Workflow', icon: CogIcon },
    { key: 'tips', label: 'Tips', icon: LightBulbIcon },
    { key: 'help', label: 'Help', icon: QuestionMarkCircleIcon },
];

export default function UserGuide() {
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState('overview');

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setOpen(true)}
                className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg hover:scale-110 transition z-40"
            >
                <BookOpenIcon className="w-6 h-6" />
            </button>

            {/* Modal */}
            {open && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-5xl h-[90vh] rounded-2xl shadow-xl flex flex-col overflow-hidden">

                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">User Guide</h2>
                                <p className="text-xs text-slate-500">DPWH Project Management System</p>
                            </div>
                            <button onClick={() => setOpen(false)}>
                                <XMarkIcon className="w-5 h-5 text-slate-500 hover:text-slate-700" />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-2 px-4 py-3 border-b overflow-x-auto">
                            {tabs.map(tab => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.key}
                                        onClick={() => setActive(tab.key)}
                                        className={`flex items-center justify-center gap-2 px-6 py-2 rounded-full text-sm whitespace-nowrap transition-all duration-200 ${active === tab.key
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Content */}
                        <div className="p-6 overflow-y-auto space-y-6">

                            {/* OVERVIEW */}
                            {active === 'overview' && (
                                <div className="grid md:grid-cols-2 gap-4">
                                    {[
                                        ['Project Tracking', 'Monitor infrastructure projects from start to completion.'],
                                        ['Progress Monitoring', 'Track completion percentage and milestones.'],
                                        ['Document Management', 'Store images and documents securely.'],
                                        ['Reports & Analytics', 'Generate insights and export reports easily.'],
                                    ].map(([title, desc], i) => (
                                        <div key={i} className="p-4 rounded-xl border bg-slate-50 hover:shadow-md transition">
                                            <h4 className="font-semibold text-slate-800">{title}</h4>
                                            <p className="text-sm text-slate-600 mt-1">{desc}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* NAVIGATION */}
                            {active === 'navigation' && (
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-xl border bg-slate-50 hover:shadow-md transition">
                                        <h4 className="font-semibold mb-2 text-slate-800">Main Sections</h4>
                                        <ul className="text-sm space-y-2">
                                            <li>
                                                <span className="font-bold text-sm text-slate-800">Dashboard</span>
                                                <p className="text-slate-600">View project overview, statistics, KPIs, and recent activities in one central location.</p>
                                            </li>
                                            <li>
                                                <span className="font-bold text-sm text-slate-800">Projects</span>
                                                <p className="text-slate-600">Manage all infrastructure projects with search, filters, and detailed project information.</p>
                                            </li>
                                            <li>
                                                <span className="font-bold text-sm text-slate-800">Categories</span>
                                                <p className="text-slate-600">Organize projects by type, department, or classification for better management.</p>
                                            </li>
                                            <li>
                                                <span className="font-bold text-sm text-slate-800">Contractors</span>
                                                <p className="text-slate-600">Manage contractor information, assignments, and contact details.</p>
                                            </li>
                                            <li>
                                                <span className="font-bold text-sm text-slate-800">Gallery</span>
                                                <p className="text-slate-600">View project images, progress photos, and visual documentation.</p>
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="p-4 rounded-xl border bg-slate-50 hover:shadow-md transition">
                                        <h4 className="font-semibold mb-2 text-slate-800">Quick Steps</h4>
                                        <ol className="text-sm space-y-2">
                                            <li>
                                                <span className="font-medium text-slate-800">1. Login</span>
                                                <p className="text-slate-600 ml-4">Enter your username and password on the login page to access the system.</p>
                                            </li>
                                            <li>
                                                <span className="font-medium text-slate-800">2. Open Dashboard</span>
                                                <p className="text-slate-600 ml-4">View project overview, statistics, KPIs, and recent activities on the main dashboard.</p>
                                            </li>
                                            <li>
                                                <span className="font-medium text-slate-800">3. Go to Projects</span>
                                                <p className="text-slate-600 ml-4">Navigate to the Projects section to view and manage all infrastructure projects.</p>
                                            </li>
                                            <li>
                                                <span className="font-medium text-slate-800">4. Search or Filter</span>
                                                <p className="text-slate-600 ml-4">Use the search bar to find specific projects or apply filters to narrow results.</p>
                                            </li>
                                            <li>
                                                <span className="font-medium text-slate-800">5. View Details</span>
                                                <p className="text-slate-600 ml-4">Click on any project card to see complete details, progress, and documentation.</p>
                                            </li>
                                        </ol>
                                    </div>
                                </div>
                            )}

                            {/* WORKFLOW */}
                            {active === 'workflow' && (
                                <div className="space-y-4">
                                    {/* First 3 items in 3-column grid */}
                                    <div className="grid md:grid-cols-3 gap-4">
                                        {[
                                            {
                                                step: 'Login Authentication',
                                                desc: 'Access system with credentials and navigate to dashboard.',
                                                details: ['Enter credentials', 'Sign in', 'View dashboard'],
                                                style: 'bg-blue-100 text-blue-600'
                                            },
                                            {
                                                step: 'Dashboard Navigation',
                                                desc: 'Explore dashboard with KPIs, statistics, and quick actions.',
                                                details: ['View statistics', 'Filter projects', 'Check activities'],
                                                style: 'bg-green-100 text-green-600'
                                            },
                                            {
                                                step: 'Projects Management',
                                                desc: 'View, search, filter, and manage infrastructure projects.',
                                                details: ['Navigate projects', 'Search/filter', 'View details'],
                                                style: 'bg-purple-100 text-purple-600'
                                            }
                                        ].map((item, i) => (
                                            <div key={i} className="p-4 rounded-xl border bg-slate-50 hover:shadow-md transition">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className={`w-10 h-10 flex items-center justify-center rounded-full font-bold ${item.style}`}>
                                                        {i + 1}
                                                    </div>
                                                    <h4 className="font-semibold text-slate-800 text-lg">{item.step}</h4>
                                                </div>
                                                <p className="text-sm text-slate-600 mb-3">{item.desc}</p>
                                                <ul className="text-xs text-slate-600 space-y-1">
                                                    {item.details.map((detail, j) => (
                                                        <li key={j}>• {detail}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Last 2 items in 2-column grid */}
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {[
                                            {
                                                step: 'Project Operations',
                                                desc: 'Create, edit, upload images, and update project status.',
                                                details: ['Create projects', 'Edit details', 'Upload images', 'Update status'],
                                                style: 'bg-amber-100 text-amber-600'
                                            },
                                            {
                                                step: 'System Features',
                                                desc: 'Use Categories, Contractors, Gallery, and export functions.',
                                                details: ['Organize categories', 'Manage contractors', 'View gallery', 'Export data'],
                                                style: 'bg-indigo-100 text-indigo-600'
                                            }
                                        ].map((item, i) => (
                                            <div key={i + 3} className="p-4 rounded-xl border bg-slate-50 hover:shadow-md transition">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className={`w-10 h-10 flex items-center justify-center rounded-full font-bold ${item.style}`}>
                                                        {i + 4}
                                                    </div>
                                                    <h4 className="font-semibold text-slate-800 text-lg">{item.step}</h4>
                                                </div>
                                                <p className="text-sm text-slate-600 mb-3">{item.desc}</p>
                                                <ul className="text-xs text-slate-600 space-y-1">
                                                    {item.details.map((detail, j) => (
                                                        <li key={j}>• {detail}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* TIPS */}
                            {active === 'tips' && (
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-xl border bg-slate-50 hover:shadow-md transition">
                                        <h4 className="font-semibold mb-3 text-indigo-900">Productivity</h4>
                                        <ul className="text-sm space-y-1">
                                            <li>• <strong>Quick Search:</strong> Use <kbd className="px-1 py-0.5 bg-white rounded text-xs">Ctrl</kbd>+<kbd className="px-1 py-0.5 bg-white rounded text-xs">K</kbd></li>
                                            <li>• <strong>Smart Filters:</strong> Combine status + year filters</li>
                                            <li>• <strong>Bookmarks:</strong> Save frequent filter combinations</li>
                                            <li>• <strong>Keyboard:</strong> Use <kbd className="px-1 py-0.5 bg-white rounded text-xs">Tab</kbd> to navigate</li>
                                        </ul>
                                    </div>

                                    <div className="p-4 rounded-xl border bg-slate-50 hover:shadow-md transition">
                                        <h4 className="font-semibold mb-3 text-emerald-900">Best Practices</h4>
                                        <ul className="text-sm space-y-1">
                                            <li>• <strong>Clear Titles:</strong> Use descriptive names with IDs</li>
                                            <li>• <strong>Regular Updates:</strong> Update status weekly</li>
                                            <li>• <strong>Quality Images:</strong> Upload high-res photos</li>
                                            <li>• <strong>Categories:</strong> Group by type/department</li>
                                            <li>• <strong>Documentation:</strong> Record milestones</li>
                                        </ul>
                                    </div>

                                    <div className="p-4 rounded-xl border bg-slate-50 hover:shadow-md transition">
                                        <h4 className="font-semibold mb-3 text-purple-900">Advanced</h4>
                                        <ul className="text-sm space-y-1">
                                            <li>• <strong>Data Export:</strong> Export to Excel for analysis</li>
                                            <li>• <strong>Year Views:</strong> Track historical trends</li>
                                            <li>• <strong>Archiving:</strong> Archive completed projects</li>
                                            <li>• <strong>Batch Import:</strong> Use Excel for multiple projects</li>
                                        </ul>
                                    </div>

                                    <div className="p-4 rounded-xl border bg-slate-50 hover:shadow-md transition">
                                        <h4 className="font-semibold mb-3 text-amber-900">Performance</h4>
                                        <ul className="text-sm space-y-1">
                                            <li>• <strong>Focused Views:</strong> Use specific filters</li>
                                            <li>• <strong>Browser:</strong> Keep updated, close tabs</li>
                                            <li>• <strong>Images:</strong> Compress before upload</li>
                                            <li>• <strong>Cache:</strong> Clear if system slows</li>
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {/* HELP */}
                            {active === 'help' && (
                                <div className="grid md:grid-cols-2 gap-4">
                                    {/* Support Contacts */}
                                    <div className="p-4 rounded-xl border bg-slate-50 hover:shadow-md transition">
                                        <h4 className="font-semibold mb-3 text-slate-800">Support Contacts</h4>
                                        <div className="space-y-3">
                                            <div>
                                                <h5 className="font-medium text-sm text-slate-700 mb-2">Technical Support</h5>
                                                <ul className="text-sm space-y-1 text-slate-600">
                                                    <li>• System issues or bug reports</li>
                                                    <li>• Feature requests</li>
                                                    <li>• Training assistance</li>
                                                    <li>• Contact us at:</li>
                                                    <li className="ml-4"><a href="https://facebook.com/dpwhconstruction" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>Nexio Dev</a> </li>
                                                     <li className="ml-4"> <span className="font-medium inline-flex items-center gap-1"><svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>nexiodevsph@gmail.com</span></li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Common Issues & Solutions */}
                                    <div className="p-4 rounded-xl border bg-slate-50 hover:shadow-md transition">
                                        <h4 className="font-semibold mb-3 text-slate-800">Common Issues</h4>
                                        <div className="space-y-2">
                                            {[
                                                {
                                                    issue: 'Projects not loading',
                                                    solutions: ['Refresh page', 'Check connection']
                                                },
                                                {
                                                    issue: 'Search not working',
                                                    solutions: ['Clear filters', 'Check ID format']
                                                },
                                                {
                                                    issue: 'Image upload failed',
                                                    solutions: ['Check size', 'Verify format']
                                                },
                                                {
                                                    issue: 'Login problems',
                                                    solutions: ['Check credentials', 'Reset password']
                                                }
                                            ].map((item, i) => (
                                                <div key={i} className="border-l-4 border-blue-400 pl-2">
                                                    <h5 className="font-medium text-xs text-slate-700">{item.issue}</h5>
                                                    <ul className="text-xs space-y-1 text-slate-600">
                                                        {item.solutions.map((sol, j) => (
                                                            <li key={j}>• {sol}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    </div>                        
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            )}
        </>
    );
}