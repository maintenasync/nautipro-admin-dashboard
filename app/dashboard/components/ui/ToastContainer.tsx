// app/dashboard/components/ui/ToastContainer.tsx

'use client';

import { Toast } from '../../../hooks/useToast';
import NotificationToast from './NotificationToast';

interface ToastContainerProps {
    toasts: Toast[];
    removeToast: (id: string) => void;
}

export default function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
    return (
        <div className="fixed top-4 right-4 z-50 space-y-2">
            {toasts.map((toast) => (
                <NotificationToast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    isVisible={true}
                    onClose={() => removeToast(toast.id)}
                    duration={toast.duration}
                />
            ))}
        </div>
    );
}