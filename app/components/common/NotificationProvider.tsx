import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Check, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

interface Notification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
}

interface NotificationContextType {
    showNotification: (type: Notification['type'], message: string, duration?: number) => string;
    removeNotification: (id: string) => void;
    clearAllNotifications: () => void;
    showSuccess: (message: string, duration?: number) => string;
    showError: (message: string, duration?: number) => string;
    showWarning: (message: string, duration?: number) => string;
    showInfo: (message: string, duration?: number) => string;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

interface NotificationItemProps {
    notification: Notification;
    onRemove: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onRemove }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);

    useEffect(() => {
        // Animate in
        const timer = setTimeout(() => setIsVisible(true), 50);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (notification.duration && notification.duration > 0) {
            const timer = setTimeout(() => {
                handleRemove();
            }, notification.duration);
            return () => clearTimeout(timer);
        }
    }, [notification.duration]);

    const handleRemove = () => {
        setIsRemoving(true);
        setTimeout(() => {
            onRemove(notification.id);
        }, 300);
    };

    const getIcon = () => {
        switch (notification.type) {
            case 'success':
                return <Check className="w-5 h-5" />;
            case 'error':
                return <AlertCircle className="w-5 h-5" />;
            case 'warning':
                return <AlertTriangle className="w-5 h-5" />;
            case 'info':
                return <Info className="w-5 h-5" />;
            default:
                return <Info className="w-5 h-5" />;
        }
    };

    const getStyles = () => {
        const baseStyles = "border border-l-4 rounded-lg shadow-lg backdrop-blur-sm";

        switch (notification.type) {
            case 'success':
                return `${baseStyles} bg-green-50 border-green-500 text-green-800 [data-theme='dark']_&:bg-green-900/20 [data-theme='dark']_&:border-green-400 [data-theme='dark']_&:text-green-200`;
            case 'error':
                return `${baseStyles} bg-red-50 border-red-500 text-red-800 [data-theme='dark']_&:bg-red-900/20 [data-theme='dark']_&:border-red-400 [data-theme='dark']_&:text-red-200`;
            case 'warning':
                return `${baseStyles} bg-yellow-50 border-yellow-500 text-yellow-800 [data-theme='dark']_&:bg-yellow-900/20 [data-theme='dark']_&:border-yellow-400 [data-theme='dark']_&:text-yellow-200`;
            case 'info':
                return `${baseStyles} bg-blue-50 border-blue-500 text-blue-800 [data-theme='dark']_&:bg-blue-900/20 [data-theme='dark']_&:border-blue-400 [data-theme='dark']_&:text-blue-200`;
            default:
                return `${baseStyles} bg-gray-50 border-gray-500 text-gray-800 [data-theme='dark']_&:bg-gray-900/20 [data-theme='dark']_&:border-gray-400 [data-theme='dark']_&:text-gray-200`;
        }
    };

    return (
        <div
            className={`
        ${getStyles()}
        transform transition-all duration-300 ease-in-out mb-3 max-w-md
        ${isVisible && !isRemoving ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'}
        ${isRemoving ? 'translate-x-full opacity-0 scale-95' : ''}
      `}
        >
            <div className="flex items-start p-4">
                <div className="flex-shrink-0 mr-3">
                    {getIcon()}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-5">
                        {notification.message}
                    </p>
                </div>
                <div className="flex-shrink-0 ml-3">
                    <button
                        onClick={handleRemove}
                        className="inline-flex rounded-md p-1.5 hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-current transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

interface NotificationProviderProps {
    children: ReactNode;
    maxNotifications?: number;
    defaultDuration?: number;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
                                                                              children,
                                                                              maxNotifications = 5,
                                                                              defaultDuration = 5000
                                                                          }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const showNotification = (
        type: Notification['type'],
        message: string,
        duration: number = defaultDuration
    ): string => {
        const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        const notification: Notification = { id, type, message, duration };

        setNotifications(prev => {
            const newNotifications = [notification, ...prev];
            // Limit the number of notifications
            return newNotifications.slice(0, maxNotifications);
        });

        return id;
    };

    const removeNotification = (id: string) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    };

    const clearAllNotifications = () => {
        setNotifications([]);
    };

    const showSuccess = (message: string, duration?: number) =>
        showNotification('success', message, duration);

    const showError = (message: string, duration?: number) =>
        showNotification('error', message, duration);

    const showWarning = (message: string, duration?: number) =>
        showNotification('warning', message, duration);

    const showInfo = (message: string, duration?: number) =>
        showNotification('info', message, duration);

    const value: NotificationContextType = {
        showNotification,
        removeNotification,
        clearAllNotifications,
        showSuccess,
        showError,
        showWarning,
        showInfo,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}

            {/* Notification Container */}
            {notifications.length > 0 && (
                <div className="fixed top-4 right-4 z-50 pointer-events-none">
                    <div className="space-y-2 pointer-events-auto">
                        {notifications.map((notification) => (
                            <NotificationItem
                                key={notification.id}
                                notification={notification}
                                onRemove={removeNotification}
                            />
                        ))}
                    </div>
                </div>
            )}
        </NotificationContext.Provider>
    );
};