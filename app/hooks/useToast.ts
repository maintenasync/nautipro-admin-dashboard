// app/hooks/useToast.ts

'use client';

import { useState, useCallback } from 'react';

export interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
}

export function useToast() {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newToast: Toast = {
            id,
            duration: 4000,
            ...toast
        };

        setToasts(prev => [...prev, newToast]);

        // Auto-remove toast after duration
        setTimeout(() => {
            removeToast(id);
        }, newToast.duration);

        return id;
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const showSuccess = useCallback((message: string, duration?: number) => {
        return showToast({ message, type: 'success', duration });
    }, [showToast]);

    const showError = useCallback((message: string, duration?: number) => {
        return showToast({ message, type: 'error', duration });
    }, [showToast]);

    const showWarning = useCallback((message: string, duration?: number) => {
        return showToast({ message, type: 'warning', duration });
    }, [showToast]);

    const showInfo = useCallback((message: string, duration?: number) => {
        return showToast({ message, type: 'info', duration });
    }, [showToast]);

    const clearAll = useCallback(() => {
        setToasts([]);
    }, []);

    return {
        toasts,
        showToast,
        removeToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        clearAll
    };
}