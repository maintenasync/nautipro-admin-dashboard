import React, { useState, useRef, useEffect } from 'react';
import { X, Mail, Check, RefreshCw, AlertCircle, Clock } from 'lucide-react';
import { userService } from '@/app/services/userService';

interface EmailVerificationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    email: string;
    onSuccess: () => void;
}

const EmailVerificationDialog: React.FC<EmailVerificationDialogProps> = ({
                                                                             isOpen,
                                                                             onClose,
                                                                             email,
                                                                             onSuccess
                                                                         }) => {
    const [otp, setOtp] = useState(['', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState('');
    const [timeLeft, setTimeLeft] = useState(0);
    const [isCodeSent, setIsCodeSent] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Timer effect
    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [timeLeft]);

    // Auto-focus first input when dialog opens
    useEffect(() => {
        if (isOpen && isCodeSent && inputRefs.current[0]) {
            setTimeout(() => {
                inputRefs.current[0]?.focus();
            }, 100);
        }
    }, [isOpen, isCodeSent]);

    const sendVerificationCode = async () => {
        setIsSending(true);
        setError('');
        try {
            const success = await userService.createEmailVerification(email);
            if (success) {
                setTimeLeft(900); // 15 minutes = 900 seconds
                setIsCodeSent(true);
                setOtp(['', '', '', '', '']);
                // Focus first input after sending
                setTimeout(() => {
                    inputRefs.current[0]?.focus();
                }, 100);
            } else {
                setError('Failed to send verification code. Please try again.');
            }
        } catch (error: any) {
            if (error.message.includes('429')) {
                setError('Too many attempts. Please wait before requesting a new code.');
            } else {
                setError('Failed to send verification code. Please try again.');
            }
            console.error('Error sending verification code:', error);
        } finally {
            setIsSending(false);
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        // Only allow single digit
        if (value.length > 1) return;

        // Only allow numbers
        if (value && !/^\d$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setError('');

        // Auto focus next input
        if (value && index < 4) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto submit if all fields are filled
        if (value && index === 4 && newOtp.every(digit => digit !== '')) {
            setTimeout(() => handleVerify(newOtp), 100);
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace') {
            if (!otp[index] && index > 0) {
                // Move to previous input if current is empty
                inputRefs.current[index - 1]?.focus();
            } else {
                // Clear current input
                const newOtp = [...otp];
                newOtp[index] = '';
                setOtp(newOtp);
            }
        } else if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowRight' && index < 4) {
            inputRefs.current[index + 1]?.focus();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (otp.every(digit => digit !== '')) {
                handleVerify();
            }
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');

        if (pastedData.length === 5) {
            const newOtp = pastedData.split('').slice(0, 5);
            setOtp(newOtp);
            setError('');
            // Focus last input
            inputRefs.current[4]?.focus();
            // Auto submit
            setTimeout(() => handleVerify(newOtp), 100);
        }
    };

    const handleVerify = async (otpArray = otp) => {
        const otpString = otpArray.join('');
        if (otpString.length !== 5) {
            setError('Please enter the complete 5-digit verification code');
            return;
        }

        setIsLoading(true);
        setError('');
        try {
            const success = await userService.verifyEmail(email, otpString);
            if (success) {
                onSuccess();
                handleClose();
            } else {
                setError('Invalid verification code. Please check and try again.');
                // Clear OTP inputs on error
                setOtp(['', '', '', '', '']);
                inputRefs.current[0]?.focus();
            }
        } catch (error: any) {
            if (error.message.includes('404') || error.message.includes('expired')) {
                setError('Verification code has expired. Please request a new one.');
                setTimeLeft(0);
                setIsCodeSent(false);
            } else if (error.message.includes('400')) {
                setError('Invalid verification code. Please check and try again.');
            } else {
                setError('Failed to verify email. Please try again.');
            }
            setOtp(['', '', '', '', '']);
            inputRefs.current[0]?.focus();
            console.error('Error verifying email:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        onClose();
        setOtp(['', '', '', '', '']);
        setError('');
        setTimeLeft(0);
        setIsCodeSent(false);
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const canResend = timeLeft === 0 && isCodeSent;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-md mx-auto [data-theme='dark']_&:bg-gray-800 shadow-2xl">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-green-100 rounded-lg [data-theme='dark']_&:bg-green-900/30">
                                <Mail className="w-5 h-5 text-green-600 [data-theme='dark']_&:text-green-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 [data-theme='dark']_&:text-white">
                                Verify Email Address
                            </h3>
                        </div>
                        <button
                            onClick={handleClose}
                            disabled={isLoading || isSending}
                            className="p-2 hover:bg-gray-100 rounded-lg [data-theme='dark']_&:hover:bg-gray-700 transition-colors disabled:opacity-50"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    <div className="text-center mb-6">
                        <p className="text-sm text-gray-600 [data-theme='dark']_&:text-gray-400 mb-2">
                            {!isCodeSent
                                ? "We'll send a 5-digit verification code to:"
                                : "We've sent a 5-digit verification code to:"
                            }
                        </p>
                        <p className="font-medium text-gray-900 [data-theme='dark']_&:text-white mb-4">
                            {email}
                        </p>

                        {!isCodeSent ? (
                            <button
                                onClick={sendVerificationCode}
                                disabled={isSending}
                                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto transition-colors"
                            >
                                {isSending ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        <span>Sending...</span>
                                    </>
                                ) : (
                                    <>
                                        <Mail className="w-4 h-4" />
                                        <span>Send Verification Code</span>
                                    </>
                                )}
                            </button>
                        ) : timeLeft > 0 ? (
                            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 [data-theme='dark']_&:text-gray-400">
                                <Clock className="w-4 h-4" />
                                <span>Code expires in {formatTime(timeLeft)}</span>
                            </div>
                        ) : (
                            <button
                                onClick={sendVerificationCode}
                                disabled={isSending}
                                className="text-blue-500 hover:text-blue-600 text-sm font-medium disabled:opacity-50 transition-colors"
                            >
                                {isSending ? 'Sending...' : 'Send new code'}
                            </button>
                        )}
                    </div>

                    {isCodeSent && timeLeft > 0 && (
                        <>
                            {/* OTP Input */}
                            <div className="flex justify-center space-x-2 mb-6">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        // ref={el => inputRefs.current[index] = el}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        onPaste={index === 0 ? handlePaste : undefined}
                                        className="w-12 h-12 text-center text-lg font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:text-white transition-colors"
                                        disabled={isLoading}
                                    />
                                ))}
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="flex items-center justify-center space-x-2 text-red-600 [data-theme='dark']_&:text-red-400 text-sm mb-4">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    <span className="text-center">{error}</span>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex space-x-3">
                                <button
                                    onClick={handleClose}
                                    disabled={isLoading}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:text-gray-300 [data-theme='dark']_&:hover:bg-gray-700 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleVerify()}
                                    disabled={isLoading || otp.some(digit => digit === '')}
                                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-colors"
                                >
                                    {isLoading ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            <span>Verifying...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Check className="w-4 h-4" />
                                            <span>Verify</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Help Text */}
                            <div className="mt-4 text-center">
                                <p className="text-xs text-gray-500 [data-theme='dark']_&:text-gray-400">
                                    Didn&#39;t receive the code? Check your spam folder or{' '}
                                    {canResend ? (
                                        <button
                                            onClick={sendVerificationCode}
                                            disabled={isSending}
                                            className="text-blue-500 hover:text-blue-600 font-medium"
                                        >
                                            send a new one
                                        </button>
                                    ) : (
                                        <span>wait for the timer to expire</span>
                                    )}
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmailVerificationDialog;