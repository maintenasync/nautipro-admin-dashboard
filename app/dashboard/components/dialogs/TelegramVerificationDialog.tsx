// app/dashboard/components/dialogs/TelegramVerificationDialog.tsx

'use client';

import { useState, useEffect } from 'react';
import telegramService from '../../../services/telegramService';

interface TelegramVerificationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (username: string) => void;
}

interface VerificationData {
    id: number;
    user_id: string;
    token: string;
    is_used: boolean;
    active_until: string;
    created_at: string;
    updated_at: string;
}

export default function TelegramVerificationDialog({ isOpen, onClose, onSuccess }: TelegramVerificationDialogProps) {
    const [step, setStep] = useState<'generating' | 'verification' | 'completing'>('generating');
    const [verificationData, setVerificationData] = useState<VerificationData | null>(null);
    const [timeRemaining, setTimeRemaining] = useState<number>(0);
    const [copied, setCopied] = useState(false);
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Animation states
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    // Handle dialog visibility with animation
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setIsVisible(true);
            setTimeout(() => setIsAnimating(true), 10);
            generateVerificationToken();
        } else {
            document.body.style.overflow = 'unset';
            setIsAnimating(false);
            setTimeout(() => {
                setIsVisible(false);
                resetDialog();
            }, 200);
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Countdown timer
    useEffect(() => {
        if (verificationData && timeRemaining > 0) {
            const timer = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        setError('Verification token has expired. Please try again.');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [verificationData, timeRemaining]);

    const resetDialog = () => {
        setStep('generating');
        setVerificationData(null);
        setTimeRemaining(0);
        setCopied(false);
        setUsername('');
        setError('');
        setIsLoading(false);
    };

    const generateVerificationToken = async () => {
        setIsLoading(true);
        setError('');

        try {
            const result = await telegramService.createVerification();

            setVerificationData(result.data);
            const expiryTime = parseInt(result.data.active_until);
            const currentTime = Date.now();
            const remaining = Math.max(0, Math.floor((expiryTime - currentTime) / 1000));
            setTimeRemaining(remaining);
            setStep('verification');
        } catch (error) {
            console.error('Error generating verification token:', error);
            setError('Failed to generate verification token. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = async () => {
        if (!verificationData) return;

        const message = `Do not change this message !!\nverification:${verificationData.token}`;

        try {
            await navigator.clipboard.writeText(message);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = message;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const openTelegramBot = () => {
        window.open('https://t.me/maintena_sync_bot', '_blank');
    };

    const handleComplete = async () => {
        if (!username.trim()) {
            setError('Please enter your Telegram username');
            return;
        }

        const formattedUsername = username.startsWith('@') ? username : '@' + username;

        try {
            setIsLoading(true);

            // Optional: Save the verified username to backend
            await telegramService.saveVerifiedUsername(formattedUsername);

            onSuccess(formattedUsername);
        } catch (error: unknown) {
            console.error('Error saving username:', error);
            // Even if saving fails, we can still proceed with local success
            onSuccess(formattedUsername);
        } finally {
            setIsLoading(false);
        }
    };

    const formatTimeRemaining = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m ${secs}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    };

    const handleClose = () => {
        resetDialog();
        onClose();
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    if (!isVisible) return null;

    return (
        <div
            className={`fixed inset-0 flex items-center justify-center z-50 p-4 transition-all duration-200 ease-out ${
                isAnimating
                    ? 'bg-opacity-50 backdrop-blur-sm'
                    : 'bg-opacity-0 backdrop-blur-0'
            }`}
            onClick={handleBackdropClick}
        >
            <div
                className={`bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl transition-all duration-200 ease-out [data-theme='dark']_&:bg-gray-800 ${
                    isAnimating
                        ? 'scale-100 opacity-100 translate-y-0'
                        : 'scale-95 opacity-0 translate-y-4'
                }`}
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                            <div className="bg-blue-100 p-2 rounded-lg [data-theme='dark']_&:bg-blue-900">
                                <svg className="w-6 h-6 text-blue-600 [data-theme='dark']_&:text-blue-300" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 [data-theme='dark']_&:text-white">Telegram Verification</h3>
                                <p className="text-sm text-gray-500 [data-theme='dark']_&:text-gray-400">Connect your Telegram account</p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors duration-150 [data-theme='dark']_&:hover:bg-gray-700"
                            type="button"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="space-y-4">
                        {/* Step 1: Generating Token */}
                        {step === 'generating' && (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                                <h4 className="text-lg font-medium text-gray-900 [data-theme='dark']_&:text-white mb-2">
                                    Generating Verification Token
                                </h4>
                                <p className="text-sm text-gray-500 [data-theme='dark']_&:text-gray-400">
                                    Please wait while we create your verification token...
                                </p>
                            </div>
                        )}

                        {/* Step 2: Verification Process */}
                        {step === 'verification' && verificationData && (
                            <div className="space-y-6">
                                {/* Timer */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 [data-theme='dark']_&:bg-blue-900 [data-theme='dark']_&:border-blue-700">
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-sm font-medium text-blue-700 [data-theme='dark']_&:text-blue-200">
                                            Token expires in: {formatTimeRemaining(timeRemaining)}
                                        </span>
                                    </div>
                                </div>

                                {/* Instructions */}
                                <div>
                                    <h4 className="text-md font-semibold text-gray-800 [data-theme='dark']_&:text-gray-200 mb-3">Follow these steps:</h4>
                                    <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 [data-theme='dark']_&:text-gray-400">
                                        <li>Copy the verification message below</li>
                                        <li>Open our Telegram bot</li>
                                        <li>Send the copied message to the bot</li>
                                        <li>Return here and refresh this dasboard</li>
                                    </ol>
                                </div>

                                {/* Verification Message */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 [data-theme='dark']_&:text-gray-300 mb-2">
                                        Verification Message (Do not modify!)
                                    </label>
                                    <div className="relative">
                                        <textarea
                                            readOnly
                                            value={`Do not change this message !!\nverification:${verificationData.token}`}
                                            className="w-full h-20 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 text-sm font-mono resize-none [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:text-gray-200"
                                        />
                                        <button
                                            onClick={copyToClipboard}
                                            className="absolute top-2 right-2 p-1 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors duration-150 [data-theme='dark']_&:bg-gray-600 [data-theme='dark']_&:border-gray-500 [data-theme='dark']_&:hover:bg-gray-500"
                                        >
                                            {copied ? (
                                                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            ) : (
                                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    {copied && (
                                        <p className="text-sm text-green-600 mt-1 [data-theme='dark']_&:text-green-400">
                                            Message copied to clipboard!
                                        </p>
                                    )}
                                </div>

                                {/* Go to Bot Button */}
                                <button
                                    onClick={openTelegramBot}
                                    className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-150 flex items-center justify-center space-x-2"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                                    </svg>
                                    <span>Go to Chat (@maintena_sync_bot)</span>
                                </button>

                                {/* Username Input */}
                                {/*<div>*/}
                                {/*    <label className="block text-sm font-medium text-gray-700 [data-theme='dark']_&:text-gray-300 mb-2">*/}
                                {/*        Your Telegram Username*/}
                                {/*    </label>*/}
                                {/*    <div className="flex space-x-3">*/}
                                {/*        <input*/}
                                {/*            type="text"*/}
                                {/*            value={username}*/}
                                {/*            onChange={(e) => setUsername(e.target.value)}*/}
                                {/*            placeholder="@your_username"*/}
                                {/*            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400 [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:text-white"*/}
                                {/*        />*/}
                                {/*        <button*/}
                                {/*            onClick={handleComplete}*/}
                                {/*            disabled={!username.trim() || timeRemaining <= 0 || isLoading}*/}
                                {/*            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 flex items-center space-x-1"*/}
                                {/*        >*/}
                                {/*            {isLoading && (*/}
                                {/*                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">*/}
                                {/*                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>*/}
                                {/*                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>*/}
                                {/*                </svg>*/}
                                {/*            )}*/}
                                {/*            <span>{isLoading ? 'Saving...' : 'Complete'}</span>*/}
                                {/*        </button>*/}
                                {/*    </div>*/}
                                {/*</div>*/}

                                {/* Instructions */}
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:border-gray-600">
                                    <h5 className="text-sm font-medium text-gray-800 [data-theme='dark']_&:text-gray-200 mb-2">Have a trouble access telegram bot ?</h5>
                                    <ul className="text-xs text-gray-600 [data-theme='dark']_&:text-gray-400 space-y-1">
                                        <li>Open Link Manual :</li>
                                        <li>https://t.me/maintena_sync_bot</li>
                                    </ul>
                                </div>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-md p-3 [data-theme='dark']_&:bg-red-900 [data-theme='dark']_&:border-red-700">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-red-700 [data-theme='dark']_&:text-red-200">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 [data-theme='dark']_&:border-gray-600">
                            <button
                                onClick={handleClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:text-gray-200 [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                            {(error || timeRemaining <= 0) && (
                                <button
                                    onClick={generateVerificationToken}
                                    disabled={isLoading}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
                                >
                                    {isLoading ? 'Generating...' : 'Try Again'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}