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
                // Redirect with success parameter
                window.location.href = route('dashboard') + '?login=success';
            },
            onFinish: () => {
                reset('password');

                // Clear previous feedback
                setFieldFeedback({ username: '', password: '' });

                // Check if user came from landing page and redirect back
                const urlParams = new URLSearchParams(window.location.search);
                const fromLanding = urlParams.get('from_landing');
                
                if (fromLanding === 'true') {
                    window.location.href = 'http://127.0.0.1:8000/landing';
                } else {
                    window.location.href = route('dashboard');
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
                <div className="mb-6 text-sm text-neutral-600 text-center">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-6">
                <div>
                    <InputLabel
                        htmlFor="username"
                        value="Username"
                        className="text-sm text-neutral-700"
                    />

                    <TextInput
                        id="username"
                        type="text"
                        name="username"
                        value={data.username}
                        className="mt-2 w-full px-4 py-3 
                        bg-white border border-neutral-200 
                        rounded-lg text-neutral-900 
                        focus:border-neutral-400 focus:ring-0 
                        transition"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => {
                            setData('username', e.target.value);
                            if (fieldFeedback.username) {
                                setFieldFeedback(prev => ({ ...prev, username: '' }));
                            }
                        }}
                        placeholder="Enter your username"
                    />
                    {fieldFeedback.username && (
                        <div className="mt-1 text-xs text-red-500 animate-pulse">
                            {fieldFeedback.username}
                        </div>
                    )}

                    <InputError message={errors.username} className="mt-2" />
                </div>

                <div>
                    <InputLabel
                        htmlFor="password"
                        value="Password"
                        className="text-sm text-neutral-700"
                    />

                    <div className="relative mt-2">
                        <TextInput
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={data.password}
                            className="w-full px-4 py-3 pr-12
            bg-white border border-neutral-200 
            rounded-lg text-neutral-900 
            focus:border-neutral-400 focus:ring-0 
            transition"
                            autoComplete="current-password"
                            onChange={(e) => {
                                setData('password', e.target.value);
                                if (fieldFeedback.password) {
                                    setFieldFeedback(prev => ({ ...prev, password: '' }));
                                }
                            }}
                            placeholder="Enter your password"
                        />

                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute top-2 right-1 flex items-center pr-3 text-neutral-400 hover:text-neutral-600 transition"                        >
                            {showPassword ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59"
                                    />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                    />
                                </svg>
                            )}
                        </button>
                    </div>

                    {/* Inline Feedback */}
                    {fieldFeedback.password && (
                        <div className="mt-1 text-xs text-red-500 animate-pulse">
                            {fieldFeedback.password}
                        </div>
                    )}

                    <InputError message={errors.password} className="mt-2" />
                </div>

                {/* Options */}
                <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 text-neutral-600">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData('remember', e.target.checked)
                            }
                            className="border-neutral-300"
                        />
                        Remember me
                    </label>

                    {canResetPassword && (
                        <button
                            type="button"
                            onClick={() => setShowForgotPasswordModal(true)}
                            className="text-neutral-500 hover:text-neutral-700"
                        >
                            Forgot Password ?
                        </button>
                    )}
                </div>

                {/* Button */}
                <PrimaryButton
                    className={`w-full py-3 rounded-lg font-medium transition 
                    ${processing
                            ? 'bg-neutral-300 text-white cursor-not-allowed'
                            : 'bg-neutral-900 text-white hover:bg-neutral-800'
                        }`}
                    disabled={processing}
                >
                    {processing ? 'Signing in...' : 'Sign In'}
                </PrimaryButton>

            </form>

            {/* Forgot Password Modal */}
            <ForgotPasswordModal
                show={showForgotPasswordModal}
                onClose={() => setShowForgotPasswordModal(false)}
            />
        </GuestLayout>
    );
}