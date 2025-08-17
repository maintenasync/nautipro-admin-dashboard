// app/dashboard/components/dialogs/ContactUsDetailDialog.tsx

'use client';

import { useState, useEffect } from 'react';
import authService from '../../../services/authService'

// Define the API base URL. Replace this with your actual base URL.
const API_BASE_URL = 'https://dev-api.nautiproconnect.com/api/v1/web';

interface ContactUsMessage {
    id: number;
    name: string;
    email: string;
    phone: string;
    message: string;
    status: 'open' | 'pending' | 'closed';
    created_at: string;
    updated_at: string;
}

interface ContactUsDetailDialogProps {
    isOpen: boolean;
    messageId: number | null;
    onClose: () => void;
    onStatusUpdate: () => void;
}

export default function ContactUsDetailDialog({
                                                  isOpen,
                                                  messageId,
                                                  onClose,
                                                  onStatusUpdate
                                              }: ContactUsDetailDialogProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    // New state to manage the fetched message data
    const [messagesData, setMessagesData] = useState<ContactUsMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Function to fetch all messages directly from the API
    const fetchMessages = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/all-contact-us`, {
                method: 'GET',
                headers: authService.getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch messages.');
            }

            const result = await response.json();
            setMessagesData(result.data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Find the specific message from the fetched data
    const message = messagesData.find(m => m.id === messageId);

    // Handle dialog visibility with animation and data fetching
    useEffect(() => {
        if (isOpen && messageId) {
            document.body.style.overflow = 'hidden';
            setIsVisible(true);
            setTimeout(() => setIsAnimating(true), 10);

            // Fetch messages when the dialog opens
            fetchMessages();
        } else {
            document.body.style.overflow = 'unset';
            setIsAnimating(false);
            setTimeout(() => setIsVisible(false), 200);
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, messageId]);

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'open':
                return 'bg-blue-100 text-blue-800 [data-theme=\'dark\']_&:bg-blue-900 [data-theme=\'dark\']_&:text-blue-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 [data-theme=\'dark\']_&:bg-yellow-900 [data-theme=\'dark\']_&:text-yellow-200';
            case 'closed':
                return 'bg-green-100 text-green-800 [data-theme=\'dark\']_&:bg-green-900 [data-theme=\'dark\']_&:text-green-200';
            default:
                return 'bg-gray-100 text-gray-800 [data-theme=\'dark\']_&:bg-gray-700 [data-theme=\'dark\']_&:text-gray-200';
        }
    };

    const formatDate = (timestamp: string) => {
        return new Date(parseInt(timestamp)).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleClose = () => {
        onClose();
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    const handleStatusUpdate = async (newStatus: 'open' | 'closed') => {
        if (!message) return;

        setIsUpdatingStatus(true);
        try {
            // Direct API call to update the status
            const response = await fetch(`${API_BASE_URL}/contact-us/${message.id}/${newStatus}`, {
                method: 'GET', // As per your API documentation, this is a GET method for updates
                headers: authService.getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error('Failed to update message status.');
            }

            // Await the response and handle accordingly
            await response.json();

            // Refresh messages list in the parent component
            onStatusUpdate();

            // Re-fetch messages to get the updated list for the dialog
            await fetchMessages();

        } catch (err) {
            console.error('Failed to update status:', err);
            // Handle error here, e.g., show a toast or message
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    if (!isVisible || !messageId) return null;

    // Loading state
    if (isLoading) {
        return (
            <div className={`fixed inset-0 flex items-center justify-center z-50 p-4 bg-opacity-50 backdrop-blur-sm`}>
                <div className="bg-white rounded-lg w-full max-w-4xl p-8 shadow-2xl animate-pulse [data-theme='dark']_&:bg-gray-800">
                    <div className="flex items-center space-x-4 mb-6">
                        <div className="w-16 h-16 bg-gray-200 rounded-full [data-theme='dark']_&:bg-gray-700"></div>
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
        );
    }

    // Error state or message not found
    if (error || !message) {
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
                                {message ? 'Error loading message' : 'Message not found'}
                            </h3>
                            <div className="mt-2">
                                <p className="text-sm text-gray-500 [data-theme='dark']_&:text-gray-400">
                                    {message ? 'Unable to load message details. Please try again later.' : 'The requested message could not be found.'}
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
                        {/* Message Icon */}
                        <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-xl">
                                {message.name.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 [data-theme='dark']_&:text-white">Contact Message</h2>
                            <div className="flex items-center space-x-3 mt-1">
                                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(message.status)}`}>
                                    {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                                </span>
                                <span className="text-sm text-gray-500 [data-theme='dark']_&:text-gray-400">
                                    ID: {message.id}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        {/* Status Update Buttons */}
                        {message.status !== 'open' && (
                            <button
                                onClick={() => handleStatusUpdate('open')}
                                disabled={isUpdatingStatus}
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-150 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isUpdatingStatus ? 'Updating...' : 'Mark as Open'}
                            </button>
                        )}
                        {message.status !== 'closed' && (
                            <button
                                onClick={() => handleStatusUpdate('closed')}
                                disabled={isUpdatingStatus}
                                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors duration-150 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isUpdatingStatus ? 'Updating...' : 'Mark as Closed'}
                            </button>
                        )}
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

                {/* Message Content */}
                <div className="p-6">
                    {/* Sender Information Card */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg mb-6 [data-theme='dark']_&:from-blue-900 [data-theme='dark']_&:to-indigo-900">
                        <h3 className="text-lg font-semibold text-blue-900 [data-theme='dark']_&:text-blue-100 mb-4 flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Sender Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-blue-700 [data-theme='dark']_&:text-blue-300 font-medium">Name:</label>
                                <p className="text-blue-900 [data-theme='dark']_&:text-blue-100 font-semibold">{message.name}</p>
                            </div>
                            <div>
                                <label className="text-sm text-blue-700 [data-theme='dark']_&:text-blue-300 font-medium">Email:</label>
                                <p className="text-blue-900 [data-theme='dark']_&:text-blue-100 font-semibold">{message.email}</p>
                            </div>
                            {message.phone && (
                                <div>
                                    <label className="text-sm text-blue-700 [data-theme='dark']_&:text-blue-300 font-medium">Phone:</label>
                                    <p className="text-blue-900 [data-theme='dark']_&:text-blue-100 font-semibold">{message.phone}</p>
                                </div>
                            )}
                            <div>
                                <label className="text-sm text-blue-700 [data-theme='dark']_&:text-blue-300 font-medium">Status:</label>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(message.status)}`}>
                                    {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Message Content */}
                    <div className="bg-gray-50 p-6 rounded-lg mb-6 [data-theme='dark']_&:bg-gray-700">
                        <h4 className="font-semibold text-gray-800 [data-theme='dark']_&:text-gray-200 mb-4 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-blue-600 [data-theme='dark']_&:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                            </svg>
                            Message Content
                        </h4>
                        <div className="bg-white p-4 rounded-md border-l-4 border-blue-500 [data-theme='dark']_&:bg-gray-600">
                            <p className="text-gray-800 [data-theme='dark']_&:text-gray-200 leading-relaxed whitespace-pre-wrap">
                                {message.message}
                            </p>
                        </div>
                    </div>

                    {/* Timestamps */}
                    <div className="bg-gray-50 p-6 rounded-lg [data-theme='dark']_&:bg-gray-700">
                        <h4 className="font-semibold text-gray-800 [data-theme='dark']_&:text-gray-200 mb-4 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-blue-600 [data-theme='dark']_&:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Timeline
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="text-center p-4 bg-white rounded-lg [data-theme='dark']_&:bg-gray-600">
                                <div className="text-lg font-bold text-gray-900 [data-theme='dark']_&:text-white mb-2">
                                    {formatDate(message.created_at)}
                                </div>
                                <div className="text-sm text-gray-600 [data-theme='dark']_&:text-gray-400">Message Received</div>
                            </div>
                            <div className="text-center p-4 bg-white rounded-lg [data-theme='dark']_&:bg-gray-600">
                                <div className="text-lg font-bold text-gray-900 [data-theme='dark']_&:text-white mb-2">
                                    {formatDate(message.updated_at)}
                                </div>
                                <div className="text-sm text-gray-600 [data-theme='dark']_&:text-gray-400">Last Updated</div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200 [data-theme='dark']_&:border-gray-600">
                        <div className="flex space-x-3">
                            {/* Email Reply Button */}
                            <a
                                href={`mailto:${message.email}?subject=Re: Contact Message - ${message.name}`}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                Reply via Email
                            </a>

                            {message.phone && (
                                <a
                                    href={`tel:${message.phone}`}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 [data-theme='dark']_&:bg-gray-600 [data-theme='dark']_&:text-gray-200 [data-theme='dark']_&:border-gray-500 [data-theme='dark']_&:hover:bg-gray-500"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    Call
                                </a>
                            )}
                        </div>

                        <button
                            onClick={handleClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 [data-theme='dark']_&:bg-gray-600 [data-theme='dark']_&:text-gray-200 [data-theme='dark']_&:border-gray-500 [data-theme='dark']_&:hover:bg-gray-500"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

