import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import { showSuccessToast, showErrorToast } from '@/Utils/alerts';

export default function EditCategoryModal({ show, category, onClose, onUpdate }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: category?.name || '',
    });

    useEffect(() => {
        if (category && show) {
            setData('name', category.name || '');
        }
    }, [category, show]);

    useEffect(() => {
        if (!show) reset();
    }, [show]);

    const submit = (e) => {
        e.preventDefault();
        if (!category) return;

        post(route('categories.update', category.id), {
            onSuccess: () => {
                reset();
                showSuccessToast('Category updated successfully!');
                onUpdate?.();
                onClose();
            },
            onError: () => {
                showErrorToast('Failed to update category.');
            },
        });
    };

    if (!show || !category) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div
                className="w-full max-w-md rounded-2xl bg-white shadow-[0_25px_70px_-15px_rgba(0,0,0,0.3)]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-7 pt-7 pb-3 text-center">
                    <h3 className="text-lg font-semibold text-slate-900">
                        Edit Category
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                        Make changes to your category name
                    </p>
                </div>

                {/* Divider */}
                <div className="border-t border-slate-100" />

                {/* Form */}
                <form onSubmit={submit} className="px-7 py-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Category Name
                        </label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="e.g. Infrastructure"
                            autoFocus
                            className={`w-full rounded-xl border px-4 py-3 text-sm transition-all outline-none
                                ${errors.name
                                    ? 'border-red-400 focus:ring-2 focus:ring-red-200'
                                    : 'border-slate-200 focus:border-[#Eb3505] focus:ring-2 focus:ring-[#Eb3505]/20'
                                }`}
                        />
                        {errors.name && (
                            <p className="text-xs text-red-500 mt-1">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl transition-all hover:bg-slate-200 active:scale-[0.98]"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-[#Eb3505] rounded-xl shadow-md transition-all hover:bg-[#d12e04] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {processing && (
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                            )}
                            {processing ? 'Updating...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}