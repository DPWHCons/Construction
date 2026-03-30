import { Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import UserGuide from '@/Components/UserGuide';

export default function GuestLayout({ children }) {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [logoLoaded, setLogoLoaded] = useState(false);

    useEffect(() => {
        // Preload background image
        const bgImg = new Image();
        bgImg.src = '/images/bldg.png';
        bgImg.onload = () => setImageLoaded(true);

        // Preload logo
        const logoImg = new Image();
        logoImg.src = '/images/DPWH Logo  - 17 Gears.png';
        logoImg.onload = () => setLogoLoaded(true);
    }, []);

    return (
        <div className="h-screen w-screen overflow-hidden relative bg-neutral-100">
            
            {/* Fallback gradient background (instant display) */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-200 via-gray-300 to-slate-400" />

            {/* Background image with fade-in effect */}
            <div 
                className={`absolute inset-0 bg-cover bg-center transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                style={{
                    backgroundImage: 'url(/images/bldg.png)',
                    filter: 'blur(6px) brightness(0.85)',
                    transform: 'scale(1.02)',
                    backgroundAttachment: 'fixed',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'cover'
                }}
            />

            {/* Soft overlay */}
            <div className="absolute inset-0 bg-black/20" />

            {/* Centered Content */}
            <div className="relative z-10 flex items-center justify-center h-full px-4">
                
                <div className="w-full max-w-md">
                    
                    {/* Card */}
                    <div className="bg-white/85 backdrop-blur-xl border border-black/5 rounded-2xl shadow-xl">
                        
                        {/* Header */}
                        <div className="text-center pt-4 pb-4 px-6"> {/* reduced top/bottom padding */}
                            {/* Logo with fade-in effect */}
                            <div className="relative w-20 h-20 mx-auto mb-2">
                                {/* Logo placeholder/fallback */}
                                <div className={`absolute inset-0 bg-blue-900 rounded-full flex items-center justify-center transition-opacity duration-500 ${logoLoaded ? 'opacity-0' : 'opacity-100'}`}>
                                    <span className="text-white text-2xl font-bold"></span>
                                </div>
                                
                                {/* Actual logo image */}
                                <img 
                                    src="/images/DPWH Logo  - 17 Gears.png" 
                                    alt="DPWH Logo"
                                    className={`w-20 h-20 mx-auto transition-opacity duration-500 ${logoLoaded ? 'opacity-100' : 'opacity-0'}`}
                                />
                            </div>

                            <h1 className="text-sm font-semibold text-[#010066] leading-snug">
                                DEPARTMENT OF PUBLIC WORKS AND HIGHWAYS
                            </h1>

                            <p className="text-xs mt-1 text-[#EB3505] font-medium">
                                Project Management System
                            </p>
                        </div>

                        {/* Content */}
                        <div className="px-6 pb-8"> {/* tighter padding */}
                            {children}

                            {/* Footer */}
                            <div className="mt-6 pt-4 border-t border-neutral-200 text-center">
                                <p className="text-xs text-neutral-400">
                                    © Design and Developed by{' '}
                                    <a 
                                        href="https://www.facebook.com/profile.php?id=61579438695370" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-500 hover:text-blue-600 transition-colors"
                                    >
                                        Nexio Devs
                                    </a>
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
            
            {/* User Guide */}
            <UserGuide />
        </div>
    );
}