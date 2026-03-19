import PageLayout from '@/Layouts/PageLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { showSuccessToast, showErrorToast } from '@/Utils/alerts';

export default function EditCategory({ category }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: category.name || '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('categories.update', category.id), {
            onSuccess: () => {
                reset();
                showSuccessToast('Category updated successfully!');
            },
            onError: (errors) => {
                showErrorToast('Failed to update category. Please try again.');
            },
        });
    };

    return (
        <PageLayout>
            <Head title="Edit Category" />
            
            <div className="max-w-2xl mx-auto p-6">
                <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-slate-200">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-slate-800 font-montserrat">Edit Category</h1>
                        <p className="text-slate-500 mt-2 font-montserrat">Update the category information.</p>
                    </div>

                    <form onSubmit={submit}>
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-slate-700 font-montserrat mb-2">
                                    Category Name
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#Eb3505] focus:border-transparent font-montserrat text-slate-900 placeholder-slate-400"
                                    placeholder="Enter category name"
                                    required
                                />
                                {errors.name && (
                                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-end space-x-4">
                            <Link
                                href={route('categories.index')}
                                className="px-4 py-2 text-slate-600 bg-slate-200 rounded-xl text-sm font-medium hover:bg-slate-300 transition-colors"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-3 bg-[#Eb3505] text-white rounded-xl text-sm font-semibold shadow-md hover:bg-[#d12e04] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? 'Updating...' : 'Update Category'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </PageLayout>
    );
}
