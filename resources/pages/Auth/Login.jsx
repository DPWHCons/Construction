import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';

// Toast notification component
const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const bgColor = type === 'error' ? 'bg-accent-500' : type === 'warning' ? 'bg-yellow-500' : 'bg-primary-500';
    const icon = type === 'error' ? (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
    ) : type === 'warning' ? (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
    ) : (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
    );

    return (
        <div className={`fixed top-4 right-4 z-50 ${bgColor} text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-3 animate-slide-up backdrop-blur-sm border border-white/20`}>
            <div className="flex-shrink-0">{icon}</div>
            <span className="font-medium">{message}</span>
            <button
                onClick={onClose}
                className="ml-4 text-white/80 hover:text-white focus:outline-none transition-colors"
            >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>
        </div>
    );
};

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        username: '',
        password: '',
        remember: false,
    });

    const [loginAttempts, setLoginAttempts] = useState(0);
    const [toast, setToast] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        setLoginAttempts(prev => prev + 1);

        post(route('login'), {
            onFinish: () => {
                reset('password');
                if (errors.email || errors.password) {
                    // Show toast notification for authentication failure
                    const message = loginAttempts > 2
                        ? 'Invalid credentials. Please check your email and password.'
                        : 'Invalid password. Please try again.';

                    setToast({
                        message: message,
                        type: loginAttempts >= 3 ? 'error' : 'warning'
                    });
                }
            },
        });
    };

    const getErrorMessage = () => {
        if (errors.username) {
            return errors.username;
        }
        if (errors.password) {
            return loginAttempts > 2
                ? 'Invalid credentials. Please check your username and password.'
                : 'Invalid password. Please try again.';
        }
        return null;
    };

    const getErrorSeverity = () => {
        return loginAttempts >= 3 ? 'error' : loginAttempts >= 2 ? 'warning' : 'info';
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            {/* Toast Notification */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {/* Success Message */}
            {status && (
                <div className="mb-6 p-4 bg-primary-50 border border-primary-200 rounded-2xl text-sm text-primary-700 flex items-center animate-slide-up">
                    <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">{status}</span>
                </div>
            )}

            <form onSubmit={submit} className="space-y-6">
                <div>
                    <InputLabel htmlFor="username" value="Username" className="text-neutral-700 font-medium" />
                    <TextInput
                        id="username"
                        type="text"
                        name="username"
                        value={data.username}
                        className={`mt-2 block w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 ${errors.username 
                            ? 'border-accent-300 focus:border-accent-500 focus:ring-accent-500 bg-accent-50' 
                            : 'border-neutral-200 focus:border-primary-500 focus:ring-primary-500 hover:border-neutral-300'
                        }`}
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('username', e.target.value)}
                        placeholder="Enter your username"
                    />
                    <InputError message={errors.username} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Password" className="text-neutral-700 font-medium" />
                    <div className="relative mt-2">
                        <TextInput
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={data.password}
                            className={`block w-full py-3 border-2 rounded-xl transition-all duration-200 ${errors.password 
                                ? 'border-accent-300 focus:border-accent-500 focus:ring-accent-500 bg-accent-50' 
                                : 'border-neutral-200 focus:border-primary-500 focus:ring-primary-500 hover:border-neutral-300'
                            }`}
                            autoComplete="current-password"
                            onChange={(e) => {
                                setData('password', e.target.value);
                            }}
                            placeholder="Enter your password"
                            style={{ paddingRight: '120px', paddingLeft: '16px' }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 pr-10 pl-6 flex items-center text-neutral-400 hover:text-neutral-600 focus:outline-none transition-colors bg-white rounded-r-xl"
                            style={{ right: '8px', top: '2px', bottom: '2px' }}
                        >
                            {showPassword ? (
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                </svg>
                            ) : (
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            )}
                        </button>
                    </div>
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="flex items-center justify-between" style={{ marginTop: '8px' }}>
                    <label className="flex items-center cursor-pointer group">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData('remember', e.target.checked)
                            }
                            className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500 focus:ring-offset-0 w-4 h-4"
                        />
                        <span className="text-sm text-neutral-600 group-hover:text-neutral-800 transition-colors" style={{ marginLeft: '6.4px' }}>
                            Remember me
                        </span>
                    </label>

                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors hover:underline"
                        >
                            Forgot your password?
                        </Link>
                    )}
                </div>

                <div className="pt-6">
                    <PrimaryButton
                        className={`w-full justify-center py-4 px-6 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transform transition-all duration-200 ${processing
                            ? 'opacity-50 cursor-not-allowed bg-neutral-400'
                            : 'bg-[#010066] hover:bg-[#000d8a] text-white border-0'
                        }`}
                        disabled={processing}
                    >
                        {processing ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Logging in...
                            </span>
                        ) : (
                            <span className="flex items-center text-white">
                                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                </svg>
                                Sign In
                            </span>
                        )}
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
