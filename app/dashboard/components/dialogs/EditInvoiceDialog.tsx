// app/dashboard/components/dialogs/EditInvoiceDialog.tsx

'use client';

import { useState, useEffect } from 'react';
import { useUpdateInvoice, useUploadPaymentReceipt } from '@/app/hooks/useApiQuery';
import type { InvoiceUI, UpdateInvoiceRequest } from '@/app/types/invoice';

interface EditInvoiceDialogProps {
    isOpen: boolean;
    invoice: InvoiceUI | null;
    onClose: () => void;
    onSuccess: () => void;
}

export default function EditInvoiceDialog({
                                              isOpen,
                                              invoice,
                                              onClose,
                                              onSuccess
                                          }: EditInvoiceDialogProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [formData, setFormData] = useState<UpdateInvoiceRequest>({
        id: 0,
        price: '',
        payment_method: 'BANK',
        payment_status: false,
        paid_at: '',
        payment_receipt: ''
    });
    const [error, setError] = useState<string | null>(null);
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [receiptPreview, setReceiptPreview] = useState<string | null>(null);

    const updateInvoiceMutation = useUpdateInvoice();
    const uploadReceiptMutation = useUploadPaymentReceipt();

    const paymentMethods = [
        { value: 'BANK', label: 'Bank Transfer' },
        { value: 'BCA', label: 'BCA' },
        { value: 'BNI', label: 'BNI' },
        { value: 'BRI', label: 'BRI' },
        { value: 'Mandiri', label: 'Mandiri' },
        { value: 'Gopay', label: 'GoPay' },
        { value: 'OVO', label: 'OVO' },
        { value: 'DANA', label: 'DANA' },
        { value: 'ShopeePay', label: 'ShopeePay' },
        { value: 'LinkAja', label: 'LinkAja' }
    ];

    useEffect(() => {
        if (isOpen && invoice) {
            document.body.style.overflow = 'hidden';
            setIsVisible(true);
            setTimeout(() => setIsAnimating(true), 10);

            // Initialize form with invoice data
            const paidAtTimestamp = invoice.paid_at && invoice.paid_at !== '0' && invoice.paid_at !== ''
                ? new Date(parseInt(invoice.paid_at)).toISOString().split('T')[0]
                : '';

            setFormData({
                id: invoice.id,
                price: invoice.price,
                payment_method: invoice.payment_method,
                payment_status: invoice.payment_status === 'Paid',
                paid_at: paidAtTimestamp,
                payment_receipt: invoice.payment_receipt
            });
        } else {
            document.body.style.overflow = 'unset';
            setIsAnimating(false);
            setTimeout(() => setIsVisible(false), 200);
            setError(null);
            setReceiptFile(null);
            setReceiptPreview(null);
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, invoice]);

    const handleInputChange = (field: keyof UpdateInvoiceRequest, value: string | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        if (error) setError(null);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setError('Please select an image file for payment receipt');
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('File size must be less than 5MB');
                return;
            }

            setReceiptFile(file);

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setReceiptPreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const validateForm = () => {
        if (!formData.price.trim()) {
            setError('Price is required');
            return false;
        }

        const priceNumber = parseFloat(formData.price);
        if (isNaN(priceNumber) || priceNumber <= 0) {
            setError('Price must be a valid positive number');
            return false;
        }

        if (!formData.payment_method) {
            setError('Payment method is required');
            return false;
        }

        if (formData.payment_status && !formData.paid_at) {
            setError('Paid date is required when marking as paid');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            // Prepare update data
            const updateData: UpdateInvoiceRequest = {
                ...formData,
                paid_at: formData.payment_status && formData.paid_at
                    ? new Date(formData.paid_at).getTime().toString()
                    : ''
            };

            // Upload receipt file if provided
            if (receiptFile && formData.id) {
                await uploadReceiptMutation.mutateAsync({
                    invoiceId: formData.id,
                    receiptFile
                });
            }

            // Update invoice
            await updateInvoiceMutation.mutateAsync(updateData);

            onSuccess();
            handleClose();
        } catch (err: any) {
            setError(err.message || 'Failed to update invoice');
        }
    };

    const handleClose = () => {
        setFormData({
            id: 0,
            price: '',
            payment_method: 'BANK',
            payment_status: false,
            paid_at: '',
            payment_receipt: ''
        });
        setReceiptFile(null);
        setReceiptPreview(null);
        onClose();
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    if (!isVisible || !invoice) return null;

    const isLoading = updateInvoiceMutation.isPending || uploadReceiptMutation.isPending;

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
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 [data-theme='dark']_&:text-white">
                                Edit Invoice
                            </h2>
                            <p className="text-sm text-gray-500 [data-theme='dark']_&:text-gray-400">
                                {invoice.invoice_code}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 p-2 rounded-md hover:bg-gray-100 transition-colors duration-150 [data-theme='dark']_&:hover:bg-gray-700"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-4 [data-theme='dark']_&:bg-red-900 [data-theme='dark']_&:border-red-700">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700 [data-theme='dark']_&:text-red-200">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Price */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 [data-theme='dark']_&:text-gray-300 mb-2">
                                Price <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-gray-500 [data-theme='dark']_&:text-gray-400">Rp</span>
                                <input
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => handleInputChange('price', e.target.value)}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:text-white"
                                    placeholder="Enter invoice amount"
                                    min="0"
                                    step="1000"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 [data-theme='dark']_&:text-gray-300 mb-2">
                                Payment Method <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.payment_method}
                                onChange={(e) => handleInputChange('payment_method', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:text-white"
                                disabled={isLoading}
                            >
                                {paymentMethods.map((method) => (
                                    <option key={method.value} value={method.value}>
                                        {method.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Payment Status */}
                    <div>
                        <div className="flex items-center space-x-3">
                            <input
                                type="checkbox"
                                id="payment_status"
                                checked={formData.payment_status}
                                onChange={(e) => handleInputChange('payment_status', e.target.checked)}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                disabled={isLoading}
                            />
                            <label htmlFor="payment_status" className="text-sm font-medium text-gray-700 [data-theme='dark']_&:text-gray-300">
                                Mark as Paid
                            </label>
                        </div>
                    </div>

                    {/* Paid Date - Show only if payment_status is true */}
                    {formData.payment_status && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 [data-theme='dark']_&:text-gray-300 mb-2">
                                Paid Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={formData.paid_at}
                                onChange={(e) => handleInputChange('paid_at', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:text-white"
                                disabled={isLoading}
                            />
                        </div>
                    )}

                    {/* Payment Receipt Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 [data-theme='dark']_&:text-gray-300 mb-2">
                            Payment Receipt
                        </label>

                        {/* Current Receipt */}
                        {invoice.payment_receipt && !receiptPreview && (
                            <div className="mb-3">
                                <p className="text-sm text-gray-600 [data-theme='dark']_&:text-gray-400 mb-2">Current receipt:</p>
                                <img
                                    src={invoice.payment_receipt}
                                    alt="Current payment receipt"
                                    className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                                />
                            </div>
                        )}

                        {/* New Receipt Preview */}
                        {receiptPreview && (
                            <div className="mb-3">
                                <p className="text-sm text-gray-600 [data-theme='dark']_&:text-gray-400 mb-2">New receipt preview:</p>
                                <img
                                    src={receiptPreview}
                                    alt="Receipt preview"
                                    className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                                />
                            </div>
                        )}

                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:text-white"
                            disabled={isLoading}
                        />
                        <p className="text-xs text-gray-500 [data-theme='dark']_&:text-gray-400 mt-1">
                            Upload payment receipt image (max 5MB)
                        </p>
                    </div>

                    {/* Preview */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:border-gray-600">
                        <h4 className="text-sm font-medium text-gray-800 [data-theme='dark']_&:text-gray-200 mb-2">Invoice Preview</h4>
                        <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600 [data-theme='dark']_&:text-gray-400">Invoice Code:</span>
                                <span className="font-medium text-gray-900 [data-theme='dark']_&:text-white">
                                    {invoice.invoice_code}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 [data-theme='dark']_&:text-gray-400">Amount:</span>
                                <span className="font-medium text-gray-900 [data-theme='dark']_&:text-white">
                                    Rp {parseInt(formData.price || '0').toLocaleString('id-ID')}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 [data-theme='dark']_&:text-gray-400">Payment Method:</span>
                                <span className="font-medium text-gray-900 [data-theme='dark']_&:text-white">
                                    {paymentMethods.find(m => m.value === formData.payment_method)?.label}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 [data-theme='dark']_&:text-gray-400">Status:</span>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                    formData.payment_status
                                        ? 'bg-green-100 text-green-800 [data-theme=\'dark\']_&:bg-green-900/30 [data-theme=\'dark\']_&:text-green-300'
                                        : 'bg-red-100 text-red-800 [data-theme=\'dark\']_&:bg-red-900/30 [data-theme=\'dark\']_&:text-red-300'
                                }`}>
                                    {formData.payment_status ? 'Paid' : 'Unpaid'}
                                </span>
                            </div>
                            {formData.payment_status && formData.paid_at && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600 [data-theme='dark']_&:text-gray-400">Paid Date:</span>
                                    <span className="font-medium text-gray-900 [data-theme='dark']_&:text-white">
                                        {new Date(formData.paid_at).toLocaleDateString('id-ID')}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 [data-theme='dark']_&:border-gray-600">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:text-gray-200 [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:hover:bg-gray-600"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                            disabled={isLoading}
                        >
                            {isLoading && (
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            )}
                            <span>{isLoading ? 'Updating...' : 'Update Invoice'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}