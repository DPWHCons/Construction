import Swal from 'sweetalert2';
import toast from 'react-hot-toast';

// SweetAlert2: modern, minimal, "Apple-like" defaults
const appleSwal = Swal.mixin({
    buttonsStyling: false,
    heightAuto: false,
    focusConfirm: false,
    backdrop: 'rgba(15, 23, 42, 0.55)',
    showClass: {
        popup: 'swal2-show',
        backdrop: 'swal2-backdrop-show',
    },
    hideClass: {
        popup: 'swal2-hide',
        backdrop: 'swal2-backdrop-hide',
    },
    customClass: {
        popup: 'rounded-2xl shadow-[0_30px_80px_rgba(0,0,0,0.22)] border border-black/5 bg-white/95 backdrop-blur-md',
        title: 'text-[17px] font-semibold text-slate-900 tracking-[-0.01em] font-sans',
        htmlContainer: 'text-[13px] leading-5 text-slate-600 text-left font-sans',
        actions: 'gap-2 mt-5',
        confirmButton:
            'inline-flex items-center justify-center px-4 py-2 rounded-xl text-[13px] font-semibold bg-slate-900 text-white hover:bg-black transition-colors',
        cancelButton:
            'inline-flex items-center justify-center px-4 py-2 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors',
        denyButton:
            'inline-flex items-center justify-center px-4 py-2 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors',
        input:
            'mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300',
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
            border: '1px solid #10b981',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
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
            border: '1px solid #ef4444',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
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
            border: '1px solid #3b82f6',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        },
        iconTheme: {
            primary: '#3b82f6',
            secondary: '#ffffff',
        },
    });
};

// SweetAlert confirmations
export const showDeleteConfirmation = (itemName, itemType = 'item') => {
    return appleSwal.fire({
        title: `Delete ${itemType}?`,
        html: `
            <div class="space-y-3">
                <p class="text-slate-700">
                    Are you sure you want to delete the ${itemType} 
                    <span class="font-semibold text-slate-900">"${itemName}"</span>?
                </p>
                <div class="rounded-xl border border-red-200/70 bg-red-50/70 p-3">
                    <div class="flex items-start gap-2">
                        <svg class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                        </svg>
                        <div>
                            <h4 class="text-red-900 font-semibold">This action can’t be undone.</h4>
                            <p class="text-red-800 text-sm">This will permanently delete the ${itemType} and its associated data.</p>
                        </div>
                    </div>
                </div>
            </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        reverseButtons: true,
        customClass: {
            ...appleSwal.options.customClass,
            confirmButton:
                'inline-flex items-center justify-center px-4 py-2 rounded-xl text-[13px] font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors',
        },
    });
};

export const showProjectArchiveConfirmation = (projectName) => {
    return appleSwal.fire({
        title: 'Archive Project?',
        text: `Are you sure to archive this project?\n\n"${projectName}"`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Archive',
        cancelButtonText: 'Cancel',
        reverseButtons: true,
        customClass: {
            popup: 'rounded-2xl shadow-[0_30px_80px_rgba(0,0,0,0.22)] border border-black/5 bg-white/95 backdrop-blur-md',
            title: 'text-[17px] font-semibold text-slate-900 tracking-[-0.01em] font-sans',
            htmlContainer: 'text-[13px] leading-5 text-slate-600 text-left font-sans',
            actions: 'gap-2 mt-5',
            confirmButton:
                'inline-flex items-center justify-center px-4 py-2 rounded-xl text-[13px] font-semibold bg-orange-500 text-white hover:bg-orange-600 transition-colors',
            cancelButton:
                'inline-flex items-center justify-center px-4 py-2 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors',
        },
    });
};

export const showArchiveConfirmation = (itemName, projectCount = 0) => {
    const hasProjects = projectCount > 0;
    
    return appleSwal.fire({
        title: 'Archive category?',
        html: `
            <div class="space-y-4">
                <p class="text-slate-700">
                    Archive <span class="font-semibold text-slate-900">"${itemName}"</span>?
                </p>
                ${hasProjects ? `
                    <div class="rounded-xl border border-amber-200/70 bg-amber-50/70 p-4">
                        <div class="flex items-start gap-3">
                            <div class="flex-shrink-0">
                                <svg class="w-6 h-6 text-amber-600" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                                </svg>
                            </div>
                            <div class="flex-1">
                                <h4 class="text-amber-900 font-semibold">Heads up</h4>
                                <p class="text-amber-800 text-sm mt-1">
                                    This category contains <span class="font-bold">${projectCount}</span> project${projectCount > 1 ? 's' : ''}.
                                </p>
                                <p class="text-amber-700 text-xs mt-2">
                                    Projects won’t be deleted, but they’ll become uncategorized.
                                </p>
                            </div>
                        </div>
                    </div>
                ` : ''}
            </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Archive',
        cancelButtonText: 'Cancel',
        reverseButtons: true,
        customClass: {
            ...appleSwal.options.customClass,
            confirmButton:
                'inline-flex items-center justify-center px-4 py-2 rounded-xl text-[13px] font-semibold bg-[#Eb3505] text-white hover:opacity-95 transition-opacity',
        },
    });
};

export const showRestoreConfirmation = (itemName) => {
    return appleSwal.fire({
        title: 'Restore category?',
        html: `
            <div class="space-y-3">
                <p class="text-slate-700">
                    Restore <span class="font-semibold text-slate-900">"${itemName}"</span>?
                </p>
                <div class="rounded-xl border border-emerald-200/70 bg-emerald-50/70 p-3">
                    <div class="flex items-start gap-2">
                        <svg class="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                        </svg>
                        <div>
                            <h4 class="text-emerald-900 font-semibold">Ready to restore.</h4>
                            <p class="text-emerald-800 text-sm">This category will be available again.</p>
                        </div>
                    </div>
                </div>
            </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Restore',
        cancelButtonText: 'Cancel',
        reverseButtons: true,
        customClass: {
            ...appleSwal.options.customClass,
            confirmButton:
                'inline-flex items-center justify-center px-4 py-2 rounded-xl text-[13px] font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors',
        },
    });
};

export const showEditConfirmation = (itemName, itemType = 'item') => {
    return appleSwal.fire({
        title: `Edit ${itemType}?`,
        html: `
            <div class="space-y-3">
                <p class="text-slate-700">
                    Edit <span class="font-semibold text-slate-900">"${itemName}"</span>?
                </p>
                <div class="rounded-xl border border-blue-200/70 bg-blue-50/70 p-3">
                    <div class="flex items-start gap-2">
                        <svg class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                        </svg>
                        <div>
                            <h4 class="text-blue-900 font-semibold">You’re about to edit.</h4>
                            <p class="text-blue-800 text-sm">You can update the ${itemType} details next.</p>
                        </div>
                    </div>
                </div>
            </div>
        `,
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Continue',
        cancelButtonText: 'Cancel',
        reverseButtons: true,
        customClass: {
            ...appleSwal.options.customClass,
            confirmButton:
                'inline-flex items-center justify-center px-4 py-2 rounded-xl text-[13px] font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors',
        },
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
        customClass: {
            popup: 'rounded-2xl shadow-[0_30px_80px_rgba(0,0,0,0.22)] border border-black/5 bg-white/95 backdrop-blur-md',
            title: 'text-[17px] font-semibold text-slate-900 tracking-[-0.01em] font-sans',
            htmlContainer: 'text-[13px] leading-5 text-slate-600 text-left font-sans',
            actions: 'gap-2 mt-5',
            confirmButton:
                'inline-flex items-center justify-center px-4 py-2 rounded-xl text-[13px] font-semibold bg-slate-900 text-white hover:bg-black transition-colors',
        },
    });
};
