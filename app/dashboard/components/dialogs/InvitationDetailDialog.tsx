// app/dashboard/components/dialogs/InvitationDetailDialog.tsx

'use client';

import { useState, useEffect } from 'react';
import { useInvitations, useAcceptInvitation, useRejectInvitation, useAllVessels } from '@/app/hooks/useApiQuery';

interface InvitationDetailDialogProps {
    isOpen: boolean;
    invitationId: number | null;
    onClose: () => void;
    onAction: () => void; // Called after successful accept/reject
}

export default function InvitationDetailDialog({
                                                   isOpen,
                                                   invitationId,
                                                   onClose,
                                                   onAction
                                               }: InvitationDetailDialogProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    // Fetch invitations data
    const { data: invitations = [], isLoading, error } = useInvitations();
    const { data: vessels = [] } = useAllVessels();

    // Mutation hooks for accept/reject actions
    const acceptMutation = useAcceptInvitation();
    const rejectMutation = useRejectInvitation();

    // Find the specific invitation
    const invitation = invitations.find(i => i.id === invitationId);

    // Find vessel details
    const vessel = vessels.find(v => v.id === invitation?.vessel_name); // This might need adjustment based on data structure

    // Handle dialog visibility with animation
    useEffect(() => {
        if (isOpen && invitationId) {
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
    }, [isOpen, invitationId]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'accept':
                return 'bg-green-100 text-green-800 [data-theme=\'dark\']_&:bg-green-900 [data-theme=\'dark\']_&:text-green-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 [data-theme=\'dark\']_&:bg-yellow-900 [data-theme=\'dark\']_&:text-yellow-200';
            case 'reject':
                return 'bg-red-100 text-red-800 [data-theme=\'dark\']_&:bg-red-900 [data-theme=\'dark\']_&:text-red-200';
            default:
                return 'bg-gray-100 text-gray-800 [data-theme=\'dark\']_&:bg-gray-700 [data-theme=\'dark\']_&:text-gray-200';
        }
    };

    const getDaysRemainingColor = (days: number, isExpired: boolean) => {
        if (isExpired) return 'text-red-600 [data-theme=\'dark\']_&:text-red-400';
        if (days <= 7) return 'text-yellow-600 [data-theme=\'dark\']_&:text-yellow-400';
        return 'text-green-600 [data-theme=\'dark\']_&:text-green-400';
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'accept':
                return 'Accepted';
            case 'reject':
                return 'Rejected';
            case 'pending':
                return 'Pending';
            default:
                return status;
        }
    };

    // Handle accept invitation
    const handleAccept = async () => {
        if (!invitation) return;

        if (window.confirm('Are you sure you want to accept this invitation?')) {
            try {
                await acceptMutation.mutateAsync(invitation.id);
                onAction(); // Notify parent to refresh and close dialog
            } catch (error) {
                console.error('Failed to accept invitation:', error);
                alert('Failed to accept invitation. Please try again.');
            }
        }
    };

    // Handle reject invitation
    const handleReject = async () => {
        if (!invitation) return;

        if (window.confirm('Are you sure you want to reject this invitation?')) {
            try {
                await rejectMutation.mutateAsync(invitation.id);
                onAction(); // Notify parent to refresh and close dialog
            } catch (error) {
                console.error('Failed to reject invitation:', error);
                alert('Failed to reject invitation. Please try again.');
            }
        }
    };

    const handleClose = () => {
        onClose();
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    if (!isVisible || !invitationId) return null;

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

    // Error state or invitation not found
    if (error || !invitation) {
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
                                {invitation ? 'Error loading invitation' : 'Invitation not found'}
                            </h3>
                            <div className="mt-2">
                                <p className="text-sm text-gray-500 [data-theme='dark']_&:text-gray-400">
                                    {invitation ? 'Unable to load invitation details. Please try again later.' : 'The requested invitation could not be found.'}
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

    const canTakeAction = invitation.status === 'pending' && !invitation.is_expired;

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
                        {/* Invitation Icon */}
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 [data-theme='dark']_&:text-white">Invitation Details</h2>
                            <div className="flex items-center space-x-3 mt-1">
                                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(invitation.status)}`}>
                                    {getStatusLabel(invitation.status)}
                                </span>
                                <span className="text-sm text-gray-500 [data-theme='dark']_&:text-gray-400">
                                    {invitation.role_name} Position
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
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

                {/* Invitation Status Banner */}
                <div className={`px-6 py-4 border-b border-gray-200 [data-theme='dark']_&:border-gray-600 ${
                    invitation.status === 'pending'
                        ? 'bg-yellow-50 [data-theme=\'dark\']_&:bg-yellow-900'
                        : invitation.status === 'accept'
                            ? 'bg-green-50 [data-theme=\'dark\']_&:bg-green-900'
                            : 'bg-red-50 [data-theme=\'dark\']_&:bg-red-900'
                }`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className={`text-lg font-semibold mb-2 ${
                                invitation.status === 'pending'
                                    ? 'text-yellow-900 [data-theme=\'dark\']_&:text-yellow-100'
                                    : invitation.status === 'accept'
                                        ? 'text-green-900 [data-theme=\'dark\']_&:text-green-100'
                                        : 'text-red-900 [data-theme=\'dark\']_&:text-red-100'
                            }`}>
                                Vessel Crew Invitation
                            </h3>
                            <div className="flex items-center space-x-4 text-sm">
                                <span className={invitation.status === 'pending'
                                    ? 'text-yellow-700 [data-theme=\'dark\']_&:text-yellow-300'
                                    : invitation.status === 'accept'
                                        ? 'text-green-700 [data-theme=\'dark\']_&:text-green-300'
                                        : 'text-red-700 [data-theme=\'dark\']_&:text-red-300'
                                }>
                                    Expires: {invitation.expired_date}
                                </span>
                                <span className={getDaysRemainingColor(invitation.days_remaining, invitation.is_expired)}>
                                    {invitation.is_expired
                                        ? `Expired ${Math.abs(invitation.days_remaining)} days ago`
                                        : `${invitation.days_remaining} days remaining`
                                    }
                                </span>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(invitation.status)}`}>
                                {getStatusLabel(invitation.status)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Details Content */}
                <div className="p-6">
                    {/* Company & Vessel Information */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        {/* Company Information */}
                        <div className="bg-gray-50 p-6 rounded-lg [data-theme='dark']_&:bg-gray-700">
                            <h4 className="font-semibold text-gray-800 [data-theme='dark']_&:text-gray-200 mb-4 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-blue-600 [data-theme='dark']_&:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                Company Information
                            </h4>
                            <div className="space-y-3">
                                <div>
                                    <span className="text-sm text-gray-600 [data-theme='dark']_&:text-gray-400">Company Name:</span>
                                    <p className="font-medium text-gray-900 [data-theme='dark']_&:text-white">{invitation.company_name}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-600 [data-theme='dark']_&:text-gray-400">Location:</span>
                                    <p className="font-medium text-gray-900 [data-theme='dark']_&:text-white">{invitation.company_location}</p>
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
                            <div className="space-y-3">
                                <div>
                                    <span className="text-sm text-gray-600 [data-theme='dark']_&:text-gray-400">Vessel Name:</span>
                                    <p className="font-medium text-gray-900 [data-theme='dark']_&:text-white">{invitation.vessel_name}</p>
                                </div>
                                {vessel && (
                                    <>
                                        <div>
                                            <span className="text-sm text-gray-600 [data-theme='dark']_&:text-gray-400">Vessel Type:</span>
                                            <p className="font-medium text-gray-900 [data-theme='dark']_&:text-white">{vessel.type}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-600 [data-theme='dark']_&:text-gray-400">IMO Number:</span>
                                            <p className="font-medium text-gray-900 [data-theme='dark']_&:text-white">{vessel.imo}</p>
                                        </div>
                                        {vessel.image && (
                                            <div className="mt-4">
                                                <img
                                                    src={vessel.image}
                                                    alt={vessel.name}
                                                    className="w-full h-32 object-cover rounded-md"
                                                />
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Role Information */}
                    <div className="bg-gray-50 p-6 rounded-lg mb-6 [data-theme='dark']_&:bg-gray-700">
                        <h4 className="font-semibold text-gray-800 [data-theme='dark']_&:text-gray-200 mb-4 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-blue-600 [data-theme='dark']_&:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Role & Responsibilities
                        </h4>
                        <div className="space-y-3">
                            <div>
                                <span className="text-sm text-gray-600 [data-theme='dark']_&:text-gray-400">Position:</span>
                                <p className="font-medium text-gray-900 [data-theme='dark']_&:text-white text-lg">{invitation.role_name}</p>
                            </div>
                            <div>
                                <span className="text-sm text-gray-600 [data-theme='dark']_&:text-gray-400">Description:</span>
                                <p className="text-gray-900 [data-theme='dark']_&:text-white mt-1">{invitation.role_description}</p>
                            </div>
                        </div>
                    </div>

                    {/* Invitation Details */}
                    <div className="bg-gray-50 p-6 rounded-lg mb-6 [data-theme='dark']_&:bg-gray-700">
                        <h4 className="font-semibold text-gray-800 [data-theme='dark']_&:text-gray-200 mb-4 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-blue-600 [data-theme='dark']_&:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Invitation Details
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <span className="text-sm text-gray-600 [data-theme='dark']_&:text-gray-400">Email Address:</span>
                                <p className="font-medium text-gray-900 [data-theme='dark']_&:text-white">{invitation.email}</p>
                            </div>
                            <div>
                                <span className="text-sm text-gray-600 [data-theme='dark']_&:text-gray-400">Invitation Date:</span>
                                <p className="font-medium text-gray-900 [data-theme='dark']_&:text-white">{invitation.created_date}</p>
                            </div>
                            <div>
                                <span className="text-sm text-gray-600 [data-theme='dark']_&:text-gray-400">Expiration Date:</span>
                                <p className="font-medium text-gray-900 [data-theme='dark']_&:text-white">{invitation.expired_date}</p>
                            </div>
                            <div>
                                <span className="text-sm text-gray-600 [data-theme='dark']_&:text-gray-400">Status:</span>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invitation.status)}`}>
                                    {getStatusLabel(invitation.status)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 [data-theme='dark']_&:border-gray-600">
                        <button
                            onClick={handleClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 [data-theme='dark']_&:bg-gray-600 [data-theme='dark']_&:text-gray-200 [data-theme='dark']_&:border-gray-500 [data-theme='dark']_&:hover:bg-gray-500"
                        >
                            Close
                        </button>

                        {canTakeAction && (
                            <>
                                <button
                                    onClick={handleReject}
                                    disabled={rejectMutation.isPending}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {rejectMutation.isPending ? 'Rejecting...' : 'Reject Invitation'}
                                </button>
                                <button
                                    onClick={handleAccept}
                                    disabled={acceptMutation.isPending}
                                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {acceptMutation.isPending ? 'Accepting...' : 'Accept Invitation'}
                                </button>
                            </>
                        )}

                        {!canTakeAction && invitation.status === 'pending' && invitation.is_expired && (
                            <div className="px-4 py-2 text-sm font-medium text-gray-500 bg-gray-100 border border-gray-300 rounded-md [data-theme='dark']_&:bg-gray-600 [data-theme='dark']_&:text-gray-400 [data-theme='dark']_&:border-gray-500">
                                Invitation Expired
                            </div>
                        )}

                        {(invitation.status === 'accept' || invitation.status === 'reject') && (
                            <div className={`px-4 py-2 text-sm font-medium rounded-md ${
                                invitation.status === 'accept'
                                    ? 'text-green-700 bg-green-100 border border-green-300 [data-theme=\'dark\']_&:bg-green-900 [data-theme=\'dark\']_&:text-green-200 [data-theme=\'dark\']_&:border-green-700'
                                    : 'text-red-700 bg-red-100 border border-red-300 [data-theme=\'dark\']_&:bg-red-900 [data-theme=\'dark\']_&:text-red-200 [data-theme=\'dark\']_&:border-red-700'
                            }`}>
                                Already {getStatusLabel(invitation.status)}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}