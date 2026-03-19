import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="h-screen w-screen overflow-hidden relative">
            {/* Building Background */}
            <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat w-full h-full"
                style={{
                    backgroundImage: 'url(/images/bldg.png)',
                    filter: 'blur(1.5px) grayscale(30%)',
                    transform: 'scale(1.02)'
                }}
            />
            
            {/* Light Blue Background Overlay */}
            <div className="absolute inset-0 bg-blue-200/85 w-full h-full"></div>

            {/* Centered Book-Style Login Form - Overlay */}
            <div className="absolute inset-0 flex items-center justify-center p-4">
                {/* Book-Style Login Container */}
                <div className="relative z-10 w-full max-w-5xl mx-4">
                    <div className="bg-white/95 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden max-h-[90vh] transform hover:scale-[1.01] transition-all duration-500">
                        <div className="flex h-full">
                            {/* Left Page - Book Cover */}
                            <div className="relative bg-gradient-to-br from-[#Eb3505] to-[#c02818] w-1/2 flex flex-col justify-center items-center text-white p-12">
                                {/* Page texture overlay */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50"></div>
                                
                                <div className="relative z-10 text-center">
                                    <div className="mb-8 transform hover:scale-105 transition-all duration-300">
                                        <div className="relative">
                                            <img 
                                                src="/images/DPWH Logo  - 17 Gears.png" 
                                                alt="DPWH Logo" 
                                                className="w-40 h-40 object-contain filter drop-shadow-2xl mx-auto"
                                            />
                                            {/* Logo glow effect */}
                                            <div className="absolute inset-0 bg-white/20 rounded-full blur-2xl transform scale-150 -z-10"></div>
                                        </div>
                                    </div>
                                    <h1 className="text-2xl font-bold tracking-tight text-white mb-4 leading-tight">Department of Public Works and Highways</h1>
                                    <p className="text-lg text-white/95 font-medium mb-2">Project Management System</p>
                                </div>

                            </div>

                            {/* Right Page - Form */}
                            <div className="relative bg-gradient-to-br from-white via-gray-50 to-gray-100 w-1/2">
                                {/* Page texture effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-30"></div>
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-100/20 to-transparent opacity-50"></div>
                                
                                <div className="relative p-12">
                                    <div className="relative z-10">
                                        {children}
                                        
                                        {/* Footer */}
                                        <div className="mt-8 pt-6 relative">
                                            <div className="text-center text-xs text-gray-600 font-medium">
                                                <p>Design and Developed by: Donn Aguilar</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Smooth blend transition */}
                                <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-transparent to-black/3"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
