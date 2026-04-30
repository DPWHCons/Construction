import React, { useState, useEffect } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';

export default function SecurityPage() {
    const { securityAuthenticated } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({
        password: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    // Redirect if already authenticated (via cookie/session)
    useEffect(() => {
        if (securityAuthenticated) {
            window.location.replace(route('landing'));
        }
    }, [securityAuthenticated]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('security.verify'));
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <>
            <Head title="Security Check">
                <link rel="icon" type="image/png" href="/images/DPWH_logo.png" />
            </Head>
            <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-white">
                {/* Animation styles */}
                <style>{`
                    @keyframes pulse {
                        0%, 100% { opacity: 0.3; }
                        50% { opacity: 0.6; }
                    }
                    @keyframes traceFlow {
                        0% { stroke-dashoffset: 100; }
                        100% { stroke-dashoffset: 0; }
                    }
                `}</style>
                
                {/* Circuit board trace pattern */}
                <svg className="absolute w-full h-full" style={{ opacity: 0.08, zIndex: 0 }}>
                    <defs>
                        <pattern id="circuit" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                            {/* Vertical traces */}
                            <path d="M20 0 v40 M20 60 v40" stroke="#010066" strokeWidth="1" fill="none"/>
                            <path d="M50 0 v25 M50 40 v60" stroke="#010066" strokeWidth="1" fill="none"/>
                            <path d="M80 0 v15 M80 35 v65" stroke="#010066" strokeWidth="1" fill="none"/>
                            {/* Horizontal traces */}
                            <path d="M20 40 h30 M50 40 h30" stroke="#010066" strokeWidth="1" fill="none"/>
                            <path d="M0 60 h20 M80 60 h20" stroke="#010066" strokeWidth="1" fill="none"/>
                            <path d="M50 25 h30" stroke="#010066" strokeWidth="1" fill="none"/>
                            {/* Connection nodes */}
                            <circle cx="20" cy="40" r="3" fill="#00d4ff"/>
                            <circle cx="50" cy="40" r="3" fill="#00d4ff"/>
                            <circle cx="50" cy="25" r="2.5" fill="#010066"/>
                            <circle cx="80" cy="60" r="3" fill="#00d4ff"/>
                            <circle cx="20" cy="60" r="2.5" fill="#010066"/>
                            {/* Corner connections */}
                            <path d="M80 15 h10" stroke="#010066" strokeWidth="0.5" fill="none"/>
                            <path d="M20 60 v0" stroke="#00d4ff" strokeWidth="2" fill="none"/>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#circuit)"/>
                </svg>
                
                {/* Animated circuit data flow overlay */}
                <svg className="absolute w-full h-full pointer-events-none" style={{ opacity: 0.15, zIndex: 1 }}>
                    <defs>
                        <linearGradient id="traceGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="transparent"/>
                            <stop offset="50%" stopColor="#00d4ff"/>
                            <stop offset="100%" stopColor="transparent"/>
                        </linearGradient>
                    </defs>
                    {/* Animated horizontal traces */}
                    <line x1="0" y1="20%" x2="100%" y2="20%" stroke="url(#traceGradient)" strokeWidth="1" 
                          style={{ strokeDasharray: '50 150', animation: 'traceFlow 3s linear infinite' }}/>
                    <line x1="0" y1="35%" x2="100%" y2="35%" stroke="url(#traceGradient)" strokeWidth="1" 
                          style={{ strokeDasharray: '30 120', animation: 'traceFlow 4s linear infinite reverse' }}/>
                    <line x1="0" y1="55%" x2="100%" y2="55%" stroke="url(#traceGradient)" strokeWidth="1" 
                          style={{ strokeDasharray: '40 100', animation: 'traceFlow 3.5s linear infinite 1s' }}/>
                    <line x1="0" y1="75%" x2="100%" y2="75%" stroke="url(#traceGradient)" strokeWidth="1" 
                          style={{ strokeDasharray: '25 150', animation: 'traceFlow 2.5s linear infinite 0.5s' }}/>
                    {/* Animated vertical traces */}
                    <line x1="15%" y1="0" x2="15%" y2="100%" stroke="url(#traceGradient)" strokeWidth="1" 
                          style={{ strokeDasharray: '40 160', animation: 'traceFlow 5s linear infinite' }}/>
                    <line x1="50%" y1="0" x2="50%" y2="100%" stroke="url(#traceGradient)" strokeWidth="1" 
                          style={{ strokeDasharray: '35 140', animation: 'traceFlow 4.5s linear infinite 2s' }}/>
                    <line x1="85%" y1="0" x2="85%" y2="100%" stroke="url(#traceGradient)" strokeWidth="1" 
                          style={{ strokeDasharray: '45 130', animation: 'traceFlow 6s linear infinite 1.5s' }}/>
                </svg>
                
                {/* Animated circuit nodes */}
                <div className="absolute w-full h-full" style={{ zIndex: 1 }}>
                    <div className="absolute w-2 h-2 rounded-full bg-[#00d4ff]" style={{ top: '15%', left: '10%', opacity: 0.4, animation: 'pulse 2s ease-in-out infinite' }}></div>
                    <div className="absolute w-1.5 h-1.5 rounded-full bg-[#010066]" style={{ top: '25%', left: '85%', opacity: 0.5, animation: 'pulse 3s ease-in-out infinite 0.5s' }}></div>
                    <div className="absolute w-2 h-2 rounded-full bg-[#00d4ff]" style={{ top: '70%', left: '15%', opacity: 0.3, animation: 'pulse 2.5s ease-in-out infinite 1s' }}></div>
                    <div className="absolute w-1.5 h-1.5 rounded-full bg-[#010066]" style={{ top: '80%', left: '75%', opacity: 0.4, animation: 'pulse 2s ease-in-out infinite 1.5s' }}></div>
                    <div className="absolute w-1 h-1 rounded-full bg-[#eb3505]" style={{ top: '35%', left: '60%', opacity: 0.3, animation: 'pulse 3s ease-in-out infinite' }}></div>
                    <div className="absolute w-1.5 h-1.5 rounded-full bg-[#00d4ff]" style={{ top: '55%', left: '25%', opacity: 0.35, animation: 'pulse 2.5s ease-in-out infinite 0.8s' }}></div>
                    <div className="absolute w-2 h-2 rounded-full bg-[#010066]" style={{ top: '90%', left: '50%', opacity: 0.3, animation: 'pulse 3.5s ease-in-out infinite 0.3s' }}></div>
                    <div className="absolute w-1.5 h-1.5 rounded-full bg-[#00d4ff]" style={{ top: '5%', left: '70%', opacity: 0.4, animation: 'pulse 2s ease-in-out infinite 1.2s' }}></div>
                </div>
                
                {/* Main diagonal blue stripe - positioned from corner to corner */}
                <div 
                    className="absolute bg-[#010066]"
                    style={{ 
                        width: '150vw',
                        height: '200px',
                        transform: 'rotate(-30deg)',
                        top: '40%',
                        left: '-25vw'
                    }}
                ></div>
                {/* Thin white accent line */}
                <div 
                    className="absolute bg-white/40"
                    style={{ 
                        width: '150vw',
                        height: '3px',
                        transform: 'rotate(-30deg)',
                        top: 'calc(40% + 110px)',
                        left: '-25vw'
                    }}
                ></div>

                {/* Main card */}
                <div className="relative z-10 w-full max-w-xl mx-auto px-4 sm:px-6">
                    <div className="relative">
                    {/* Card layer (bottom) */}
                    <div className="relative bg-white rounded-lg border-2 border-[#eb3505] p-6 sm:p-8 md:p-10 flex items-center justify-center" style={{ 
                        minHeight: '350px',
                        zIndex: 1
                    }}>
                    {/* Logo layer (middle) */}
                    <div 
                        style={{ 
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundImage: 'url(/images/DPWH_logo.png)',
                            backgroundSize: 'auto 40%',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                            backgroundColor: 'transparent',
                            opacity: 0.15,
                            zIndex: 2,
                            pointerEvents: 'none'
                        }}
                    ></div>
                    
                    {/* Form layer (top) */}
                    <div className="relative flex flex-col items-center justify-center text-center w-full" style={{ zIndex: 3 }}>
                        
                        {/* Security Loading Overlay */}
                        {processing && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm z-50 rounded-lg">
                                <style>{`
                                    @keyframes scan {
                                        0% { transform: translateY(-20px); opacity: 0; }
                                        50% { opacity: 1; }
                                        100% { transform: translateY(20px); opacity: 0; }
                                    }
                                    @keyframes shieldPulse {
                                        0%, 100% { transform: scale(1); filter: drop-shadow(0 0 5px rgba(0, 212, 255, 0.5)); }
                                        50% { transform: scale(1.05); filter: drop-shadow(0 0 15px rgba(0, 212, 255, 0.8)); }
                                    }
                                    @keyframes circuitRotate {
                                        0% { transform: rotate(0deg); }
                                        100% { transform: rotate(360deg); }
                                    }
                                `}</style>
                                
                                {/* Shield with scanning effect */}
                                <div className="relative mb-4">
                                    {/* Outer circuit ring */}
                                    <svg className="w-20 h-20" style={{ animation: 'circuitRotate 8s linear infinite' }}>
                                        <circle cx="40" cy="40" r="35" stroke="#010066" strokeWidth="1" fill="none" strokeDasharray="10 5" opacity="0.3"/>
                                        <circle cx="40" cy="40" r="30" stroke="#00d4ff" strokeWidth="1" fill="none" strokeDasharray="5 10" opacity="0.5"/>
                                    </svg>
                                    
                                    {/* Shield icon */}
                                    <div className="absolute inset-0 flex items-center justify-center" style={{ animation: 'shieldPulse 2s ease-in-out infinite' }}>
                                        <svg className="w-10 h-10 text-[#010066]" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                                        </svg>
                                    </div>
                                    
                                    {/* Scanning line */}
                                    <div 
                                        className="absolute left-1/2 -translate-x-1/2 w-12 h-0.5 bg-gradient-to-r from-transparent via-[#00d4ff] to-transparent"
                                        style={{ animation: 'scan 1.5s ease-in-out infinite' }}
                                    ></div>
                                </div>
                                
                                <p className="text-[#010066] font-semibold text-sm uppercase tracking-wider">
                                    Verifying Access...
                                </p>
                                <p className="text-gray-500 text-xs mt-1">
                                    Please wait while we authenticate
                                </p>
                            </div>
                        )}
                        
                        {/* Title with Lock Icon */}
                        <div className="flex items-center justify-center gap-2 mb-3">
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 uppercase tracking-wider">
                                Security Verification
                            </h1>
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>

                        {/* Security notice */}
                        <div className="flex items-center justify-center gap-1.5 mb-4 px-3 py-2 bg-[#010066]/5 rounded-md">
                            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-[#010066]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            <p className="text-xs sm:text-sm text-[#010066] font-medium">
                                Protected Area - Authorized Personnel Only
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4 px-2 sm:px-4 md:px-8 w-full max-w-xs sm:max-w-sm">
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="w-full px-3 py-2 sm:px-4 sm:py-3 pr-10 border border-gray-300 rounded-md text-gray-900 text-sm focus:outline-none focus:border-[#010066] transition-colors bg-white"
                                    placeholder="Enter security code"
                                    autoComplete="off"
                                    required
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    className="absolute top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 focus:outline-none"
                                    style={{ right: '6px' }}
                                >
                                    {showPassword ? (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    )}
                                </button>
                            </div>

                            {/* Error message */}
                            {errors.password && (
                                <p className="text-sm text-red-600">{errors.password}</p>
                            )}

                            {/* Submit button - Simple arrow style */}
                            <div className="flex justify-center">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex items-center justify-center w-24 h-10 rounded-full bg-[#010066] hover:bg-[#010088] text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processing ? (
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                            <span className="ml-1 text-xs font-medium">Enter</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                    
                    {/* Footer note - At the bottom edge of the card */}
                    <div className="absolute bottom-0 left-0 right-0 pt-3 pb-3 sm:pt-4 sm:pb-4 text-center">
                        <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-widest font-medium">
                            Department of Public Works and Highways
                        </p>
                    </div>
                    </div>
                    </div>
                </div>
            </div>
        </>
    );
}
