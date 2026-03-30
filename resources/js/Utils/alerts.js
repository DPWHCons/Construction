import Swal from 'sweetalert2';
import toast from 'react-hot-toast';

// Add CSS animations for modern toast
const style = document.createElement('style');
style.textContent = `
    @keyframes slide-in-right {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slide-out-right {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }

    @keyframes fade-in-scale {
        from {
            transform: scale(0.95);
            opacity: 0;
        }
        to {
            transform: scale(1);
            opacity: 1;
        }
    }

    @keyframes fade-out-scale {
        from {
            transform: scale(1);
            opacity: 1;
        }
        to {
            transform: scale(0.95);
            opacity: 0;
        }
    }
    
    .animate-fade-in-scale {
        animation: fade-in-scale 0.25s ease-out !important;
    }

    .animate-fade-out-scale {
        animation: fade-out-scale 0.2s ease-in !important;
    }
`;
document.head.appendChild(style);

// Modern, minimal design defaults
const appleSwal = Swal.mixin({
    buttonsStyling: false,
    heightAuto: false,
    focusConfirm: false,
    allowOutsideClick: false,
    backdrop: 'rgba(15, 23, 42, 0.4)',
    showClass: {
        popup: 'animate-fade-in-scale',
        backdrop: 'swal2-backdrop-show',
    },
    hideClass: {
        popup: 'animate-fade-out-scale',
        backdrop: 'swal2-backdrop-hide',
    },
    customClass: {
        popup: 'rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.18)] border border-slate-100 bg-white',
        title: 'text-base font-semibold text-slate-900 tracking-tight font-sans',
        htmlContainer: 'text-sm text-slate-600 text-center font-sans mt-2',
        actions: 'gap-3 mt-6',
        confirmButton:
            'inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-black transition-all duration-150 active:scale-95',
        cancelButton:
            'inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all duration-150 active:scale-95',
        denyButton:
            'inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all duration-150 active:scale-95',
        input:
            'mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900',
    },
});

const AUTO_DISMISS_MS = 2000;

// Toast notifications
export const showSuccessToast = (message) => {
    toast.success(message, {
        duration: 4000,
        position: 'top-right',
        style: {
            background: '#ffffff',
            color: '#000000',
            border: '1px solid #e5e7eb',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            borderRadius: '0.75rem',
        },
        iconTheme: {
            primary: '#10b981',
            secondary: '#ffffff',
        },
    });
};

export const showErrorToast = (message) => {
    toast.error(message, {
        duration: 5000,
        position: 'top-right',
        style: {
            background: '#ffffff',
            color: '#000000',
            border: '1px solid #e5e7eb',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            borderRadius: '0.75rem',
        },
        iconTheme: {
            primary: '#ef4444',
            secondary: '#ffffff',
        },
    });
};

export const showInfoToast = (message) => {
    toast(message, {
        duration: 4000,
        position: 'top-right',
        icon: 'ℹ️',
        style: {
            background: '#ffffff',
            color: '#000000',
            border: '1px solid #e5e7eb',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            borderRadius: '0.75rem',
        },
        iconTheme: {
            primary: '#3b82f6',
            secondary: '#ffffff',
        },
    });
};

// SweetAlert confirmations - MODERNIZED & MINIMAL
export const showDeleteConfirmation = (itemName, itemType = 'item') => {
    return appleSwal.fire({
        title: `Delete ${itemType}?`,
        html: `Delete <strong>"${itemName}"</strong>? This cannot be undone.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        reverseButtons: true,
        customClass: {
            confirmButton:
                'inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-xs font-semibold bg-red-600 text-white hover:bg-red-700 transition-all duration-150 active:scale-95',
        },
    });
};

export const showProjectArchiveConfirmation = (projectName) => {
    return appleSwal.fire({
        title: 'Archive project?',
        html: `
            <div class="space-y-4">
                <p class="text-sm text-slate-600">
                    Move <strong class="text-slate-900">"${projectName}"</strong> to archive?
                </p>
                <div class="flex items-center justify-center gap-2 pt-2">
                    <div class="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                        <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                    </div>
                    <p class="text-xs text-slate-500">Can be restored anytime</p>
                </div>
            </div>
        `,
        icon: false,
        showCancelButton: true,
        confirmButtonText: 'Proceed',
        cancelButtonText: 'Cancel',
        reverseButtons: true,
        customClass: {
            popup: 'rounded-2xl',
            actions: 'gap-3 !justify-between',
            confirmButton:
                'inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-xs font-semibold bg-orange-500 text-white hover:bg-orange-600 transition-all duration-150 active:scale-95',
            cancelButton: 'inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-xs font-semibold bg-slate-200 text-slate-700 hover:bg-slate-300 transition-all duration-150 active:scale-95',
        },
    });
};

export const showArchiveConfirmation = (itemName, projectCount = 0) => {
    const warningText = projectCount > 0 
        ? `<br><span class="text-xs text-slate-500 mt-1 block">Has ${projectCount} project${projectCount > 1 ? 's' : ''} — they'll become uncategorized.</span>`
        : '';

    return appleSwal.fire({
        title: 'Archive category?',
        html: `Archive <strong>"${itemName}"</strong>?${warningText}`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Archive',
        cancelButtonText: 'Cancel',
        reverseButtons: true,
        customClass: {
            confirmButton:
                'inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-xs font-semibold bg-orange-500 text-white hover:bg-orange-600 transition-all duration-150 active:scale-95',
        },
    });
};

export const showRestoreConfirmation = (itemName) => {
    return appleSwal.fire({
        title: 'Restore?',
        html: `Restore <strong>"${itemName}"</strong>?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Restore',
        cancelButtonText: 'Cancel',
        reverseButtons: true,
        customClass: {
            confirmButton:
                'inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-all duration-150 active:scale-95',
        },
    });
};

export const showEditConfirmation = (itemName, itemType = 'item') => {
    return appleSwal.fire({
        title: `Edit ${itemType}?`,
        html: `Edit <strong>"${itemName}"</strong>?`,
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Continue',
        cancelButtonText: 'Cancel',
        reverseButtons: true,
        customClass: {
            confirmButton:
                'inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-all duration-150 active:scale-95',
        },
    });
};

// Modern, compact import confirmation
export const showImportConfirmation = (imported, failed = 0) => {
    const isSuccess = failed === 0;

    return Swal.fire({
        toast: true,
        position: 'top-end',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
        showCancelButton: false,
        showClass: {
            popup: 'animate-slide-in-right',
        },
        hideClass: {
            popup: 'animate-slide-out-right',
        },
        customClass: {
            popup: 'rounded-lg shadow-lg border border-slate-100 bg-white p-4 min-w-[280px]',
            title: `text-sm font-semibold ${isSuccess ? 'text-emerald-700' : 'text-red-700'}`,
            htmlContainer: 'text-xs text-slate-600 mt-1',
        },
        icon: isSuccess ? 'success' : 'error',
        title: isSuccess ? 'Import successful' : 'Import failed',
        html: `${imported} project${imported !== 1 ? 's' : ''} imported${!isSuccess ? `, ${failed} failed` : ''}`,
    });
};

// Generic success message
export const showSuccessMessage = (title, message) => {
    return appleSwal.fire({
        title: title,
        text: message,
        icon: 'success',
        timer: AUTO_DISMISS_MS,
        timerProgressBar: true,
        showConfirmButton: false,
    });
};

// Generic error message
export const showErrorMessage = (title, message) => {
    return appleSwal.fire({
        title: title,
        text: message,
        icon: 'error',
        timer: AUTO_DISMISS_MS,
        timerProgressBar: true,
        showConfirmButton: false,
    });
};
