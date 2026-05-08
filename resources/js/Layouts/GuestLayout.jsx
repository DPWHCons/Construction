import { Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import UserGuide from '@/Components/UserGuide';

export default function GuestLayout({ children }) {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [logoLoaded, setLogoLoaded] = useState(false);

    useEffect(() => {
        const bgImg = new Image();
        bgImg.src = '/images/bldg.png';
        bgImg.onload = () => setImageLoaded(true);

        const logoImg = new Image();
        logoImg.src = '/images/DPWH_logo.png';
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

            {/* Light blue overlay */}
            <div className="absolute inset-0 z-[15] bg-gradient-to-br from-blue-100/30 via-blue-200/20 to-blue-300/10" />

            {/* Centered Content */}
            <div className="relative z-20 flex items-center justify-center h-full px-4">
                
                <div className="w-full max-w-md">
                    
                    {/* Card */}
                    <div className="bg-white/90 backdrop-blur-xl border border-slate-200/50 rounded-2xl shadow-xl">

                        {/* Header */}
                        <div className="text-center pt-5 pb-3 px-6">
                            {/* Static Logo */}
                            <div className="relative w-14 h-14 mx-auto mb-2">
                                <img
                                    src="/images/DPWH_logo.png"
                                    alt="DPWH Logo"
                                    className={`w-14 h-14 mx-auto transition-opacity duration-500 ${logoLoaded ? 'opacity-100' : 'opacity-0'}`}
                                />
                            </div>

                            <h1 className="text-sm font-bold text-[#010066] leading-snug tracking-wide">
                                DEPARTMENT OF PUBLIC WORKS AND HIGHWAYS
                            </h1>

                            <p className="text-xs mt-0.5 text-[#EB3505] font-medium">
                                Project Management System
                            </p>
                        </div>

                        {/* Content */}
                        <div className="px-6 pb-5">
                            {children}

                            {/* Footer */}
                            <div className="mt-4 pt-3 border-t border-slate-100 text-center">
                                <p className="text-[10px] text-slate-400">
                                    © Developed by{' '}
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