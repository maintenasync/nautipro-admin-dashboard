// app/login/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { LogoIcon } from '../dashboard/components/icons/Logos';
import ForgotPasswordDialog from '../components/dialogs/ForgotPasswordDialog';

export default function LoginPage() {
    const [formData, setFormData] = useState({
        email_or_username: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const { state, login } = useAuth();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.email_or_username || !formData.password) {
            setError('Please fill in all fields');
            return;
        }

        const success = await login(formData);

        if (success) {
            router.push('/dashboard');
        } else {
            setError('Invalid credentials. Please try again.');
        }
    };

    if (!mounted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 [data-theme='dark']:from-gray-900 [data-theme='dark']:via-blue-900 [data-theme='dark']:to-indigo-900">
                <div className="animate-pulse">
                    <div className="h-16 w-16 bg-blue-200 [data-theme='dark']:bg-gray-700 rounded-full mx-auto"></div>
                    <div className="h-8 w-48 bg-blue-200 [data-theme='dark']:bg-gray-700 rounded mx-auto mt-6"></div>
                    <div className="h-4 w-32 bg-blue-200 [data-theme='dark']:bg-gray-700 rounded mx-auto mt-2"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 [data-theme='dark']:from-gray-900 [data-theme='dark']:via-blue-900 [data-theme='dark']:to-indigo-900">
                {/* Floating Shapes */}
                <div className="absolute top-0 left-0 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute top-0 right-0 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 opacity-40" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>

            <div className="relative min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full">
                    {/* Login Card with Glassmorphism */}
                    <div className="backdrop-blur-xl bg-white/80 [data-theme='dark']:bg-gray-800/80 rounded-2xl shadow-2xl border border-white/20 [data-theme='dark']:border-gray-700/20 p-8 space-y-8 transform transition-all duration-300 hover:scale-[1.02]">
                        {/* Header Section */}
                        <div className="text-center">
                            <div className="flex justify-center mb-6">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-blue-500 rounded-full blur-lg opacity-30 animate-pulse"></div>
                                    <div className="relative bg-gradient-to-r from-blue-500 to-indigo-600 p-4 rounded-full shadow-lg transform transition-all duration-300 hover:rotate-6">
                                        <LogoIcon className="h-12 w-12 text-white"/>
                                    </div>
                                </div>
                            </div>
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 [data-theme='dark']:from-white [data-theme='dark']:to-gray-300 bg-clip-text text-transparent">
                                Welcome Back
                            </h2>
                            <p className="mt-2 text-sm text-gray-600 [data-theme='dark']:text-gray-400">
                                Sign in to your Admin Maintena Sync Dashboard
                            </p>
                        </div>

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {/* Email/Username Field */}
                            <div className="relative">
                                <div className="relative">
                                    <input
                                        id="email_or_username"
                                        name="email_or_username"
                                        type="text"
                                        required
                                        value={formData.email_or_username}
                                        onChange={handleChange}
                                        onFocus={() => setFocusedField('email_or_username')}
                                        onBlur={() => setFocusedField(null)}
                                        className="peer w-full px-4 py-3 bg-white/50 [data-theme='dark']:bg-gray-700/50 border border-gray-200 [data-theme='dark']:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 placeholder-transparent text-gray-900 [data-theme='dark']:text-white"
                                        // placeholder="Email or Username"
                                    />
                                    <label
                                        htmlFor="email_or_username"
                                        className={`absolute left-4 transition-all duration-300 pointer-events-none text-gray-500 [data-theme='dark']:text-gray-400 ${
                                            focusedField === 'email_or_username' || formData.email_or_username
                                                ? '-top-2 text-xs bg-white [data-theme=\'dark\']:bg-gray-800 px-2 rounded text-blue-600 [data-theme=\'dark\']:text-blue-400'
                                                : 'top-3 text-sm'
                                        }`}
                                    >
                                        Email or Username
                                    </label>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                        <svg className="h-5 w-5 text-gray-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="relative">
                                <div className="relative">
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        onFocus={() => setFocusedField('password')}
                                        onBlur={() => setFocusedField(null)}
                                        className="peer w-full px-4 py-3 bg-white/50 [data-theme='dark']:bg-gray-700/50 border border-gray-200 [data-theme='dark']:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 placeholder-transparent text-gray-900 [data-theme='dark']:text-white pr-12"
                                        // placeholder="Password"
                                    />
                                    <label
                                        htmlFor="password"
                                        className={`absolute left-4 transition-all duration-300 pointer-events-none text-gray-500 [data-theme='dark']:text-gray-400 ${
                                            focusedField === 'password' || formData.password
                                                ? '-top-2 text-xs bg-white [data-theme=\'dark\']:bg-gray-800 px-2 rounded text-blue-600 [data-theme=\'dark\']:text-blue-400'
                                                : 'top-3 text-sm'
                                        }`}
                                    >
                                        Password
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 [data-theme='dark']:hover:text-gray-300 transition-colors duration-300"
                                    >
                                        {showPassword ? (
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-50 [data-theme='dark']:bg-red-900/20 border border-red-200 [data-theme='dark']:border-red-800 rounded-xl p-4 animate-shake">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-red-700 [data-theme='dark']:text-red-300">{error}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Remember Me & Forgot Password */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors duration-300"
                                    />
                                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 [data-theme='dark']:text-gray-300">
                                        Remember me
                                    </label>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setIsForgotPasswordOpen(true)}
                                    className="text-sm font-medium text-blue-600 hover:text-blue-500 [data-theme='dark']:text-blue-400 [data-theme='dark']:hover:text-blue-300 transition-colors duration-300 hover:underline"
                                >
                                    Forgot password?
                                </button>
                            </div>

                            {/* Sign In Button */}
                            <button
                                type="submit"
                                disabled={state.isLoading}
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                            >
                                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                    {state.isLoading ? (
                                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        <svg className="h-5 w-5 text-white group-hover:text-blue-100 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                        </svg>
                                    )}
                                </span>
                                {state.isLoading ? 'Signing in...' : 'Sign in to Dashboard'}
                            </button>
                        </form>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 text-center">
                        <p className="text-xs text-gray-500 [data-theme='dark']:text-gray-400">
                            © 2024 Nautipro Connect Solutions. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>

            <ForgotPasswordDialog
                isOpen={isForgotPasswordOpen}
                onClose={() => setIsForgotPasswordOpen(false)}
            />

            <style jsx>{`
                @keyframes blob {
                    0% {
                        transform: translate(0px, 0px) scale(1);
                    }
                    33% {
                        transform: translate(30px, -50px) scale(1.1);
                    }
                    66% {
                        transform: translate(-20px, 20px) scale(0.9);
                    }
                    100% {
                        transform: translate(0px, 0px) scale(1);
                    }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
                @keyframes shake {
                    0%, 100% {
                        transform: translateX(0);
                    }
                    10%, 30%, 50%, 70%, 90% {
                        transform: translateX(-2px);
                    }
                    20%, 40%, 60%, 80% {
                        transform: translateX(2px);
                    }
                }
                .animate-shake {
                    animation: shake 0.5s ease-in-out;
                }
            `}</style>
        </div>
    );
}
