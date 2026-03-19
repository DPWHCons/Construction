import React from 'react';
import { useSessionManager } from '../Utils/useSessionManager';

const SessionTimeoutWarning = () => {
    const { warningShown, timeRemaining, extendSession, formatTimeRemaining } = useSessionManager();

    if (!warningShown) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-4 transform transition-all">
                <div className="flex items-center mb-4">
                    <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-lg font-medium text-gray-900">Session Timeout Warning</h3>
                    </div>
                </div>

                <div className="mb-4">
                    <p className="text-sm text-gray-600">
                        Your session will expire in <span className="font-semibold text-red-600">{formatTimeRemaining(timeRemaining)}</span> due to inactivity.
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                        Click "Stay Logged In" to extend your session, or you will be automatically logged out.
                    </p>
                </div>

                <div className="flex space-x-3">
                    <button
                        onClick={extendSession}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
                    >
                        Stay Logged In
                    </button>
                    <button
                        onClick={() => window.location.href = '/logout'}
                        className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors font-medium"
                    >
                        Log Out Now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SessionTimeoutWarning;
