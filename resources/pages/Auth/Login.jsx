import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import ForgotPasswordModal from '@/Components/ForgotPasswordModal';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';

/* ---------------- Toast (Minimal) ---------------- */
const Toast = ({ message, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed top-4 right-4 z-50 
            bg-white/90 backdrop-blur-md 
            border border-black/5 
            rounded-xl shadow-md 
            px-4 py-3 flex items-center gap-3">

            <span className="text-neutral-400 text-sm">✕</span>

            <p className="text-sm text-neutral-800">
                {message}
            </p>
        </div>
    );
};

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        username: '',
        password: '',
        remember: false,
    });

    const [toast, setToast] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [fieldFeedback, setFieldFeedback] = useState({
        username: '',
        password: ''
    });
    const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

    const submit = (e) => {
        e.preventDefault();

        // Clear previous feedback
        setFieldFeedback({ username: '', password: '' });

        // Validation feedback
        if (!data.username) {
            setFieldFeedback(prev => ({ ...prev, username: 'Username is required' }));
            return;
        }
        if (data.username.length < 3) {
            setFieldFeedback(prev => ({ ...prev, username: 'Username must be at least 3 characters' }));
            return;
        }
        if (!data.password) {
            setFieldFeedback(prev => ({ ...prev, password: 'Password is required' }));
            return;
        }
        if (data.password.length < 6) {
            setFieldFeedback(prev => ({ ...prev, password: 'Password must be at least 6 characters' }));
            return;
        }

        post(route('login'), {
            onSuccess: () => {
                reset('password');

                // Clear previous feedback
                setFieldFeedback({ username: '', password: '' });

                // Check if user came from landing page and redirect back
                const urlParams = new URLSearchParams(window.location.search);
                const fromLanding = urlParams.get('from_landing');
                
                // Use replace() to prevent login page from appearing in browser history
                if (fromLanding === 'true') {
                    window.location.replace('http://127.0.0.1:8000/landing');
                } else {
                    window.location.replace(route('dashboard') + '?login=success');
                }
            },
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            {/* Toast */}
            {toast && (
                <Toast
                    message={toast}
                    onClose={() => setToast(null)}
                />
            )}
            {status && (
                <div className="mb-4 text-xs text-neutral-600 text-center">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                {/* Username Field */}
                <div>
                    <TextInput
                        id="username"
                        type="text"
                        name="username"
                        value={data.username}
                        className="w-full px-4 py-2.5 
                        bg-white border border-slate-200 
                        rounded-lg text-sm text-slate-900 
                        focus:border-[#010066] focus:ring-1 focus:ring-[#010066]/20
                        transition placeholder:text-slate-400"
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck="false"
                        isFocused={true}
                        onChange={(e) => {
                            setData('username', e.target.value);
                            if (fieldFeedback.username) {
                                setFieldFeedback(prev => ({ ...prev, username: '' }));
                            }
                        }}
                        placeholder="Username"
                    />
                    {fieldFeedback.username && (
                        <div className="mt-1 text-xs text-red-500">
                            {fieldFeedback.username}
                        </div>
                    )}
                    <InputError message={errors.username} className="mt-1" />
                </div>

                {/* Password Field */}
                <div>
                    <div className="relative">
                        <TextInput
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={data.password}
                            className="w-full px-4 py-2.5 pr-12
                            bg-white border border-slate-200 
                            rounded-lg text-sm text-slate-900 
                            focus:border-[#010066] focus:ring-1 focus:ring-[#010066]/20
                            transition placeholder:text-slate-400"
                            autoComplete="current-password"
                            onChange={(e) => {
                                setData('password', e.target.value);
                                if (fieldFeedback.password) {
                                    setFieldFeedback(prev => ({ ...prev, password: '' }));
                                }
                            }}
                            placeholder="Password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute text-slate-400 hover:text-slate-600 transition"
                            style={{
                                top: '50%',
                                right: '12px',
                                transform: 'translateY(-50%)'
                            }}
                        >
                            {showPassword ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            )}
                        </button>
                    </div>
                    {fieldFeedback.password && (
                        <div className="mt-1 text-xs text-red-500">
                            {fieldFeedback.password}
                        </div>
                    )}
                    <InputError message={errors.password} className="mt-1" />
                </div>

                {/* Options Row */}
                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData('remember', e.target.checked)
                            }
                            className="border-slate-300 rounded"
                        />
                        Remember me
                    </label>

                    {canResetPassword && (
                        <button
                            type="button"
                            onClick={() => setShowForgotPasswordModal(true)}
                            className="text-xs text-[#010066] hover:underline"
                        >
                            Forgot password?
                        </button>
                    )}
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 
                    ${processing
                        ? 'bg-slate-300 text-white cursor-not-allowed'
                        : 'bg-[#010066] text-white hover:bg-[#010055] shadow-sm hover:shadow-md'
                    }`}
                    disabled={processing}
                >
                    {processing ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Signing in...
                        </span>
                    ) : 'Sign In'}
                </button>

                {/* Browse Projects Link */}
                <div className="pt-2 text-center border-t border-slate-100">
                    <Link
                        href="/landing"
                        className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-[#010066] transition-colors"
                        onClick={(e) => {
                            e.preventDefault();
                            window.location.replace('/landing');
                        }}
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Browse Projects
                    </Link>
                </div>
            </form>

            {/* Forgot Password Modal */}
            <ForgotPasswordModal
                show={showForgotPasswordModal}
                onClose={() => setShowForgotPasswordModal(false)}
            />
        </GuestLayout>
    );
}