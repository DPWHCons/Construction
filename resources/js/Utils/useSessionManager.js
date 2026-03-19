import { router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

export const useSessionManager = () => {
    const [warningShown, setWarningShown] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(null);
    const warningTimerRef = useRef(null);
    const logoutTimerRef = useRef(null);
    const activityTimersRef = useRef([]);
    const lastActivityRef = useRef(Date.now());
    
    // Session configuration (in milliseconds)
    const SESSION_TIMEOUT = 120 * 60 * 1000; // 2 hours (matches backend)
    const WARNING_TIME = 5 * 60 * 1000; // 5 minutes before timeout
    const ACTIVITY_EVENTS = [
        'mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'
    ];

    const resetTimers = () => {
        // Clear existing timers
        if (warningTimerRef.current) {
            clearTimeout(warningTimerRef.current);
        }
        if (logoutTimerRef.current) {
            clearTimeout(logoutTimerRef.current);
        }

        lastActivityRef.current = Date.now();
        setWarningShown(false);
        setTimeRemaining(null);

        // Set new timers
        warningTimerRef.current = setTimeout(() => {
            showWarning();
        }, SESSION_TIMEOUT - WARNING_TIME);

        logoutTimerRef.current = setTimeout(() => {
            logout();
        }, SESSION_TIMEOUT);
    };

    const showWarning = () => {
        setWarningShown(true);
        setTimeRemaining(WARNING_TIME);
        
        // Countdown timer
        const countdownInterval = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1000) {
                    clearInterval(countdownInterval);
                    return 0;
                }
                return prev - 1000;
            });
        }, 1000);

        // Auto-hide warning after 5 minutes
        setTimeout(() => {
            setWarningShown(false);
            clearInterval(countdownInterval);
        }, WARNING_TIME);
    };

    const logout = () => {
        router.post(route('logout'));
    };

    const handleActivity = () => {
        lastActivityRef.current = Date.now();
        if (!warningShown) {
            resetTimers();
        }
    };

    const handleBeforeUnload = (e) => {
        // When browser/tab is closing, invalidate session
        const sessionId = document.cookie.match(/(^|;) ?laravel_session=([^;]*)(;|$)/);
        if (sessionId) {
            // Send synchronous request to logout when closing
            navigator.sendBeacon('/logout');
        }
    };

    const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
            // User returned to tab - check if session is still valid
            const timeSinceLastActivity = Date.now() - lastActivityRef.current;
            if (timeSinceLastActivity >= SESSION_TIMEOUT) {
                logout();
            } else {
                resetTimers();
            }
        }
    };

    useEffect(() => {
        // Initialize session monitoring
        resetTimers();

        // Add activity listeners
        ACTIVITY_EVENTS.forEach(event => {
            document.addEventListener(event, handleActivity, true);
        });

        // Add browser/tab close listener
        window.addEventListener('beforeunload', handleBeforeUnload);
        
        // Add visibility change listener
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Cleanup
        return () => {
            if (warningTimerRef.current) {
                clearTimeout(warningTimerRef.current);
            }
            if (logoutTimerRef.current) {
                clearTimeout(logoutTimerRef.current);
            }
            
            ACTIVITY_EVENTS.forEach(event => {
                document.removeEventListener(event, handleActivity, true);
            });
            
            window.removeEventListener('beforeunload', handleBeforeUnload);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    const extendSession = () => {
        resetTimers();
        setWarningShown(false);
    };

    const formatTimeRemaining = (milliseconds) => {
        const minutes = Math.floor(milliseconds / 60000);
        const seconds = Math.floor((milliseconds % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return {
        warningShown,
        timeRemaining,
        extendSession,
        formatTimeRemaining,
        logout
    };
};
