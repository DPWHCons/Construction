import PageLayout from '@/Layouts/PageLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import useAutoRefresh from '@/Hooks/useAutoRefresh';
import FeedbackAlert from '@/Components/FeedbackAlert';

export default function Dashboard() {
    const { auth, stats, monthlyData, recentProjects, selectedYear: initialYear } = usePage().props;
    const [showSuccessToast, setShowSuccessToast] = useState(false);

        // State for year filter
    const [selectedYear, setSelectedYear] = useState(initialYear || 'all');
    const handleYearChange = (year) => {
        setSelectedYear(year);
        window.location.href = route('dashboard', { year: year === 'all' ? null : year });
    };

    // Show success toast on component mount if user just logged in
    useEffect(() => {
        // Check URL parameter for login success
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('login') === 'success') {
            setShowSuccessToast(true);
            
            // Clean URL without page reload
            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);
        }
    }, []);

    // Auto-refresh dashboard stats every 10 seconds
    useAutoRefresh(10000, {
        preserveScroll: true,
        preserveState: true,
    });

    // Fallback values if stats not available
    const safeStats = stats || {
        totalProjects: 0,
        completedProjects: 0,
        ongoingProjects: 0,
        pendingProjects: 0,
        totalImages: 0
    };

    // Get available years for filter - only extract actual years from database
    const getAvailableYears = () => {
        const years = [];
        const projectYears = new Set();
        
        // Extract only actual project_year values from database
        if (recentProjects) {
            recentProjects.forEach(project => {
                if (project.project_year && project.project_year !== 'Unknown Year') {
                    projectYears.add(String(project.project_year));
                }
            });
        }
        
        // Sort years in descending order (most recent first)
        const sortedYears = Array.from(projectYears).sort((a, b) => parseInt(b) - parseInt(a));
        years.push(...sortedYears);
        
        return years;
    };

    return (
        <PageLayout>
            <Head title="Dashboard" />
            
            {/* Success Toast */}
            <FeedbackAlert
                show={showSuccessToast}
                type="success"
                title="Login Successful"
                message="Welcome"
                duration={3000}
                onClose={() => setShowSuccessToast(false)}
            />
            
            <div className="space-y-8">
                {/* Welcome Section */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 font-montserrat leading-none" style={{ fontSize: '2rem', lineHeight: '0.8' }}>
                            Dashboard Overview
                        </h2>
                        <p className="text-slate-500 mt-1 font-montserrat" style={{marginTop: '1rem'}}></p>
                    </div>
                    {/* Year Filter */}
                    <div className="flex items-center gap-3">
                        <label className="text-sm font-semibold text-slate-600 font-montserrat">
                            Year
                        </label>

                        <div className="w-90">
                            <select
                                value={selectedYear}
                                onChange={(e) => handleYearChange(e.target.value)}
                                className="w-full pl-2 pr-4 py-2.5  border border-slate-200 rounded-xl shadow-sm 
                       focus:outline-none focus:ring-2 focus:ring-[#Eb3505] 
                       focus:border-transparent font-montserrat text-sm 
                       bg-white text-black hover:border-slate-300 transition"
                            >
                                <option value="all">All Years</option>
                                {getAvailableYears().map((year) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                 {/* Overall Completion Indicator */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mt-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-slate-800">Overall Project Completion</h3>
                        <span className="text-2xl font-bold text-slate-900">{Math.round((safeStats.completedProjects / safeStats.totalProjects) * 100) || 0}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-4 rounded-full overflow-hidden">
                        <div
                            className="bg-green-500 h-4 rounded-full transition-all duration-700 flex items-center justify-center shadow-lg"
                            style={{ width: `${Math.max(5, (safeStats.completedProjects / safeStats.totalProjects) * 100)}%` }}
                        >
                            <span className="text-xs text-white font-semibold drop-shadow">
                                {Math.round((safeStats.completedProjects / safeStats.totalProjects) * 100) || 0}%
                            </span>
                        </div>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 mt-2">
                        <span>{safeStats.completedProjects} Completed</span>
                        <span>{safeStats.totalProjects} Total Projects</span>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-4" style={{marginTop: '.5rem'}}>
                    {/* Total Projects Card */}
                    <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-slate-200 relative group hover:shadow-xl transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-600 transition-colors group-hover:bg-indigo-100">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-4xl font-black text-slate-900 font-montserrat tracking-tight">{safeStats.totalProjects}</h3>
                            <p className="text-sm font-bold font-montserrat" style={{color: '#010066'}}>Total Projects</p>
                        </div>
                    </div>

                    {/* Completed Projects Card */}
                    <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-slate-200 relative group hover:shadow-xl transition-all" >
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-4 bg-blue-50 rounded-2xl text-blue-600 transition-colors group-hover:bg-blue-100">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-4xl font-black text-slate-900 font-montserrat tracking-tight">{safeStats.completedProjects}</h3>
                            <p className="text-sm font-bold font-montserrat" style={{color: '#010066'}}>Completed Projects</p>
                        </div>
                    </div>

                    {/* Ongoing Projects Card */}
                    <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-slate-200 relative group hover:shadow-xl transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-4 bg-orange-50 rounded-2xl text-orange-600 transition-colors group-hover:bg-orange-100">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-4xl font-black text-slate-900 font-montserrat tracking-tight">{safeStats.ongoingProjects}</h3>
                            <p className="text-sm font-bold font-montserrat" style={{color: '#010066'}}>Ongoing Projects</p>
                        </div>
                    </div>

                    {/* Pending Projects Card */}
                    <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-slate-200 relative group hover:shadow-xl transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-4 bg-red-50 rounded-2xl text-red-600 transition-colors group-hover:bg-red-100">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-4xl font-black text-slate-900 font-montserrat tracking-tight">{safeStats.pendingProjects}</h3>
                            <p className="text-sm font-bold font-montserrat" style={{color: '#010066'}}>Pending Projects</p>
                        </div>
                    </div>
                </div>

                {/* Project Status Distribution and Recent Projects Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6" style={{marginTop: '.8rem'}}>
                    {/* Project Status Distribution Card */}
                    <div className="lg:col-span-2">
                        <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 h-full flex flex-col shadow-lg relative group hover:shadow-xl transition-all">
                            <h3 className="text-lg font-bold text-slate-800 mb-4">Project Status Distribution</h3>
                            <div className="space-y-4 flex-1">
                                {/* Completed Bar */}
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-blue-700 font-semibold">Completed</span>
                                        <span className="text-blue-700 font-bold">{safeStats.completedProjects}</span>
                                    </div>
                                    <div className="w-full bg-blue-200 rounded-full h-8 relative overflow-hidden">
                                        <div
                                            className="bg-blue-500 h-full rounded-full transition-all duration-500 min-w-[2rem]"
                                            style={{
                                                width: `${Math.max(2, safeStats.totalProjects > 0 ? (safeStats.completedProjects / safeStats.totalProjects) * 100 : 2)}%`,
                                                backgroundColor: '#3b82f6'
                                            }}
                                        >
                                        </div>
                                        <span className="absolute inset-0 flex items-center justify-center text-black text-xs font-bold">
                                            {safeStats.totalProjects > 0 ? Math.round((safeStats.completedProjects / safeStats.totalProjects) * 100) : 0}%
                                        </span>
                                    </div>
                                </div>

                                {/* Ongoing Bar */}
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-orange-700 font-semibold">Ongoing</span>
                                        <span className="text-orange-700 font-bold">{safeStats.ongoingProjects}</span>
                                    </div>
                                    <div className="w-full bg-orange-200 rounded-full h-8 relative overflow-hidden">
                                        <div
                                            className="bg-orange-500 h-full rounded-full transition-all duration-500 min-w-[2rem]"
                                            style={{
                                                width: `${Math.max(2, safeStats.totalProjects > 0 ? (safeStats.ongoingProjects / safeStats.totalProjects) * 100 : 2)}%`,
                                                backgroundColor: '#f97316'
                                            }}
                                        >
                                        </div>
                                        <span className="absolute inset-0 flex items-center justify-center text-black text-xs font-bold">
                                            {safeStats.totalProjects > 0 ? Math.round((safeStats.ongoingProjects / safeStats.totalProjects) * 100) : 0}%
                                        </span>
                                    </div>
                                </div>

                                {/* Pending Bar */}
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-red-700 font-semibold">Pending</span>
                                        <span className="text-red-700 font-bold">{safeStats.pendingProjects}</span>
                                    </div>
                                    <div className="w-full bg-red-200 rounded-full h-8 relative overflow-hidden">
                                        <div
                                            className="bg-red-500 h-full rounded-full transition-all duration-500 min-w-[2rem]"
                                            style={{
                                                width: `${Math.max(2, safeStats.totalProjects > 0 ? (safeStats.pendingProjects / safeStats.totalProjects) * 100 : 2)}%`,
                                                backgroundColor: '#ef4444'
                                            }}
                                        >
                                        </div>
                                        <span className="absolute inset-0 flex items-center justify-center text-black text-xs font-bold">
                                            {safeStats.totalProjects > 0 ? Math.round((safeStats.pendingProjects / safeStats.totalProjects) * 100) : 0}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Projects Table */}
                    <div className="lg:col-span-1">
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm h-full flex flex-col">
                            <div className="mb-4">
                                <h3 className="text-lg font-bold text-slate-800">Recent Projects</h3>
                            </div>
                            <div className="overflow-x-auto flex-1">
                                <table className="w-full h-full">
                                    <thead>
                                        <tr className="border-b border-slate-200">
                                            <th className="text-left py-2 px-2 text-xs font-semibold text-slate-600">Project ID</th>
                                            <th className="text-left py-2 px-2 text-xs font-semibold text-slate-600">Contract ID</th>
                                            <th className="text-left py-2 px-2 text-xs font-semibold text-slate-600">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentProjects && recentProjects.length > 0 ? (
                                            recentProjects.slice(0, 2).map((project) => {
                                                // Map database status to display text and color
                                                const statusMap = {
                                                    ongoing: { text: 'Ongoing'},
                                                    completed: { text: 'Completed'},
                                                    pending: { text: 'Pending'},
                                                };

                                                const status = statusMap[project.status] || statusMap.pending;

                                                return (
                                                    <tr key={project.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                                                        <td className="py-2 px-2">
                                                            <div className="font-medium text-xs text-slate-900">{project.project_id || `    ${project.id}`}</div>
                                                        </td>
                                                        <td className="py-2 px-2">
                                                            <div className="font-medium text-xs text-slate-900">{project.contract_id || `${project.id}`}</div>
                                                        </td>
                                                        <td className="py-2 px-2">
                                                            <span className="px-2 py-0.5 text-xs font-medium">
                                                                {status.text}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan="3" className="py-4 text-center text-xs text-slate-500">
                                                    No recent projects found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                </div>
        </PageLayout>
    );
}  