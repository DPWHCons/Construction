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
          from { opacity: 0; transform: translateY(6px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .spinner {
          animation: spin 1.4s linear infinite;
        }

        .fade-in {
          animation: fadeIn 0.35s ease-out;
        }
      `}</style>

      {/* Overlay */}
      <div className="fixed inset-0 z-[20000] flex items-center justify-center bg-black/40 backdrop-blur-sm">
        
        {/* Card */}
        <div className="bg-white rounded-2xl px-8 py-7 flex flex-col items-center gap-5 shadow-lg fade-in">
          
          {/* Logo + Circular Loader */}
          <div className="relative w-20 h-20 flex items-center justify-center">
            
            {/* Subtle base ring */}
            <div className="absolute inset-0 rounded-full border-[2px] border-gray-200"></div>

            {/* Animated top stroke */}
            <div className="absolute inset-0 rounded-full border-[2px] border-transparent border-t-[#Eb3505] spinner"></div>

            {/* Logo */}
            <img
              src="/images/DPWH Logo  - 17 Gears.png"
              alt="DPWH Logo"
              className="w-14 h-14 object-contain"
            />
          </div>

          {/* Text */}
          <div className="text-center">
            <h3 className="text-base font-medium text-slate-800 tracking-tight">
              {message}
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              {subMessage}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default DPWHLoading;