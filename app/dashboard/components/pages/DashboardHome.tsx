// app/dashboard/components/pages/DashboardHome.tsx - Replace entire file

'use client';

import { useDashboardOverview } from '@/app/hooks/useApiQuery';
import { useAuth } from '@/app/contexts/AuthContext';

export default function DashboardHome() {
    const { data: overviewData, isLoading, error, refetch } = useDashboardOverview();
    const { state: authState } = useAuth();

    // Handle loading state
    if (isLoading) {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-800 [data-theme='dark']_&:text-white mb-4">Dashboard Overview</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((item) => (
                        <div key={item} className="bg-white p-6 rounded-lg shadow [data-theme='dark']_&:bg-gray-800 animate-pulse">
                            <div className="h-4 bg-gray-200 rounded [data-theme='dark']_&:bg-gray-700 mb-4"></div>
                            <div className="h-8 bg-gray-200 rounded [data-theme='dark']_&:bg-gray-700"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Handle error state
    if (error) {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-800 [data-theme='dark']_&:text-white mb-4">Dashboard Overview</h1>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 [data-theme='dark']_&:bg-red-900/20 [data-theme='dark']_&:border-red-800">
                    <div className="flex items-center">
                        <div className="text-red-400 mr-3">⚠️</div>
                        <div>
                            <h3 className="text-sm font-medium text-red-800 [data-theme='dark']_&:text-red-200">
                                Failed to load dashboard data
                            </h3>
                            <p className="text-sm text-red-600 [data-theme='dark']_&:text-red-300 mt-1">
                                {error instanceof Error ? error.message : 'An unexpected error occurred'}
                            </p>
                            <button
                                onClick={() => refetch()}
                                className="mt-2 text-sm text-red-600 hover:text-red-800 [data-theme='dark']_&:text-red-300 [data-theme='dark']_&:hover:text-red-200 underline"
                            >
                                Try again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 [data-theme='dark']_&:text-white">Dashboard Overview</h1>
                <div className="text-sm text-gray-500 [data-theme='dark']_&:text-gray-400">
                    Welcome back, {authState.user?.name}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Companies Card */}
                <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow [data-theme='dark']_&:bg-gray-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 [data-theme='dark']_&:text-gray-300">
                                Total Companies
                            </h3>
                            <p className="text-3xl font-bold text-blue-600 [data-theme='dark']_&:text-blue-400 mt-2">
                                {overviewData?.total_company || 0}
                            </p>
                        </div>
                        <div className="text-blue-500 text-3xl">🏢</div>
                    </div>
                    <div className="mt-4 text-sm text-gray-600 [data-theme='dark']_&:text-gray-400">
                        Registered companies
                    </div>
                </div>

                {/* Total Vessels Card */}
                <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow [data-theme='dark']_&:bg-gray-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 [data-theme='dark']_&:text-gray-300">
                                Total Vessels
                            </h3>
                            <p className="text-3xl font-bold text-green-600 [data-theme='dark']_&:text-green-400 mt-2">
                                {overviewData?.total_vessel || 0}
                            </p>
                        </div>
                        <div className="text-green-500 text-3xl">🚢</div>
                    </div>
                    <div className="mt-4 text-sm text-gray-600 [data-theme='dark']_&:text-gray-400">
                        Active vessels
                    </div>
                </div>

                {/* Total Licenses Card */}
                <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow [data-theme='dark']_&:bg-gray-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 [data-theme='dark']_&:text-gray-300">
                                Active Licenses
                            </h3>
                            <p className="text-3xl font-bold text-purple-600 [data-theme='dark']_&:text-purple-400 mt-2">
                                {overviewData?.total_license || 0}
                            </p>
                        </div>
                        <div className="text-purple-500 text-3xl">📋</div>
                    </div>
                    <div className="mt-4 text-sm text-gray-600 [data-theme='dark']_&:text-gray-400">
                        Valid licenses
                    </div>
                </div>

                {/* Quick Actions Card */}
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg shadow hover:shadow-lg transition-shadow [data-theme='dark']_&:from-orange-900/20 [data-theme='dark']_&:to-orange-800/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 [data-theme='dark']_&:text-gray-300">
                                Quick Actions
                            </h3>
                            <p className="text-sm text-gray-600 [data-theme='dark']_&:text-gray-400 mt-2">
                                Manage your fleet
                            </p>
                        </div>
                        <div className="text-orange-500 text-3xl">⚡</div>
                    </div>
                    <div className="mt-4">
                        <button
                            onClick={() => refetch()}
                            className="text-sm bg-orange-500 text-white px-3 py-1.5 rounded hover:bg-orange-600 transition-colors"
                        >
                            Refresh Data
                        </button>
                    </div>
                </div>
            </div>

            {/* Additional Info Section */}
            <div className="mt-8 bg-white rounded-lg shadow p-6 [data-theme='dark']_&:bg-gray-800">
                <h2 className="text-lg font-semibold text-gray-800 [data-theme='dark']_&:text-white mb-4">
                    System Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                        <span className="text-gray-600 [data-theme='dark']_&:text-gray-400">User Role:</span>
                        <span className="ml-2 font-medium text-gray-800 [data-theme='dark']_&:text-white">
                            {authState.user?.role || 'N/A'}
                        </span>
                    </div>
                    <div>
                        <span className="text-gray-600 [data-theme='dark']_&:text-gray-400">Last Updated:</span>
                        <span className="ml-2 font-medium text-gray-800 [data-theme='dark']_&:text-white">
                            {new Date().toLocaleString('id-ID')}
                        </span>
                    </div>
                    <div>
                        <span className="text-gray-600 [data-theme='dark']_&:text-gray-400">Status:</span>
                        <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 [data-theme='dark']_&:bg-green-900/30 [data-theme='dark']_&:text-green-300">
                            Active
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}