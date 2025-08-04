// app/dashboard/components/dialogs/LicenseDetailDialog.tsx

'use client';

import { useState, useEffect } from 'react';
import { useLicenses } from '@/app/hooks/useApiQuery';

interface LicenseDetailDialogProps {
    isOpen: boolean;
    licenseId: string | null;
    onClose: () => void;
}

export default function LicenseDetailDialog({
                                                isOpen,
                                                licenseId,
                                                onClose
                                            }: LicenseDetailDialogProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    // Fetch licenses data
    const { data: licenses = [], isLoading, error } = useLicenses();

    // Find the specific license
    const license = licenses.find(l => l.id === licenseId);

    // Handle dialog visibility with animation
    useEffect(() => {
        if (isOpen && licenseId) {
            document.body.style.overflow = 'hidden';
            setIsVisible(true);
            setTimeout(() => setIsAnimating(true), 10);
        } else {
            document.body.style.overflow = 'unset';
            setIsAnimating(false);
            setTimeout(() => setIsVisible(false), 200);
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, licenseId]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Valid':
                return 'bg-green-100 text-green-800 [data-theme=\'dark\']_&:bg-green-900 [data-theme=\'dark\']_&:text-green-200';
            case 'Expiring Soon':
                return 'bg-yellow-100 text-yellow-800 [data-theme=\'dark\']_&:bg-yellow-900 [data-theme=\'dark\']_&:text-yellow-200';
            case 'Expired':
                return 'bg-red-100 text-red-800 [data-theme=\'dark\']_&:bg-red-900 [data-theme=\'dark\']_&:text-red-200';
            default:
                return 'bg-gray-100 text-gray-800 [data-theme=\'dark\']_&:bg-gray-700 [data-theme=\'dark\']_&:text-gray-200';
        }
    };

    const getDaysRemainingColor = (days: number) => {
        if (days < 0) return 'text-red-600 [data-theme=\'dark\']_&:text-red-400';
        if (days <= 30) return 'text-yellow-600 [data-theme=\'dark\']_&:text-yellow-400';
        return 'text-green-600 [data-theme=\'dark\']_&:text-green-400';
    };

    const handleClose = () => {
        onClose();
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    if (!isVisible || !licenseId) return null;

    // Loading state
    if (isLoading) {
        return (
            <div className={`fixed inset-0 flex items-center justify-center z-50 p-4 bg-opacity-50 backdrop-blur-sm`}>
                <div className="bg-white rounded-lg w-full max-w-4xl p-8 shadow-2xl [data-theme='dark']_&:bg-gray-800">
                    <div className="animate-pulse">
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="w-16 h-16 bg-gray-200 rounded-lg [data-theme='dark']_&:bg-gray-700"></div>
                            <div className="space-y-2">
                                <div className="h-6 bg-gray-200 rounded w-48 [data-theme='dark']_&:bg-gray-700"></div>
                                <div className="h-4 bg-gray-200 rounded w-32 [data-theme='dark']_&:bg-gray-700"></div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="h-4 bg-gray-200 rounded [data-theme='dark']_&:bg-gray-700"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4 [data-theme='dark']_&:bg-gray-700"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2 [data-theme='dark']_&:bg-gray-700"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Error state or license not found
    if (error || !license) {
        return (
            <div className={`fixed inset-0 flex items-center justify-center z-50 p-4 bg-opacity-50 backdrop-blur-sm`}>
                <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-2xl [data-theme='dark']_&:bg-gray-800">
                    <div className="text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 [data-theme='dark']_&:bg-red-900">
                            <svg className="h-6 w-6 text-red-600 [data-theme='dark']_&:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 [data-theme='dark']_&:text-white">
                                {license ? 'Error loading license' : 'License not found'}
                            </h3>
                            <div className="mt-2">
                                <p className="text-sm text-gray-500 [data-theme='dark']_&:text-gray-400">
                                    {license ? 'Unable to load license details. Please try again later.' : 'The requested license could not be found.'}
                                </p>
                            </div>
                        </div>
                        <div className="mt-6">
                            <button
                                onClick={handleClose}
                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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
                className={`bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl transition-all duration-200 ease-out [data-theme='dark']_&:bg-gray-800 ${
                    isAnimating
                        ? 'scale-100 opacity-100 translate-y-0'
                        : 'scale-95 opacity-0 translate-y-4'
                }`}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 [data-theme='dark']_&:border-gray-600">
                    <div className="flex items-center space-x-4">
                        {/* License Icon */}
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 [data-theme='dark']_&:text-white">License Details</h2>
                            <div className="flex items-center space-x-3 mt-1">
                                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(license.status)}`}>
                                    {license.status}
                                </span>
                                <span className="text-sm text-gray-500 [data-theme='dark']_&:text-gray-400">
                                    {license.license_code}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        {/*<button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors duration-150 text-sm">*/}
                        {/*    Renew License*/}
                        {/*</button>*/}
                        {/*<button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-150 text-sm">*/}
                        {/*    Edit*/}
                        {/*</button>*/}
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-600 p-2 rounded-md hover:bg-gray-100 transition-colors duration-150 [data-theme='dark']_&:hover:bg-gray-700"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* License Details Content */}
                <div className="p-6">
                    {/* License Information Card */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg mb-6 [data-theme='dark']_&:from-blue-900 [data-theme='dark']_&:to-indigo-900">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-blue-900 [data-theme='dark']_&:text-blue-100 mb-2">
                                    License Code: {license.license_code}
                                </h3>
                                <div className="flex items-center space-x-4 text-sm">
                                    <span className="text-blue-700 [data-theme='dark']_&:text-blue-300">
                                        Valid Until: {license.valid_until}
                                    </span>
                                    <span className={`font-medium ${getDaysRemainingColor(license.days_remaining)}`}>
                                        {license.days_remaining < 0
                                            ? `Expired ${Math.abs(license.days_remaining)} days ago`
                                            : `${license.days_remaining} days remaining`
                                        }
                                    </span>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(license.status)}`}>
                                    {license.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Company Information */}
                        <div className="bg-gray-50 p-6 rounded-lg [data-theme='dark']_&:bg-gray-700">
                            <h4 className="font-semibold text-gray-800 [data-theme='dark']_&:text-gray-200 mb-4 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-blue-600 [data-theme='dark']_&:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                Company Information
                            </h4>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 [data-theme='dark']_&:text-gray-400">Company Name:</span>
                                    <span className="font-medium [data-theme='dark']_&:text-gray-200">{license.company_name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 [data-theme='dark']_&:text-gray-400">Location:</span>
                                    <span className="font-medium [data-theme='dark']_&:text-gray-200">{license.company_location}</span>
                                </div>
                            </div>
                        </div>

                        {/* Vessel Information */}
                        <div className="bg-gray-50 p-6 rounded-lg [data-theme='dark']_&:bg-gray-700">
                            <h4 className="font-semibold text-gray-800 [data-theme='dark']_&:text-gray-200 mb-4 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-blue-600 [data-theme='dark']_&:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                                Vessel Information
                            </h4>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 [data-theme='dark']_&:text-gray-400">Vessel Name:</span>
                                    <span className="font-medium [data-theme='dark']_&:text-gray-200">{license.vessel_name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 [data-theme='dark']_&:text-gray-400">IMO Number:</span>
                                    <span className="font-medium [data-theme='dark']_&:text-gray-200">{license.vessel_imo}</span>
                                </div>
                            </div>
                            {license.vessel_image && (
                                <div className="mt-4">
                                    <img
                                        src={license.vessel_image}
                                        alt={license.vessel_name}
                                        className="w-full h-32 object-cover rounded-md"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* License Status & Validity */}
                    <div className="bg-gray-50 p-6 rounded-lg mt-6 [data-theme='dark']_&:bg-gray-700">
                        <h4 className="font-semibold text-gray-800 [data-theme='dark']_&:text-gray-200 mb-4 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-blue-600 [data-theme='dark']_&:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            License Validity & Status
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-white rounded-lg [data-theme='dark']_&:bg-gray-600">
                                <div className="text-2xl font-bold text-gray-900 [data-theme='dark']_&:text-white mb-2">
                                    {license.valid_until}
                                </div>
                                <div className="text-sm text-gray-600 [data-theme='dark']_&:text-gray-400">Valid Until</div>
                            </div>
                            <div className="text-center p-4 bg-white rounded-lg [data-theme='dark']_&:bg-gray-600">
                                <div className={`text-2xl font-bold mb-2 ${getDaysRemainingColor(license.days_remaining)}`}>
                                    {Math.abs(license.days_remaining)}
                                </div>
                                <div className="text-sm text-gray-600 [data-theme='dark']_&:text-gray-400">
                                    {license.days_remaining < 0 ? 'Days Overdue' : 'Days Remaining'}
                                </div>
                            </div>
                            <div className="text-center p-4 bg-white rounded-lg [data-theme='dark']_&:bg-gray-600">
                                <div className="text-2xl font-bold mb-2">
                                    <span className={`inline-flex px-3 py-1 text-sm rounded-full ${getStatusColor(license.status)}`}>
                                        {license.status}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-600 [data-theme='dark']_&:text-gray-400">Current Status</div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200 [data-theme='dark']_&:border-gray-600">
                        <button
                            onClick={handleClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 [data-theme='dark']_&:bg-gray-600 [data-theme='dark']_&:text-gray-200 [data-theme='dark']_&:border-gray-500 [data-theme='dark']_&:hover:bg-gray-500"
                        >
                            Close
                        </button>
                        {/*<button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">*/}
                        {/*    Edit License*/}
                        {/*</button>*/}
                        {/*<button className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">*/}
                        {/*    Renew License*/}
                        {/*</button>*/}
                    </div>
                </div>
            </div>
        </div>
    );
}