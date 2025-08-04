// components/ForgotPasswordDialog.tsx
import React, { useState } from 'react';
import { X, Mail, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

interface ForgotPasswordDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

const ForgotPasswordDialog: React.FC<ForgotPasswordDialogProps> = ({
                                                                       isOpen,
                                                                       onClose
                                                                   }) => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            setError('Email is required');
            return;
        }

        setIsLoading(true);
        setError('');
        setSuccess(false);

        try {
            const response = await fetch('https://auth.nautiproconnect.com/api/v1/web/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': '12345678'
                },
                body: JSON.stringify({ email })
            });

            if (response.ok) {
                setSuccess(true);
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Failed to send reset email');
            }
        } catch (err) {
            setError('Network error. Please try again.');
            console.error('Forgot password error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        onClose();
        setEmail('');
        setError('');
        setSuccess(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-md mx-auto [data-theme='dark']_&:bg-gray-800 shadow-2xl">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg [data-theme='dark']_&:bg-blue-900/30">
                                <Mail className="w-5 h-5 text-blue-600 [data-theme='dark']_&:text-blue-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 [data-theme='dark']_&:text-white">
                                Reset Password
                            </h3>
                        </div>
                        <button
                            onClick={handleClose}
                            disabled={isLoading}
                            className="p-2 hover:bg-gray-100 rounded-lg [data-theme='dark']_&:hover:bg-gray-700 transition-colors disabled:opacity-50"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    {success ? (
                        <div className="text-center py-6">
                            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                            <h4 className="text-lg font-medium text-gray-900 [data-theme='dark']_&:text-white mb-2">
                                Email Sent!
                            </h4>
                            <p className="text-gray-600 [data-theme='dark']_&:text-gray-300 mb-6">
                                We&#39;ve sent a password reset link to <span className="font-medium">{email}</span>.
                                Please check your inbox.
                            </p>
                            <button
                                onClick={handleClose}
                                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 [data-theme='dark']_&:text-gray-300 mb-1">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:text-white transition-colors"
                                    placeholder="Enter your email"
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            {error && (
                                <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg [data-theme='dark']_&:bg-red-900/20 [data-theme='dark']_&:border-red-800">
                                    <AlertCircle className="w-4 h-4 text-red-600 [data-theme='dark']_&:text-red-400 flex-shrink-0" />
                                    <span className="text-sm text-red-600 [data-theme='dark']_&:text-red-400">{error}</span>
                                </div>
                            )}

                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:border-gray-600">
                                <p className="text-xs text-gray-600 [data-theme='dark']_&:text-gray-400">
                                    We&#39;ll send you a link to reset your password. Please make sure to check your spam folder if you don&#39;t see it.
                                </p>
                            </div>

                            <div className="flex space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    disabled={isLoading}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:text-gray-300 [data-theme='dark']_&:hover:bg-gray-700 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center space-x-2 transition-colors"
                                >
                                    {isLoading ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            <span>Sending...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Mail className="w-4 h-4" />
                                            <span>Send Reset Link</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordDialog;