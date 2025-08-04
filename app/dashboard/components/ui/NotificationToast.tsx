// app/dashboard/components/ui/NotificationToast.tsx

'use client';

import { useEffect, useState } from 'react';

interface NotificationToastProps {
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    isVisible: boolean;
    onClose: () => void;
    duration?: number;
}

export default function NotificationToast({
                                              message,
                                              type,
                                              isVisible,
                                              onClose,
                                              duration = 4000
                                          }: NotificationToastProps) {
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (isVisible) {
            setIsAnimating(true);
            const timer = setTimeout(() => {
                handleClose();
            }, duration);

            return () => clearTimeout(timer);
        } else {
            setIsAnimating(false);
        }
    }, [isVisible, duration]);

    const handleClose = () => {
        setIsAnimating(false);
        setTimeout(() => {
            onClose();
        }, 150);
    };

    const getToastStyles = () => {
        switch (type) {
            case 'success':
                return 'bg-green-50 border-green-200 text-green-800 [data-theme=\'dark\']_&:bg-green-900 [data-theme=\'dark\']_&:border-green-700 [data-theme=\'dark\']_&:text-green-200';
            case 'error':
                return 'bg-red-50 border-red-200 text-red-800 [data-theme=\'dark\']_&:bg-red-900 [data-theme=\'dark\']_&:border-red-700 [data-theme=\'dark\']_&:text-red-200';
            case 'warning':
                return 'bg-yellow-50 border-yellow-200 text-yellow-800 [data-theme=\'dark\']_&:bg-yellow-900 [data-theme=\'dark\']_&:border-yellow-700 [data-theme=\'dark\']_&:text-yellow-200';
            case 'info':
                return 'bg-blue-50 border-blue-200 text-blue-800 [data-theme=\'dark\']_&:bg-blue-900 [data-theme=\'dark\']_&:border-blue-700 [data-theme=\'dark\']_&:text-blue-200';
            default:
                return 'bg-gray-50 border-gray-200 text-gray-800 [data-theme=\'dark\']_&:bg-gray-800 [data-theme=\'dark\']_&:border-gray-600 [data-theme=\'dark\']_&:text-gray-200';
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return (
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                );
            case 'error':
                return (
                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                );
            case 'warning':
                return (
                    <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                );
            case 'info':
                return (
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            default:
                return null;
        }
    };

    if (!isVisible) return null;

    return (
        <div className="fixed top-4 right-4 z-50">
            <div
                className={`max-w-sm w-full border rounded-lg p-4 shadow-lg transition-all duration-150 ease-out ${
                    isAnimating
                        ? 'translate-x-0 opacity-100'
                        : 'translate-x-full opacity-0'
                } ${getToastStyles()}`}
            >
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        {getIcon()}
                    </div>
                    <div className="ml-3 flex-1">
                        <p className="text-sm font-medium">{message}</p>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                        <button
                            onClick={handleClose}
                            className="rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none transition-colors duration-150"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}