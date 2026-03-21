import React, { useEffect } from 'react';
import Swal from 'sweetalert2';

const FeedbackAlert = ({
  show,
  onClose,
  type = 'info',
  title,
  message,
  html,
  duration = 3000,
  showProgress = false,
  confirmButtonText,
  cancelButtonText,
  onConfirm,
  onCancel,
  isModal = false,
  customClass = {},
}) => {
  const typeConfig = {
    success: { color: 'emerald', defaultTitle: 'Success', defaultMessage: 'Operation completed successfully' },
    error: { color: 'red', defaultTitle: 'Error', defaultMessage: 'Something went wrong' },
    warning: { color: 'amber', defaultTitle: 'Warning', defaultMessage: 'Please check your input' },
    info: { color: 'blue', defaultTitle: 'Information', defaultMessage: 'For your information' },
  };

  const config = typeConfig[type] || typeConfig.info;

  useEffect(() => {
    if (!show) return;

    const swalConfig = {
      toast: !isModal,
      position: isModal ? 'center' : 'top-end',
      timer: confirmButtonText || cancelButtonText ? null : duration,
      timerProgressBar: showProgress && !(confirmButtonText || cancelButtonText),
      showConfirmButton: !!confirmButtonText,
      showCancelButton: !!cancelButtonText,
      confirmButtonText,
      cancelButtonText,
      icon: type,
      title: title || config.defaultTitle,
      customClass: {
        popup: isModal 
          ? `rounded-2xl shadow-2xl bg-white p-6 min-w-[400px] max-w-[500px] ${customClass.popup || ''}`
          : `rounded-2xl shadow-xl bg-white/90 backdrop-blur-md p-5 min-w-[300px] ${customClass.popup || ''}`,
        title: `text-lg font-bold text-slate-900 ${customClass.title || ''}`,
        htmlContainer: `text-sm text-slate-600 mt-2 ${customClass.htmlContainer || ''}`,
        confirmButton: confirmButtonText
          ? `px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${customClass.confirmButton || `bg-${config.color}-600 text-white hover:bg-${config.color}-700`}`
          : undefined,
        cancelButton: cancelButtonText
          ? `px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${customClass.cancelButton || 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`
          : undefined,
        actions: `gap-3 mt-6 ${customClass.actions || ''}`,
        container: isModal ? 'z-[10000]' : 'z-[10001]',
      },
      showClass: { 
        popup: isModal ? 'animate-fade-in-up' : 'animate-slide-in-right',
        backdrop: 'swal2-backdrop-show'
      },
      hideClass: { 
        popup: isModal ? 'animate-fade-out-down' : 'animate-slide-out-right',
        backdrop: 'swal2-backdrop-hide'
      },
      backdrop: isModal ? 'rgba(0, 0, 0, 0.5)' : undefined,
    };

    if (html) {
      swalConfig.html = html;
    } else {
      swalConfig.text = message || config.defaultMessage;
    }

    Swal.fire(swalConfig).then((result) => {
      if (result.isConfirmed && onConfirm) onConfirm();
      if (result.isDismissed && onCancel) onCancel();
      onClose();
    });
  }, [
    show,
    type,
    title,
    message,
    html,
    duration,
    showProgress,
    confirmButtonText,
    cancelButtonText,
    onConfirm,
    onCancel,
    isModal,
  ]);

  return null;
};

export default FeedbackAlert;
