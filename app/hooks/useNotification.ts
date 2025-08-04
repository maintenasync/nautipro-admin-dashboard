// app/hooks/useNotification.ts

import { useState, useEffect, useCallback } from 'react';
import { UI_CONFIG } from '../config/constants';

export interface Notification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
}

export const useNotification = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const showNotification = useCallback((
        type: Notification['type'],
        message: string,
        duration: number = UI_CONFIG.NOTIFICATION_DURATION
    ) => {
        const id = Date.now().toString();
        const notification: Notification = { id, type, message, duration };

        setNotifications(prev => [...prev, notification]);

        if (duration > 0) {
            setTimeout(() => {
                removeNotification(id);
            }, duration);
        }

        return id;
    }, []);

    const removeNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    }, []);

    const clearAllNotifications = useCallback(() => {
        setNotifications([]);
    }, []);

    // Convenience methods
    const showSuccess = useCallback((message: string, duration?: number) =>
        showNotification('success', message, duration), [showNotification]);

    const showError = useCallback((message: string, duration?: number) =>
        showNotification('error', message, duration), [showNotification]);

    const showWarning = useCallback((message: string, duration?: number) =>
        showNotification('warning', message, duration), [showNotification]);

    const showInfo = useCallback((message: string, duration?: number) =>
        showNotification('info', message, duration), [showNotification]);

    return {
        notifications,
        showNotification,
        removeNotification,
        clearAllNotifications,
        showSuccess,
        showError,
        showWarning,
        showInfo,
    };
};