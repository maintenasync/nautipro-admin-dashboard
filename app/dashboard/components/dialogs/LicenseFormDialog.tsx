// app/dashboard/components/dialogs/LicenseFormDialog.tsx

'use client';

import { useState, useEffect } from 'react';
import { useCompanies, useAllVessels } from '@/app/hooks/useApiQuery';

interface LicenseFormDialogProps {
    isOpen: boolean;
    licenseData?: any; // For edit mode
    onClose: () => void;
    onSuccess: () => void;
}

export default function LicenseFormDialog({
                                              isOpen,
                                              licenseData,
                                              onClose,
                                              onSuccess
                                          }: LicenseFormDialogProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [invoices, setInvoices] = useState<any[]>([]);
    const [invoicesLoading, setInvoicesLoading] = useState(false);

    const isEditMode = !!licenseData;

    // Form state
    const [formData, setFormData] = useState({
        company_id: '',
        vessel_id: '',
        valid_until: '',
        invoice_id: '',
        price: '',
        license_code: '' // For edit mode
    });

    // Fetch data for dropdowns
    const { data: companies = [], isLoading: companiesLoading } = useCompanies();
    const { data: vessels = [], isLoading: vesselsLoading } = useAllVessels();

    // Fetch invoices
    const fetchInvoices = async () => {
        setInvoicesLoading(true);
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://auth.nautiproconnect.com/api/v1/web';
            const token = localStorage.getItem('auth_token');
            const apiKey = process.env.NEXT_PUBLIC_API_KEY;

            if (!token) {
                throw new Error('Authentication token not found');
            }

            const response = await fetch(`${baseUrl}/get-invoices`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'x-api-key': apiKey || ''
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            setInvoices(data.data || []);
        } catch (err) {
            console.error('Failed to fetch invoices:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch invoices');
        } finally {
            setInvoicesLoading(false);
        }
    };

    // Handle dialog visibility with animation
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setIsVisible(true);
            setTimeout(() => setIsAnimating(true), 10);

            // Fetch invoices when dialog opens (only for create mode)
            if (!isEditMode) {
                fetchInvoices();
            }

            // Initialize form data
            if (isEditMode && licenseData) {
                const validUntilDate = new Date(licenseData.valid_until);
                const formattedDate = validUntilDate.toISOString().split('T')[0];

                setFormData({
                    company_id: licenseData.company_id || '',
                    vessel_id: licenseData.vessel_id || '',
                    valid_until: formattedDate,
                    invoice_id: '',
                    price: '',
                    license_code: licenseData.license_code || ''
                });
            } else {
                // Reset form for create mode
                setFormData({
                    company_id: '',
                    vessel_id: '',
                    valid_until: '',
                    invoice_id: '',
                    price: '',
                    license_code: ''
                });
            }
        } else {
            document.body.style.overflow = 'unset';
            setIsAnimating(false);
            setTimeout(() => setIsVisible(false), 200);
            setError(null);
            setInvoices([]); // Clear invoices when dialog closes
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, isEditMode, licenseData]);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // If invoice is selected, auto-fill price
        if (field === 'invoice_id' && value) {
            const selectedInvoice = invoices.find(inv => inv.id.toString() === value);
            if (selectedInvoice) {
                setFormData(prev => ({
                    ...prev,
                    [field]: value,
                    price: selectedInvoice.price
                }));
            }
        }

        if (error) setError(null);
    };

    const validateForm = () => {
        if (isEditMode) {
            if (!formData.license_code.trim()) {
                setError('License code is required');
                return false;
            }
            if (!formData.valid_until) {
                setError('Valid until date is required');
                return false;
            }
        } else {
            if (!formData.company_id) {
                setError('Please select a company');
                return false;
            }
            if (!formData.vessel_id) {
                setError('Please select a vessel');
                return false;
            }
            if (!formData.valid_until) {
                setError('Valid until date is required');
                return false;
            }
            if (!formData.invoice_id.trim()) {
                setError('Please select an invoice');
                return false;
            }
            if (!formData.price.trim()) {
                setError('Price is required');
                return false;
            }
            if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
                setError('Price must be a valid positive number');
                return false;
            }
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);
        setError(null);

        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://auth.nautiproconnect.com/api/v1/web';
            const token = localStorage.getItem('auth_token');
            const apiKey = process.env.NEXT_PUBLIC_API_KEY;

            if (!token) {
                throw new Error('Authentication token not found');
            }

            let url: string;
            let requestBody: any;

            if (isEditMode) {
                url = `${baseUrl}/update-maintena-license`;
                // Convert date to timestamp for API
                const validUntilTimestamp = new Date(formData.valid_until).getTime().toString();
                requestBody = {
                    license_code: formData.license_code,
                    valid_until: validUntilTimestamp
                };
            } else {
                url = `${baseUrl}/create-maintena-license`;
                // Convert date to timestamp for API
                const validUntilTimestamp = new Date(formData.valid_until).getTime().toString();
                requestBody = {
                    company_id: formData.company_id,
                    vessel_id: formData.vessel_id,
                    valid_until: validUntilTimestamp,
                    invoice_id: parseInt(formData.invoice_id),
                    price: formData.price
                };
            }

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'x-api-key': apiKey || ''
                },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            // Success
            onSuccess();
            handleClose();
        } catch (err) {
            console.error('License form error:', err);
            setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            company_id: '',
            vessel_id: '',
            valid_until: '',
            invoice_id: '',
            price: '',
            license_code: ''
        });
        onClose();
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    if (!isVisible) return null;

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
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 [data-theme='dark']_&:text-white">
                                {isEditMode ? 'Update License' : 'Create New License'}
                            </h2>
                            <p className="text-sm text-gray-500 [data-theme='dark']_&:text-gray-400">
                                {isEditMode ? 'Update license validity period' : 'Add a new maintenance license'}
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
                    {isEditMode ? (
                        <>
                            {/* Edit Mode - License Code */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 [data-theme='dark']_&:text-gray-300 mb-2">
                                    License Code
                                </label>
                                <input
                                    type="text"
                                    value={formData.license_code}
                                    onChange={(e) => handleInputChange('license_code', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:text-white"
                                    placeholder="Enter license code"
                                    disabled={true}
                                />
                            </div>

                            {/* Edit Mode - Valid Until */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 [data-theme='dark']_&:text-gray-300 mb-2">
                                    Valid Until
                                </label>
                                <input
                                    type="date"
                                    value={formData.valid_until}
                                    onChange={(e) => handleInputChange('valid_until', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:text-white"
                                    disabled={isLoading}
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Create Mode - All Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Company Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 [data-theme='dark']_&:text-gray-300 mb-2">
                                        Company <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.company_id}
                                        onChange={(e) => handleInputChange('company_id', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:text-white"
                                        disabled={isLoading || companiesLoading}
                                    >
                                        <option value="">Select Company</option>
                                        {companies.map((company) => (
                                            <option key={company.id} value={company.id}>
                                                {company.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Vessel Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 [data-theme='dark']_&:text-gray-300 mb-2">
                                        Vessel <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.vessel_id}
                                        onChange={(e) => handleInputChange('vessel_id', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:text-white"
                                        disabled={isLoading || vesselsLoading}
                                    >
                                        <option value="">Select Vessel</option>
                                        {vessels.map((vessel) => (
                                            <option key={vessel.id} value={vessel.id}>
                                                {vessel.name} ({vessel.imo})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Invoice Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 [data-theme='dark']_&:text-gray-300 mb-2">
                                        Invoice <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.invoice_id}
                                        onChange={(e) => handleInputChange('invoice_id', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:text-white"
                                        disabled={isLoading || invoicesLoading}
                                    >
                                        <option value="">Select Invoice</option>
                                        {invoices.map((invoice) => (
                                            <option key={invoice.id} value={invoice.id}>
                                                {invoice.invoice_code} - Rp {parseInt(invoice.price).toLocaleString('id-ID')}
                                            </option>
                                        ))}
                                    </select>
                                    {invoicesLoading && (
                                        <p className="text-xs text-gray-500 [data-theme='dark']_&:text-gray-400 mt-1">Loading invoices...</p>
                                    )}
                                </div>

                                {/* Price (Auto-filled from invoice) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 [data-theme='dark']_&:text-gray-300 mb-2">
                                        Price <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.price}
                                        onChange={(e) => handleInputChange('price', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:text-white bg-gray-50 [data-theme='dark']_&:bg-gray-600"
                                        placeholder="Price will be auto-filled"
                                        disabled={isLoading}
                                        readOnly
                                    />
                                    <p className="text-xs text-gray-500 [data-theme='dark']_&:text-gray-400 mt-1">Price is automatically filled when you select an invoice</p>
                                </div>
                            </div>

                            {/* Valid Until */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 [data-theme='dark']_&:text-gray-300 mb-2">
                                    Valid Until <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={formData.valid_until}
                                    onChange={(e) => handleInputChange('valid_until', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:text-white"
                                    disabled={isLoading}
                                />
                            </div>
                        </>
                    )}

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
                            <span>{isLoading ? 'Processing...' : (isEditMode ? 'Update License' : 'Create License')}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}