import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="h-screen w-screen overflow-hidden relative bg-neutral-100">
            
            {/* Background */}
            <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{
                    backgroundImage: 'url(/images/bldg.png)',
                    filter: 'blur(6px) brightness(0.85)',
                    transform: 'scale(1.02)'
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
                            <img 
                                src="/images/DPWH Logo  - 17 Gears.png" 
                                alt="DPWH Logo"
                                className="w-20 h-20 mx-auto mb-2" // bigger logo
                            />

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
                                    © Design and Developed by Donn Aguilar
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}