import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import SessionTimeoutWarning from '../Components/SessionTimeoutWarning';
import UserGuide from '../Components/UserGuide';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const pageVariants = {
    initial: {
        opacity: 0,
        x: -20,
    },
    in: {
        opacity: 1,
        x: 0,
    },
    out: {
        opacity: 0,
        x: 20,
    },
};

const pageTransition = {
    type: 'tween',
    ease: 'easeInOut',
    duration: 0.3,
};

export default function PageLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const url = usePage().props.url || '';
    
    // Sidebar width configurations
    const sidebarWidths = {
        expanded: 'w-72', // 288px - wider for better content display
        collapsed: 'w-20', // 80px - icon only
    };
    
    // Corresponding margin values for main content
    const contentMargins = {
        expanded: 'lg:ml-72', // Match sidebar expanded width
        collapsed: 'lg:ml-20', // Match sidebar collapsed width
    };
    
    // Initialize sidebar state from localStorage
    const [sidebarOpen, setSidebarOpen] = useState(() => {
        const saved = localStorage.getItem('sidebarOpen');
        return saved !== null ? JSON.parse(saved) : false;
    });
    
    // Save sidebar state to localStorage whenever it changes
    const handleSidebarToggle = () => {
        const newState = !sidebarOpen;
        setSidebarOpen(newState);
        localStorage.setItem('sidebarOpen', JSON.stringify(newState));
    };
    
    const [expandedMenus, setExpandedMenus] = useState({});
    const [showUserMenu, setShowUserMenu] = useState(false);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
            {/* Main Content Area */}
            <div className="flex pt-4">
                {/* Modern White Sidebar */}
                <aside className={`${sidebarOpen ? sidebarWidths.expanded : sidebarWidths.collapsed} bg-white transition-all duration-500 ease-in-out fixed left-0 top-0 bottom-0 z-40 shadow-lg border-r border-gray-200`}>
                    {/* Sidebar Header */}
                    <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                            {/* DPWH Logo */}
                            <div className={`flex items-center ${sidebarOpen ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
                                <img 
                                    src="/images/DPWH Logo  - 17 Gears.png" 
                                    alt="DPWH Logo" 
                                    className="h-10 w-auto object-contain"
                                />
                            </div>
                            
                            {/* Burger Menu Button */}
                            <button
                                onClick={handleSidebarToggle}
                                className="flex items-center text-gray-500 hover:text-gray-800 transition-all duration-300 group"
                            >
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gray-100 rounded-lg blur-sm opacity-0 group-hover:opacity-40 transition-opacity duration-300"></div>
                                    <svg className="relative w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Sidebar Navigation */}
                    <nav className="flex-1 px-6 py-6 space-y-2 overflow-y-auto">
                        {/* Dashboard */}
                        <div>
                            <Link
                                href={route('dashboard')}
                                className={`group flex items-center ${sidebarOpen ? 'px-4' : 'justify-center'} py-3 text-sm font-medium rounded-xl transition-all duration-300 relative overflow-hidden ${
                                    route().current('dashboard')
                                        ? 'bg-[#010066] text-white shadow-md transform scale-105'
                                        : 'text-gray-600 hover:bg-[#1a1a8c] hover:text-white hover:shadow-md hover:transform hover:scale-105'
                                }`}
                            >
                                <svg className={`relative w-4 h-4 ${sidebarOpen ? 'mr-3' : ''} transition-all duration-300`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001 1v-4a1 1 0 011 1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                {sidebarOpen && (
                                    <span className="relative font-medium">Dashboard</span>
                                )}
                            </Link>
                        </div>

                        {/* Projects Menu */}
                        <Link
                            href={route('projects.index')}
                            className={`group flex items-center ${sidebarOpen ? 'px-3' : 'justify-center'} py-2.5 text-sm font-medium rounded-xl transition-all duration-300 relative overflow-hidden ${
                                route().current('projects.*')
                                    ? 'bg-[#010066] text-white shadow-md transform scale-105'
                                        : 'text-gray-600 hover:bg-[#1a1a8c] hover:text-white hover:shadow-md hover:transform hover:scale-105'
                            }`}
                        >
                            <svg className={`relative w-4 h-4 ${sidebarOpen ? 'mr-3' : ''} transition-all duration-300`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                            {sidebarOpen && (
                                <span className="relative font-medium flex-1 text-left">Manage Project</span>
                            )}
                        </Link>

                        {/* Gallery Menu */}
                        <Link
                            href={route('gallery.index')}
                            className={`group flex items-center ${sidebarOpen ? 'px-3' : 'justify-center'} py-2.5 text-sm font-medium rounded-xl transition-all duration-300 relative overflow-hidden ${
                                route().current('gallery.*')
                                    ? 'bg-[#010066] text-white shadow-md transform scale-105'
                                    : 'text-gray-600 hover:bg-[#1a1a8c] hover:text-white hover:shadow-md hover:transform hover:scale-105'
                            }`}
                        >
                            <svg className={`relative w-4 h-4 ${sidebarOpen ? 'mr-3' : ''} transition-all duration-300`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {sidebarOpen && (
                                <span className="relative font-medium flex-1 text-left">Gallery</span>
                            )}
                        </Link>

                        {/* Categories Menu */}
                        <Link
                            href={route('categories.index')}
                            className={`group flex items-center ${sidebarOpen ? 'px-3' : 'justify-center'} py-2.5 text-sm font-medium rounded-xl transition-all duration-300 relative overflow-hidden ${
                                route().current('categories.*')
                                    ? 'bg-[#010066] text-white shadow-md transform scale-105'
                                    : 'text-gray-600 hover:bg-[#1a1a8c] hover:text-white hover:shadow-md hover:transform hover:scale-105'
                            }`}
                        >
                            <svg className={`relative w-4 h-4 ${sidebarOpen ? 'mr-3' : ''} transition-all duration-300`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                            </svg>
                            {sidebarOpen && (
                                <span className="relative font-medium flex-1 text-left">Categories</span>
                            )}
                        </Link>

                        {/* Contractors Menu */}
                        <Link
                            href={route('contractors.index')}
                            className={`group flex items-center ${sidebarOpen ? 'px-3' : 'justify-center'} py-2.5 text-sm font-medium rounded-xl transition-all duration-300 relative overflow-hidden ${
                                route().current('contractors.*')
                                    ? 'bg-[#010066] text-white shadow-md transform scale-105'
                                    : 'text-gray-600 hover:bg-[#1a1a8c] hover:text-white hover:shadow-md hover:transform hover:scale-105'
                            }`}
                        >
                            <svg className={`relative w-4 h-4 ${sidebarOpen ? 'mr-3' : ''} transition-all duration-300`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            {sidebarOpen && (
                                <span className="relative font-medium">Contractors</span>
                            )}
                        </Link>

                          {/* Archive Menu */}
                        <Link
                            href={route('archive.index')}
                            className={`group flex items-center ${sidebarOpen ? 'px-3' : 'justify-center'} py-2.5 text-sm font-medium rounded-xl transition-all duration-300 relative overflow-hidden ${
                                route().current('archive.*')
                                    ? 'bg-[#010066] text-white shadow-md transform scale-105'
                                    : 'text-gray-600 hover:bg-[#1a1a8c] hover:text-white hover:shadow-md hover:transform hover:scale-105'
                            }`}
                        >
                            <svg className={`relative w-4 h-4 ${sidebarOpen ? 'mr-3' : ''} transition-all duration-300`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                            </svg>
                            {sidebarOpen && (
                                <span className="relative font-medium flex-1 text-left">Archive</span>
                            )}
                        </Link>
                    </nav>

                    {/* Sidebar Footer */}
                    <div className="px-3 pb-4 mt-auto">
                        {/* Space for future footer items */}
                    </div>
                    
                    {/* Absolute Bottom Logout */}
                    <div className="px-3 pb-6 absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200">
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className={`w-full group flex items-center ${sidebarOpen ? 'px-4' : 'justify-center'} py-3 text-sm font-medium rounded-xl transition-all duration-300 relative overflow-hidden text-gray-600 hover:bg-[#1a1a8c] hover:text-white hover:shadow-md hover:transform hover:scale-105 mt-3`}
                        >
                            <svg className={`relative w-4 h-4 ${sidebarOpen ? 'mr-3' : ''} transition-all duration-300`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            {sidebarOpen && (
                                <span className="relative font-medium">LOGOUT</span>
                            )}
                        </Link>
                    </div>
                </aside>

                {/* Main Content */}
                <main className={`flex-1 transition-all duration-500 ease-in-out ${sidebarOpen ? contentMargins.expanded : contentMargins.collapsed} overflow-y-auto`}>
                    {header && (
                        <div className="bg-white/60 backdrop-blur-sm border-b border-white/20 shadow-sm">
                            <div className="mx-auto max-w-7xl px-6 lg:px-8 py-4">
                                {header}
                            </div>
                        </div>
                    )}
                    <div className="p-6">
                        <div className="px-6 lg:px-8">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={url}
                                    initial="initial"
                                    animate="in"
                                    exit="out"
                                    variants={pageVariants}
                                    transition={pageTransition}
                                    style={{ width: '100%' }}
                                >
                                    {children}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </main>
            </div>
            
            {/* Session Timeout Warning */}
            <SessionTimeoutWarning />
            
            {/* Toast Notifications */}
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                    },
                    success: {
                        duration: 4000,
                        iconTheme: {
                            primary: '#fff',
                            secondary: '#10b981',
                        },
                    },
                    error: {
                        duration: 5000,
                        iconTheme: {
                            primary: '#fff',
                            secondary: '#ef4444',
                        },
                    },
                }}
            />
        </div>
    );
}
