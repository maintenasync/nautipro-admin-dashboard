// components/ProtectedRoute.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: string;
    fallbackComponent?: React.ReactNode;
    redirectTo?: string;
}

// Loading Spinner Component
const LoadingSpinner = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 [data-theme='dark']_&:bg-gray-900">
        <div className="flex flex-col items-center space-y-4">
            {/* Main Spinner */}
            <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-blue-400 rounded-full animate-spin animate-reverse"></div>
            </div>

            {/* Loading Text */}
            <div className="text-center">
                <p className="text-lg font-medium text-gray-700 [data-theme='dark']_&:text-gray-300">
                    Loading Dashboard
                </p>
                <p className="text-sm text-gray-500 [data-theme='dark']_&:text-gray-400 mt-1">
                    Please wait while we verify your authentication...
                </p>
            </div>

            {/* Loading Dots */}
            <div className="flex space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
        </div>
    </div>
);

// Access Denied Component
const AccessDenied = ({ userRole, requiredRole }: { userRole?: string; requiredRole: string }) => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 [data-theme='dark']_&:bg-gray-900">
        <div className="max-w-md w-full mx-4">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center [data-theme='dark']_&:bg-gray-800">
                {/* Warning Icon */}
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 [data-theme='dark']_&:bg-red-900/30">
                    <svg className="w-8 h-8 text-red-600 [data-theme='dark']_&:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                </div>

                <h2 className="text-2xl font-bold text-gray-800 [data-theme='dark']_&:text-white mb-2">
                    Access Denied
                </h2>

                <p className="text-gray-600 [data-theme='dark']_&:text-gray-400 mb-6">
                    You don&#39;t have permission to access this page.
                </p>

                <div className="bg-gray-50 rounded-lg p-4 mb-6 [data-theme='dark']_&:bg-gray-700">
                    <div className="text-sm">
                        <p className="text-gray-600 [data-theme='dark']_&:text-gray-400">Your Role:</p>
                        <p className="font-medium text-gray-800 [data-theme='dark']_&:text-white">{userRole || 'Unknown'}</p>
                        <p className="text-gray-600 [data-theme='dark']_&:text-gray-400 mt-2">Required Role:</p>
                        <p className="font-medium text-gray-800 [data-theme='dark']_&:text-white">{requiredRole}</p>
                    </div>
                </div>

                <button
                    onClick={() => window.history.back()}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                    Go Back
                </button>
            </div>
        </div>
    </div>
);

export default function ProtectedRoute({
                                           children,
                                           requiredRole,
                                           fallbackComponent,
                                           redirectTo = '/login'
                                       }: ProtectedRouteProps) {
    const { state } = useAuth();
    const router = useRouter();
    const [hasRedirected, setHasRedirected] = useState(false);

    useEffect(() => {
        // Hanya lakukan pengecekan dan redirect setelah initialization selesai
        if (state.isInitialized && !state.isAuthenticated && !hasRedirected) {
            setHasRedirected(true);
            router.push(redirectTo);
        }
    }, [state.isAuthenticated, state.isInitialized, router, redirectTo, hasRedirected]);

    // Case 1: Masih dalam proses initialization
    if (!state.isInitialized) {
        return fallbackComponent || <LoadingSpinner />;
    }

    // Case 2: Sedang loading (operasi auth)
    if (state.isLoading) {
        return fallbackComponent || <LoadingSpinner />;
    }

    // Case 3: Tidak authenticated setelah initialization selesai
    if (!state.isAuthenticated) {
        // Return null karena akan redirect via useEffect
        return null;
    }

    // Case 4: Authenticated tapi tidak memiliki role yang diperlukan
    if (requiredRole && state.user?.role !== requiredRole) {
        return <AccessDenied userRole={state.user?.role} requiredRole={requiredRole} />;
    }

    // Case 5: Semua persyaratan terpenuhi, render children
    return <>{children}</>;
}

// HOC untuk membuat ProtectedRoute dengan role specific
export const withRoleProtection = (requiredRole: string) => {
    return function ProtectedRoleComponent({ children }: { children: React.ReactNode }) {
        return (
            <ProtectedRoute requiredRole={requiredRole}>
                {children}
            </ProtectedRoute>
        );
    };
};

// Pre-defined role-based components
export const AdminProtectedRoute = withRoleProtection('Admin');
export const ManagerProtectedRoute = withRoleProtection('Manager');
export const SuperintendentProtectedRoute = withRoleProtection('Superintendent');
export const CaptainProtectedRoute = withRoleProtection('Captain');