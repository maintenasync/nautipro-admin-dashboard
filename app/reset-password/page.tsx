// app/reset-password/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Shield, RefreshCw, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'; // Added Loader2 for validation loading

const ResetPasswordPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    // State for form data
    const [formData, setFormData] = useState({
        email: '',
        newPassword: '',
        confirmPassword: '',
        resetToken: ''
    });

    // State for password visibility
    const [showPasswords, setShowPasswords] = useState({
        new: false,
        confirm: false
    });

    // States for overall page loading, error, and success messages
    const [isLoading, setIsLoading] = useState(false); // For password reset submission
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // New states for token validation
    const [isValidatingToken, setIsValidatingToken] = useState(true); // True initially as validation starts on mount
    const [isTokenValid, setIsTokenValid] = useState(false); // Will be set to true if token is valid

    // Effect to validate the token when the page loads
    useEffect(() => {
        const token = searchParams.get('token');
        const email = searchParams.get('email');

        const validateToken = async () => {
            if (!token || !email) {
                setError('Invalid or incomplete reset link. Redirecting to login...');
                // Redirect to login if token or email is missing
                setTimeout(() => router.push('/login'), 3000);
                setIsValidatingToken(false);
                return;
            }

            // Set form data immediately if token and email are present
            setFormData(prev => ({
                ...prev,
                resetToken: token,
                email: email
            }));

            try {
                // Construct the validation URL. Assuming '/api' proxies to your backend.
                // If your baseurl is different, replace '/api' with your actual baseurl.
                const validateUrl = `https://auth.nautiproconnect.com/api/v1/web/validate-reset-password/${token}`;
                const response = await fetch(validateUrl, {
                    method: 'GET',
                    headers: {
                        'x-api-key': "12345678",
                        'Content-Type': 'application/json'
                    },
                });

                if (response.ok) {
                    // Token is valid, allow displaying the form
                    setIsTokenValid(true);
                    setError(''); // Clear any previous errors
                } else {
                    // Token is invalid or expired
                    const errorData = await response.json();
                    setError(errorData.data?.error || 'Invalid or expired reset link. Redirecting to login...');
                    // Redirect to login on validation failure
                    setTimeout(() => router.push('/login'), 3000);
                }
            } catch (err) {
                console.error('Token validation error:', err);
                setError('Network error during token validation. Redirecting to login...');
                // Redirect on network error
                setTimeout(() => router.push('/login'), 3000);
            } finally {
                setIsValidatingToken(false); // Validation process finished
            }
        };

        validateToken();
    }, [searchParams, router]); // Re-run effect if searchParams or router changes

    // Handle form input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
        setError(''); // Clear error on input change
    };

    // Toggle password visibility
    const togglePasswordVisibility = (field: 'new' | 'confirm') => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    // Client-side password validation
    const validatePasswords = (): boolean => {
        if (!formData.newPassword) {
            setError('New password is required');
            return false;
        }
        if (formData.newPassword.length < 6) {
            setError('New password must be at least 6 characters');
            return false;
        }
        // More robust password requirements check as per your UI hints
        const hasUppercase = /[A-Z]/.test(formData.newPassword);
        const hasLowercase = /[a-z]/.test(formData.newPassword);
        const hasNumber = /[0-9]/.test(formData.newPassword);
        const hasSymbol = /[^A-Za-z0-9]/.test(formData.newPassword);

        if (!(hasUppercase && hasLowercase && hasNumber && hasSymbol)) {
            setError('Password must include uppercase, lowercase, numbers, and symbols.');
            return false;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        return true;
    };

    // Handle password reset submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validatePasswords()) return;

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('https://auth.nautiproconnect.com/api/v1/web/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': '12345678'
                },
                body: JSON.stringify({
                    email: formData.email,
                    new_password: formData.newPassword,
                    reset_token: formData.resetToken
                })
            });

            if (response.ok) {
                setSuccess(true);
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Failed to reset password');
            }
        } catch (err) {
            setError('Network error. Please try again.');
            console.error('Reset password error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Calculate password strength for visual feedback
    const getPasswordStrength = (password: string): { strength: number; text: string; color: string } => {
        let strength = 0;
        if (password.length >= 6) strength++;
        if (password.length >= 8) strength++; // Additional point for length
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++; // Symbols

        const levels = [
            { strength: 0, text: 'Very Weak', color: 'text-red-500' },
            { strength: 1, text: 'Weak', color: 'text-red-400' },
            { strength: 2, text: 'Fair', color: 'text-yellow-500' },
            { strength: 3, text: 'Good', color: 'text-yellow-400' },
            { strength: 4, text: 'Strong', color: 'text-green-500' },
            { strength: 5, text: 'Very Strong', color: 'text-green-600' },
        ];
        // Cap strength at max level (5)
        return levels[Math.min(strength, levels.length - 1)];
    };

    const passwordStrength = getPasswordStrength(formData.newPassword);

    // --- Conditional Rendering based on validation and success states ---

    // 1. Show loading while validating token
    if (isValidatingToken) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 [data-theme='dark']_&:bg-gray-900 p-4">
                <div className="flex flex-col items-center justify-center bg-white rounded-xl w-full max-w-md mx-auto [data-theme='dark']_&:bg-gray-800 shadow-2xl p-8 text-center">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 [data-theme='dark']_&:text-white">
                        Validating Reset Link...
                    </h2>
                    <p className="text-gray-600 [data-theme='dark']_&:text-gray-400 mt-2">
                        Please wait while we verify your reset token.
                    </p>
                </div>
            </div>
        );
    }

    // 2. Show error if token is invalid after validation
    if (!isTokenValid) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 [data-theme='dark']_&:bg-gray-900 p-4">
                <div className="flex flex-col items-center justify-center bg-white rounded-xl w-full max-w-md mx-auto [data-theme='dark']_&:bg-gray-800 shadow-2xl p-8 text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 [data-theme='dark']_&:text-white mb-2">
                        Invalid Link
                    </h2>
                    <p className="text-gray-600 [data-theme='dark']_&:text-gray-400 mb-6">
                        {error || 'The password reset link is invalid or has expired. Please request a new one.'}
                    </p>
                    <button
                        onClick={() => router.push('/login')}
                        className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    // 3. Show success message after password reset
    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 [data-theme='dark']_&:bg-gray-900 p-4">
                <div className="bg-white rounded-xl w-full max-w-md mx-auto [data-theme='dark']_&:bg-gray-800 shadow-2xl p-8 text-center">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-gray-900 [data-theme='dark']_&:text-white mb-2">
                        Password Reset Successful!
                    </h2>
                    <p className="text-gray-600 [data-theme='dark']_&:text-gray-300 mb-8">
                        Your password has been successfully updated. You can now log in with your new password.
                    </p>
                    <button
                        onClick={() => router.push('/login')}
                        className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    // 4. Show the actual reset password form (default state if token is valid and not yet successful)
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 [data-theme='dark']_&:bg-gray-900 p-4">
            <div className="bg-white rounded-xl w-full max-w-md mx-auto [data-theme='dark']_&:bg-gray-800 shadow-2xl">
                <div className="p-8">
                    <div className="text-center mb-8">
                        <div className="mx-auto bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center [data-theme='dark']_&:bg-blue-900/30 mb-4">
                            <Shield className="w-8 h-8 text-blue-600 [data-theme='dark']_&:text-blue-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 [data-theme='dark']_&:text-white">
                            Reset Your Password
                        </h1>
                        <p className="text-gray-600 [data-theme='dark']_&:text-gray-400 mt-2">
                            Enter your new password below
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 [data-theme='dark']_&:text-gray-300 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                readOnly
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:text-white cursor-not-allowed"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 [data-theme='dark']_&:text-gray-300 mb-1">
                                New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPasswords.new ? 'text' : 'password'}
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:text-white transition-colors"
                                    placeholder="Enter your new password"
                                    required
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility('new')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    disabled={isLoading}
                                >
                                    {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {formData.newPassword && (
                                <div className="mt-1 flex items-center space-x-2">
                                    <div className="flex-1 bg-gray-200 rounded-full h-1.5 [data-theme='dark']_&:bg-gray-600">
                                        <div
                                            className={`h-1.5 rounded-full transition-all duration-300 ${
                                                passwordStrength.strength <= 1 ? 'bg-red-500' :
                                                    passwordStrength.strength <= 3 ? 'bg-yellow-500' : 'bg-green-500'
                                            }`}
                                            style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                                        />
                                    </div>
                                    <span className={`text-xs font-medium ${passwordStrength.color}`}>
                                        {passwordStrength.text}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 [data-theme='dark']_&:text-gray-300 mb-1">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPasswords.confirm ? 'text' : 'password'}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:text-white transition-colors"
                                    placeholder="Confirm your new password"
                                    required
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility('confirm')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    disabled={isLoading}
                                >
                                    {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg [data-theme='dark']_&:bg-red-900/20 [data-theme='dark']_&:border-red-800">
                                <AlertCircle className="w-4 h-4 text-red-600 [data-theme='dark']_&:text-red-400 flex-shrink-0" />
                                <span className="text-sm text-red-600 [data-theme='dark']_&:text-red-400">{error}</span>
                            </div>
                        )}

                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:border-gray-600">
                            <h5 className="text-sm font-medium text-gray-800 [data-theme='dark']_&:text-gray-200 mb-2">
                                Password Requirements:
                            </h5>
                            <ul className="text-xs text-gray-600 [data-theme='dark']_&:text-gray-400 space-y-1">
                                <li>• At least 6 characters long</li>
                                <li>• Include uppercase, lowercase, numbers, and symbols</li>
                            </ul>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center space-x-2 transition-colors font-medium"
                        >
                            {isLoading ? (
                                <>
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    <span>Resetting...</span>
                                </>
                            ) : (
                                <>
                                    <Shield className="w-4 h-4" />
                                    <span>Reset Password</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
