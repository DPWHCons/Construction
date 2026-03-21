import { useForm } from '@inertiajs/react';

export default function ForgotPasswordModal({ show, onClose }) {
    const { data, setData, put, processing, errors, reset } = useForm({
        password: '',
        password_confirmation: ''
    });

    if (!show) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        
        put(route('password.reset.direct'), {
            onSuccess: () => {
                // Redirect to login page immediately after password change
                window.location.href = route('login');
            },
            onError: (errors) => {
                console.error('Password update errors:', errors);
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border">
                
                {/* Header */}
                <div className="bg-[#010066] p-6 rounded-t-2xl">
                    <h3 className="text-xl font-bold text-white">Change Password</h3>
                    <p className="text-white/80 text-sm mt-1">Set your new password</p>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} id="password-form" className="p-6 space-y-4">

                    <div>
                        <input
                            type="password"
                            placeholder="New Password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#010066] focus:ring-[#010066] transition-colors"
                        />
                        {errors.password && (
                            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                        )}
                    </div>

                    <div>
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#010066] focus:ring-[#010066] transition-colors"
                        />
                        {errors.password_confirmation && (
                            <p className="text-red-500 text-sm mt-1">{errors.password_confirmation}</p>
                        )}
                    </div>

                </form>

                {/* Footer */}
                <div className="flex justify-end gap-3 p-4 bg-gray-50 rounded-b-2xl">
                    <button
                        type="button"
                        onClick={() => {
                            onClose();
                            reset();
                        }}
                        className="px-4 py-2 bg-gray-200 rounded-xl hover:bg-gray-300 transition"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        form="password-form"
                        disabled={processing}
                        className="px-4 py-2 bg-[#010066] text-white rounded-xl hover:bg-[#010066]/90 transition disabled:opacity-50"
                    >
                        {processing ? 'Updating...' : 'Update Password'}
                    </button>
                </div>
            </div>
        </div>
    );
}
