import React from "react";

const DPWHLoading = ({
  message = "Processing...",
  subMessage = "Please wait while we process your request",
}) => {
  return (
    <>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      {/* Overlay */}
      <div className="fixed inset-0 z-[20000] flex items-center justify-center bg-black/30 backdrop-blur-md">
        
        {/* Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl px-8 py-6 flex flex-col items-center gap-4 shadow-xl animate-fadeIn">
          
          {/* Logo + Circular Loader */}
          <div className="relative w-24 h-24 flex items-center justify-center">
            
            {/* Subtle base ring */}
            <div className="absolute inset-0 rounded-full border-[2px] border-gray-200/40"></div>

            {/* Animated top stroke */}
            <div className="absolute inset-0 rounded-full border-[2px] border-transparent border-t-[#EB3505] animate-spin"></div>

            {/* Logo */}
            <img
              src="/images/DPWH Logo  - 17 Gears.png"
              alt="DPWH Logo"
              className="w-16 h-16 object-contain"
            />
          </div>

          {/* Text */}
          <div className="text-center max-w-xs">
            <h3 className="text-lg font-semibold text-gray-900 tracking-tight">
              {message}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {subMessage}
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .animate-spin {
          animation: spin 1.5s linear infinite;
        }
        .animate-fadeIn {
          animation: fadeIn 0.35s ease-out;
        }
      `}</style>
    </>
  );
};

export default DPWHLoading;