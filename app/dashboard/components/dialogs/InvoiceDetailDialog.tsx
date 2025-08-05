// app/dashboard/components/dialogs/InvoiceDetailDialog.tsx

'use client';

import { useState, useEffect } from 'react';
import { useInvoices } from '@/app/hooks/useApiQuery';
import { useAuth } from '@/app/contexts/AuthContext';
import type { InvoiceUI } from '@/app/types/invoice';

interface InvoiceDetailDialogProps {
    isOpen: boolean;
    invoiceId: number | null;
    onClose: () => void;
    onEdit?: (invoiceId: number) => void;
    onExportPDF?: (invoice: InvoiceUI) => void;
}

export default function InvoiceDetailDialog({
                                                isOpen,
                                                invoiceId,
                                                onClose,
                                                onEdit,
                                                onExportPDF
                                            }: InvoiceDetailDialogProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const { state: authState } = useAuth();

    // Fetch invoices data
    const { data: invoices = [], isLoading, error } = useInvoices();

    // Find the specific invoice
    const invoice = invoices.find(inv => inv.id === invoiceId);

    useEffect(() => {
        if (isOpen && invoiceId) {
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
    }, [isOpen, invoiceId]);

    const handleClose = () => {
        onClose();
    };

    const handleEdit = () => {
        if (invoice && onEdit) {
            onEdit(invoice.id);
        }
    };

    const handleExportPDF = () => {
        if (invoice && onExportPDF) {
            onExportPDF(invoice);
        }
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    if (!isVisible || !invoiceId) return null;

    // Loading state
    if (isLoading) {
        return (
            <div className={`fixed inset-0 flex items-center justify-center z-50 p-4 bg-opacity-50 backdrop-blur-sm`}>
                <div className="bg-white rounded-lg w-full max-w-2xl p-8 shadow-2xl [data-theme='dark']_&:bg-gray-800">
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

    // Error state or invoice not found
    if (error || !invoice) {
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
                                {invoice ? 'Error loading invoice' : 'Invoice not found'}
                            </h3>
                            <div className="mt-2">
                                <p className="text-sm text-gray-500 [data-theme='dark']_&:text-gray-400">
                                    {invoice ? 'Unable to load invoice details. Please try again later.' : 'The requested invoice could not be found.'}
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
                className={`bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl transition-all duration-200 ease-out [data-theme='dark']_&:bg-gray-800 ${
                    isAnimating
                        ? 'scale-100 opacity-100 translate-y-0'
                        : 'scale-95 opacity-0 translate-y-4'
                }`}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 [data-theme='dark']_&:border-gray-600">
                    <div className="flex items-center space-x-4">
                        {/* Invoice Icon */}
                        <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 [data-theme='dark']_&:text-white">Invoice Details</h2>
                            <div className="flex items-center space-x-3 mt-1">
                                <span className={`px-2 py-1 text-xs rounded-full ${invoice.status_color}`}>
                                    {invoice.payment_status}
                                </span>
                                <span className="text-sm text-gray-500 [data-theme='dark']_&:text-gray-400">
                                    {invoice.invoice_code}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={handleExportPDF}
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors duration-150 [data-theme='dark']_&:hover:bg-gray-700 [data-theme='dark']_&:hover:text-gray-200"
                            title="Export to PDF"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </button>
                        <button
                            onClick={handleEdit}
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors duration-150 [data-theme='dark']_&:hover:bg-gray-700 [data-theme='dark']_&:hover:text-gray-200"
                            title="Edit Invoice"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>
                        <button
                            onClick={handleClose}
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors duration-150 [data-theme='dark']_&:hover:bg-gray-700"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Invoice Information Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* Basic Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 [data-theme='dark']_&:text-white mb-4">
                                Invoice Information
                            </h3>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center py-2 border-b border-gray-100 [data-theme='dark']_&:border-gray-700">
                                    <span className="text-sm font-medium text-gray-600 [data-theme='dark']_&:text-gray-400">Invoice Code:</span>
                                    <span className="text-sm font-semibold text-gray-900 [data-theme='dark']_&:text-white">{invoice.invoice_code}</span>
                                </div>

                                <div className="flex justify-between items-center py-2 border-b border-gray-100 [data-theme='dark']_&:border-gray-700">
                                    <span className="text-sm font-medium text-gray-600 [data-theme='dark']_&:text-gray-400">Amount:</span>
                                    <span className="text-lg font-bold text-green-600 [data-theme='dark']_&:text-green-400">{invoice.formatted_price}</span>
                                </div>

                                <div className="flex justify-between items-center py-2 border-b border-gray-100 [data-theme='dark']_&:border-gray-700">
                                    <span className="text-sm font-medium text-gray-600 [data-theme='dark']_&:text-gray-400">Payment Method:</span>
                                    <span className="text-sm font-semibold text-gray-900 [data-theme='dark']_&:text-white">{invoice.payment_method}</span>
                                </div>

                                <div className="flex justify-between items-center py-2 border-b border-gray-100 [data-theme='dark']_&:border-gray-700">
                                    <span className="text-sm font-medium text-gray-600 [data-theme='dark']_&:text-gray-400">Status:</span>
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${invoice.status_color}`}>
                                        {invoice.payment_status}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center py-2 border-b border-gray-100 [data-theme='dark']_&:border-gray-700">
                                    <span className="text-sm font-medium text-gray-600 [data-theme='dark']_&:text-gray-400">Created Date:</span>
                                    <span className="text-sm text-gray-900 [data-theme='dark']_&:text-white">{invoice.formatted_created_at}</span>
                                </div>

                                {invoice.payment_status === 'Paid' && invoice.formatted_paid_at !== '-' && (
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100 [data-theme='dark']_&:border-gray-700">
                                        <span className="text-sm font-medium text-gray-600 [data-theme='dark']_&:text-gray-400">Paid Date:</span>
                                        <span className="text-sm text-gray-900 [data-theme='dark']_&:text-white">{invoice.formatted_paid_at}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Payment Receipt */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 [data-theme='dark']_&:text-white mb-4">
                                Payment Receipt
                            </h3>

                            {invoice.payment_receipt ? (
                                <div className="border border-gray-200 rounded-lg overflow-hidden [data-theme='dark']_&:border-gray-600">
                                    <img
                                        src={invoice.payment_receipt}
                                        alt="Payment Receipt"
                                        className="w-full h-64 object-cover"
                                    />
                                    <div className="p-3 bg-gray-50 [data-theme='dark']_&:bg-gray-700">
                                        <p className="text-xs text-gray-500 [data-theme='dark']_&:text-gray-400">Payment Receipt Image</p>
                                        <a
                                            href={invoice.payment_receipt}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-blue-600 hover:text-blue-800 [data-theme='dark']_&:text-blue-400 [data-theme='dark']_&:hover:text-blue-300"
                                        >
                                            View Full Size
                                        </a>
                                    </div>
                                </div>
                            ) : (
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center [data-theme='dark']_&:border-gray-600">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900 [data-theme='dark']_&:text-white">No receipt uploaded</h3>
                                    <p className="mt-1 text-sm text-gray-500 [data-theme='dark']_&:text-gray-400">
                                        Payment receipt has not been uploaded yet.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Invoice Summary Card */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 [data-theme='dark']_&:from-blue-900/20 [data-theme='dark']_&:to-indigo-900/20 [data-theme='dark']_&:border-blue-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-lg font-semibold text-blue-900 [data-theme='dark']_&:text-blue-200">Invoice Summary</h4>
                                <p className="text-sm text-blue-700 [data-theme='dark']_&:text-blue-300 mt-1">
                                    Complete invoice details and payment information
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-blue-900 [data-theme='dark']_&:text-blue-200">
                                    {invoice.formatted_price}
                                </div>
                                <div className="text-sm text-blue-700 [data-theme='dark']_&:text-blue-300">
                                    via {invoice.payment_method}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* User Information */}
                    {authState.user && (
                        <div className="mt-6 pt-6 border-t border-gray-200 [data-theme='dark']_&:border-gray-600">
                            <h3 className="text-sm font-medium text-gray-500 [data-theme='dark']_&:text-gray-400 mb-2">Billed To:</h3>
                            <div className="flex items-center space-x-3">
                                {authState.user.avatar && (
                                    <img
                                        src={authState.user.avatar}
                                        alt={authState.user.name}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                )}
                                <div>
                                    <p className="text-sm font-medium text-gray-900 [data-theme='dark']_&:text-white">
                                        {authState.user.name}
                                    </p>
                                    <p className="text-sm text-gray-500 [data-theme='dark']_&:text-gray-400">
                                        {authState.user.email}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:border-gray-600">
                    <div className="flex justify-between items-center">
                        <div className="text-xs text-gray-500 [data-theme='dark']_&:text-gray-400">
                            Last updated: {invoice.formatted_created_at}
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={handleExportPDF}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 [data-theme='dark']_&:bg-gray-600 [data-theme='dark']_&:text-gray-200 [data-theme='dark']_&:border-gray-500 [data-theme='dark']_&:hover:bg-gray-500 flex items-center space-x-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span>Export PDF</span>
                            </button>
                            <button
                                onClick={handleEdit}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center space-x-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                <span>Edit Invoice</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}