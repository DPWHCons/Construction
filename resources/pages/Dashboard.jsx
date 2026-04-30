import PageLayout from '@/Layouts/PageLayout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import useAutoRefresh from '@/Hooks/useAutoRefresh';
import FeedbackAlert from '@/Components/FeedbackAlert';
import { ChartBarIcon, ArrowTrendingUpIcon, ClockIcon, CheckCircleIcon, ExclamationCircleIcon, ArrowPathIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { DashboardHelp } from '@/Components/ContextualHelp';

export default function Dashboard() {
    const { auth, stats, monthlyData, recentProjects, selectedYear: initialYear, availableYears } = usePage().props;
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // State for year filter
    const [selectedYear, setSelectedYear] = useState(initialYear || 'all');
    const handleYearChange = (year) => {
        setSelectedYear(year);
        setIsLoading(true);
        
        // Use Inertia.js for fast navigation without full page reload
        router.get(
            route('dashboard'), 
            { year: year },
            {
                preserveState: false, // Changed to false to refresh data
                preserveScroll: true,
                onStart: () => setIsLoading(true),
                onFinish: () => setIsLoading(false),
                onSuccess: () => setIsLoading(false),
                onError: () => setIsLoading(false),
            }
        );
    };

    // Prevent back button navigation - refresh instead
    useEffect(() => {
        // Push current state to history to prevent going back
        window.history.pushState(null, '', window.location.href);
        
        const handlePopState = (e) => {
            // Prevent default back navigation
            e.preventDefault();
            // Push state again to stay on current page
            window.history.pushState(null, '', window.location.href);
            // Refresh the page
            window.location.reload();
        };
        
        window.addEventListener('popstate', handlePopState);
        
        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, []);

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
        preserveState: false, // Changed to false to ensure fresh data
    });

    // Fallback values if stats not available
    const safeStats = stats || {
        totalProjects: 0,
        completedProjects: 0,
        ongoingProjects: 0,
        pendingProjects: 0,
        totalImages: 0
    };

    // Get available years for filter - use dedicated availableYears prop or extract from data
    const getAvailableYears = () => {
        // If availableYears is provided from backend, use it
        if (availableYears && Array.isArray(availableYears)) {
            return availableYears.sort((a, b) => parseInt(b) - parseInt(a));
        }
        
        // Fallback: extract years from multiple sources
        const years = [];
        const projectYears = new Set();
        
        // Extract from recentProjects
        if (recentProjects) {
            recentProjects.forEach(project => {
                if (project.project_year && project.project_year !== 'Unknown Year') {
                    projectYears.add(String(project.project_year));
                }
            });
        }
        
        // Extract from monthlyData if available
        if (monthlyData && Array.isArray(monthlyData)) {
            monthlyData.forEach(month => {
                if (month.year) {
                    projectYears.add(String(month.year));
                }
            });
        }
        
        // Extract from stats if it has year-based data
        if (stats && stats.yearlyBreakdown) {
            Object.keys(stats.yearlyBreakdown).forEach(year => {
                if (year !== 'Unknown Year') {
                    projectYears.add(String(year));
                }
            });
        }
        const sortedYears = Array.from(projectYears).sort((a, b) => parseInt(b) - parseInt(a));
        years.push(...sortedYears);
        
        return years;
    };

    const KpiSkeleton = () => (
        <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-slate-200 animate-pulse">
            <div className="flex justify-between items-start mb-4">
                <div className="p-4 bg-gray-200 rounded-2xl w-12 h-12"></div>
            </div>
            <div className="space-y-2">
                <div className="h-10 bg-gray-200 rounded-lg w-16"></div>
                <div className="h-4 bg-gray-200 rounded-lg w-24"></div>
            </div>
        </div>
    );

    const StatusSkeleton = () => (
        <div className="space-y-4">
            {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                    <div className="flex justify-between">
                        <div className="h-4 bg-gray-200 rounded-lg w-20"></div>
                        <div className="h-4 bg-gray-200 rounded-lg w-8"></div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-8"></div>
                </div>
            ))}
        </div>
    );

    // Enhanced KPI Card with trend indicator
    const EnhancedKpiCard = ({ title, value, icon, color, trend, subtitle, onClick }) => (
        <div 
            className="bg-white p-4 rounded-xl shadow-lg border-2 border-slate-200 relative group hover:shadow-xl transition-all cursor-pointer flex-1 min-w-0"
            onClick={onClick}
        >
            <div className="flex justify-between items-start mb-3">
                <div className={`p-2 ${color.bg} rounded-xl ${color.text} transition-colors group-hover:${color.hoverBg}`}>
                    {icon}
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-xs font-medium ${trend.color}`}>
                        {trend.value > 0 ? (
                            <ArrowTrendingUpIcon className="w-3 h-3" />
                        ) : (
                            <ArrowPathIcon className="w-3 h-3" />
                        )}
                        {Math.abs(trend.value)}%
                    </div>
                )}
            </div>
            <div className="space-y-1">
                <h3 className="text-2xl font-black text-slate-900 font-montserrat tracking-tight">{value}</h3>
                <p className="text-xs font-bold font-montserrat" style={{color: '#010066'}}>{title}</p>
                {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
            </div>
        </div>
    );

    // Quick Action Button
    const QuickActionButton = ({ icon, label, onClick, color = 'blue' }) => (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-4 py-2 bg-${color}-600 text-white rounded-xl text-sm font-semibold shadow-md hover:bg-${color}-700 transition-all font-montserrat`}
        >
            {icon}
            {label}
        </button>
    );

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
                {/* Enhanced Welcome Section */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div>
                            <h2 className="text-3xl font-bold text-slate-900 font-montserrat leading-none" style={{ fontSize: '2rem', lineHeight: '0.8' }}>
                                Dashboard Overview
                            </h2>
                            <p className="text-slate-500 mt-1 font-montserrat" style={{marginTop: '1rem'}}>
                                Welcome back! Here's what's happening with your projects today.
                            </p>
                        </div>
                        <DashboardHelp />
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Year Filter */}
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-semibold text-slate-600 font-montserrat">
                                Year
                            </label>
                            <div className="w-90 relative">
                                {isLoading && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl z-10">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#Eb3505]"></div>
                                    </div>
                                )}
                                <select
                                    value={selectedYear}
                                    onChange={(e) => handleYearChange(e.target.value)}
                                    disabled={isLoading}
                                    className="w-full pl-2 pr-4 py-2.5  border border-slate-200 rounded-xl shadow-sm 
                           focus:outline-none focus:ring-2 focus:ring-[#Eb3505] 
                           focus:border-transparent font-montserrat text-sm 
                           bg-white text-black hover:border-slate-300 transition disabled:opacity-50"
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
                </div>

                 
                {/* KPI Cards */}
                <div className="flex flex-nowrap gap-2 lg:gap-3 mt-4" style={{marginTop: '.5rem'}}>
                    {isLoading ? (
                        // Show skeleton cards while loading
                        <>
                            <KpiSkeleton />
                            <KpiSkeleton />
                            <KpiSkeleton />
                            <KpiSkeleton />
                        </>
                    ) : (
                        <>
                            {/* Total Projects Card */}
                            <EnhancedKpiCard
                                title="Total Projects"
                                value={safeStats.totalProjects}
                                icon={<ChartBarIcon className="w-6 h-6" />}
                                color={{ bg: 'bg-indigo-50', text: 'text-indigo-600', hoverBg: 'bg-indigo-100' }}
                                subtitle="Across all categories"
                                onClick={() => router.get(route('projects.index'))}
                            />

                            {/* Completed Projects Card */}
                            <EnhancedKpiCard
                                title="Completed Projects"
                                value={safeStats.completedProjects}
                                icon={<CheckCircleIcon className="w-6 h-6" />}
                                color={{ bg: 'bg-blue-50', text: 'text-blue-600', hoverBg: 'bg-blue-100' }}
                                subtitle={safeStats.totalProjects > 0 ? `${Math.round((safeStats.completedProjects / safeStats.totalProjects) * 100)}% completion rate` : 'No projects yet'}
                            />

                            {/* Ongoing Projects Card */}
                            <EnhancedKpiCard
                                title="Ongoing Projects"
                                value={safeStats.ongoingProjects}
                                icon={<ClockIcon className="w-6 h-6" />}
                                color={{ bg: 'bg-orange-50', text: 'text-orange-600', hoverBg: 'bg-orange-100' }}
                                subtitle={safeStats.totalProjects > 0 ? `${Math.round((safeStats.ongoingProjects / safeStats.totalProjects) * 100)}% of total` : 'No ongoing projects'}
                            />

                            {/* Pending Projects Card */}
                            <EnhancedKpiCard
                                title="Pending Projects"
                                value={safeStats.pendingProjects}
                                icon={<ExclamationCircleIcon className="w-6 h-6" />}
                                color={{ bg: 'bg-red-50', text: 'text-red-600', hoverBg: 'bg-red-100' }}
                                subtitle="Needs attention"
                                onClick={() => router.get(route('projects.index', { status: 'pending' }))}
                            />
                        </>
                    )}
                </div>

                {/* Enhanced Project Status Distribution and Recent Projects Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6" style={{marginTop: '.8rem'}}>
                    {/* Enhanced Project Status Distribution Card */}
                    <div className="lg:col-span-2">
                        <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 h-full flex flex-col shadow-lg relative group hover:shadow-xl transition-all">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-slate-800">Project Status Distribution</h3>
                                <span className="text-sm text-slate-500">
                                    {safeStats.totalProjects} total projects
                                </span>
                            </div>
                            <div className="space-y-4 flex-1">
                                {isLoading ? (
                                    <StatusSkeleton />
                                ) : (
                                    <>
                                        {/* Completed Bar */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <CheckCircleIcon className="w-4 h-4 text-blue-600" />
                                                    <span className="text-sm font-semibold text-blue-700">Completed</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-blue-700">{safeStats.completedProjects}</span>
                                                    <span className="text-xs text-slate-500">
                                                        ({safeStats.totalProjects > 0 ? Math.round((safeStats.completedProjects / safeStats.totalProjects) * 100) : 0}%)
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="w-full bg-blue-100 rounded-full h-6 relative overflow-hidden border border-blue-200">
                                                <div
                                                    className="bg-blue-600 h-full rounded-full transition-all duration-700 ease-out shadow-lg border border-blue-400"
                                                    style={{
                                                        width: `${Math.max(2, safeStats.totalProjects > 0 ? (safeStats.completedProjects / safeStats.totalProjects) * 100 : 2)}%`,
                                                    }}
                                                >
                                                </div>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="text-black text-xs font-bold">
                                                        {safeStats.totalProjects > 0 ? Math.round((safeStats.completedProjects / safeStats.totalProjects) * 100) : 0}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Ongoing Bar */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <ClockIcon className="w-4 h-4 text-orange-600" />
                                                    <span className="text-sm font-semibold text-orange-700">Ongoing</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-orange-700">{safeStats.ongoingProjects}</span>
                                                    <span className="text-xs text-slate-500">
                                                        ({safeStats.totalProjects > 0 ? Math.round((safeStats.ongoingProjects / safeStats.totalProjects) * 100) : 0}%)
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="w-full bg-orange-100 rounded-full h-6 relative overflow-hidden border border-orange-200">
                                                <div
                                                    className="bg-green-600 h-full rounded-full transition-all duration-700 ease-out shadow-lg border border-green-400"
                                                    style={{
                                                        width: `${Math.max(2, safeStats.totalProjects > 0 ? (safeStats.ongoingProjects / safeStats.totalProjects) * 100 : 2)}%`,
                                                    }}
                                                >
                                                </div>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="text-black text-xs font-bold">
                                                        {safeStats.totalProjects > 0 ? Math.round((safeStats.ongoingProjects / safeStats.totalProjects) * 100) : 0}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Pending Bar */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <ExclamationCircleIcon className="w-4 h-4 text-red-600" />
                                                    <span className="text-sm font-semibold text-red-700">Pending</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-red-700">{safeStats.pendingProjects}</span>
                                                    <span className="text-xs text-slate-500">
                                                        ({safeStats.totalProjects > 0 ? Math.round((safeStats.pendingProjects / safeStats.totalProjects) * 100) : 0}%)
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="w-full bg-red-100 rounded-full h-6 relative overflow-hidden border border-red-200">
                                                <div
                                                    className="bg-orange-600 h-full rounded-full transition-all duration-700 ease-out shadow-lg border border-orange-400"
                                                    style={{
                                                        width: `${Math.max(2, safeStats.totalProjects > 0 ? (safeStats.pendingProjects / safeStats.totalProjects) * 100 : 2)}%`,
                                                    }}
                                                >
                                                </div>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="text-black text-xs font-bold">
                                                        {safeStats.totalProjects > 0 ? Math.round((safeStats.pendingProjects / safeStats.totalProjects) * 100) : 0}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
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