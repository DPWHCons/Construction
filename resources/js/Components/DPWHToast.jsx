import React from "react";

const DPWHToast = ({
  show,
  onClose,
  type = "success",
  title,
  message,
  duration = 2000,
  showProgress = true,
}) => {
  React.useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show) return null;

  const config = {
    success: {
      accent: "bg-green-500",
      icon: "✓",
      defaultTitle: "Success",
      defaultMessage: "Completed successfully",
    },
    error: {
      accent: "bg-red-500",
      icon: "✕",
      defaultTitle: "Error",
      defaultMessage: "Something went wrong",
    },
    warning: {
      accent: "bg-yellow-500",
      icon: "!",
      defaultTitle: "Warning",
      defaultMessage: "Check your input",
    },
    info: {
      accent: "bg-blue-500",
      icon: "i",
      defaultTitle: "Info",
      defaultMessage: "For your information",
    },
  }[type];

  const toastTitle = title || config.defaultTitle;
  const toastMessage = message || config.defaultMessage;

  return (
    <>
      <style>{`
        @keyframes toastIn {
          from {
            opacity: 0;
            transform: translateY(-6px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes progress {
          from { width: 100%; }
          to { width: 0%; }
        }

        .toast-in {
          animation: toastIn 0.25s ease-out;
        }

        .progress {
          animation: progress ${duration}ms linear forwards;
        }
      `}</style>

      <div className="fixed top-4 right-4 z-[9999] w-full max-w-xs toast-in">
        <div className="relative bg-white/90 backdrop-blur-md border border-black/5 rounded-xl shadow-lg overflow-hidden">
          
          {/* Accent line */}
          <div className={`absolute left-0 top-0 bottom-0 w-1 ${config.accent}`} />

          <div className="flex items-start gap-3 p-4">
            
            {/* Icon */}
            <div className="text-sm font-semibold text-slate-600 mt-0.5">
              {config.icon}
            </div>

            {/* Content */}
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-800">
                {toastTitle}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {toastMessage}
              </p>
            </div>

            {/* Close */}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition"
            >
              ✕
            </button>
          </div>

          {/* Progress */}
          {showProgress && duration > 0 && (
            <div className="h-[2px] bg-black/5">
              <div className="h-full bg-black/20 progress" />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DPWHToast;