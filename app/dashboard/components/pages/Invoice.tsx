import React, { useState } from 'react';
import { useFilteredInvoices } from '@/app/hooks/useApiQuery';
import { useAuth } from '@/app/contexts/AuthContext';
import InvoiceDetailDialog from '../dialogs/InvoiceDetailDialog';
import CreateInvoiceDialog from '../dialogs/CreateInvoiceDialog';
import EditInvoiceDialog from '../dialogs/EditInvoiceDialog';
import type { InvoiceFilters, InvoiceUI } from '@/app/types/invoice';
import html2pdf from 'html2pdf.js';

export default function Invoice() {
    const [filters, setFilters] = useState<InvoiceFilters>({
        payment_method: '',
        payment_status: '',
        search: '',
    });

    const [showDetailDialog, setShowDetailDialog] = useState(false);
    const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);

    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [selectedInvoiceForEdit, setSelectedInvoiceForEdit] = useState<InvoiceUI | null>(null);

    const { state: authState } = useAuth();

    // Fetch data using custom hooks
    const { data: invoices = [], isLoading, error, refetch } = useFilteredInvoices(filters);

    const paymentMethods = ['All Methods', 'BANK', 'BCA', 'BNI', 'BRI', 'Mandiri', 'Gopay', 'OVO', 'DANA', 'ShopeePay', 'LinkAja'];
    const paymentStatuses = ['All Status', 'Paid', 'Unpaid'];

    const handleFilterChange = (filterType: keyof InvoiceFilters, value: string) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value === 'All Methods' || value === 'All Status' ? '' : value
        }));
    };

    const clearFilters = () => {
        setFilters({
            payment_method: '',
            payment_status: '',
            search: '',
        });
    };

    const handleViewDetail = (invoiceId: number) => {
        setSelectedInvoiceId(invoiceId);
        setShowDetailDialog(true);
    };

    const handleCloseDetailDialog = () => {
        setShowDetailDialog(false);
        setSelectedInvoiceId(null);
    };

    const handleCreateInvoice = () => {
        setShowCreateDialog(true);
    };

    const handleCloseCreateDialog = () => {
        setShowCreateDialog(false);
    };

    const handleEditInvoice = (invoice: InvoiceUI) => {
        setSelectedInvoiceForEdit(invoice);
        setShowEditDialog(true);
        setShowDetailDialog(false); // Close detail dialog when opening edit
    };

    const handleEditFromDetail = (invoiceId: number) => {
        const invoice = invoices.find(inv => inv.id === invoiceId);
        if (invoice) {
            handleEditInvoice(invoice);
        }
    };

    const handleCloseEditDialog = () => {
        setShowEditDialog(false);
        setSelectedInvoiceForEdit(null);
    };

    const handleFormSuccess = () => {
        refetch(); // Refresh the invoices list
    };

    const handleExportPDF = (invoice: InvoiceUI) => {
        const element = document.createElement('div');
        element.innerHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Invoice ${invoice.invoice_code}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
                    .container { max-width: 800px; margin: auto; padding: 20px; border: 1px solid #ccc; border-radius: 8px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .header h1 { font-size: 28px; color: #333; }
                    .header h2 { font-size: 18px; color: #555; }
                    .company-info, .invoice-details { margin-bottom: 20px; }
                    .company-info h3, .invoice-details h3 { font-size: 16px; margin-bottom: 5px; color: #444; }
                    .info-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    .info-table td { padding: 8px; border-bottom: 1px solid #ddd; }
                    .info-table th { text-align: left; padding: 8px; font-weight: bold; width: 30%; }
                    .invoice-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                    .invoice-table th, .invoice-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                    .invoice-table th { background-color: #f5f5f5; color: #555; }
                    .total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px; }
                    .status { padding: 4px 8px; border-radius: 4px; color: white; display: inline-block; }
                    .status.paid { background-color: #10b981; }
                    .status.unpaid { background-color: #ef4444; }
                    .footer { margin-top: 50px; text-align: center; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>INVOICE</h1>
                        <h2>${invoice.invoice_code}</h2>
                    </div>
                    
                    <table class="info-table">
                        <tr>
                            <th>From:</th>
                            <td>
                                <strong>NautiPro Connect</strong><br>
                                Maritime Management System<br>
                                Email: info@nautiproconnect.com
                            </td>
                        </tr>
                        <tr>
                            <th>To:</th>
                            <td>
                                <strong>${authState.user?.name || 'N/A'}</strong><br>
                                ${authState.user?.email || 'N/A'}
                            </td>
                        </tr>
                        <tr>
                            <th>Invoice Code:</th>
                            <td>${invoice.invoice_code}</td>
                        </tr>
                        <tr>
                            <th>Issue Date:</th>
                            <td>${invoice.formatted_created_at}</td>
                        </tr>
                        <tr>
                            <th>Payment Method:</th>
                            <td>${invoice.payment_method}</td>
                        </tr>
                        <tr>
                            <th>Status:</th>
                            <td><span class="status ${invoice.payment_status.toLowerCase()}">${invoice.payment_status}</span></td>
                        </tr>
                        ${invoice.payment_status === 'Paid' && invoice.formatted_paid_at !== '-' ? `
                        <tr>
                            <th>Paid Date:</th>
                            <td>${invoice.formatted_paid_at}</td>
                        </tr>
                        ` : ''}
                    </table>
                    
                    <table class="invoice-table">
                        <thead>
                            <tr>
                                <th>Description</th>
                                <th style="text-align: right;">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Service Fee - NautiPro Connect</td>
                                <td style="text-align: right;">${invoice.formatted_price}</td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <div class="total">
                        <p>Total Amount: <strong>${invoice.formatted_price}</strong></p>
                    </div>
                    
                    <div class="footer">
                        <p>Thank you for your business!</p>
                        <p>Generated on ${new Date().toLocaleDateString('id-ID')}</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        html2pdf(element, {
            margin: 1,
            filename: `Invoice-${invoice.invoice_code}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        });
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 [data-theme='dark']_&:text-white">Invoice Management</h1>
                        <p className="text-gray-600 [data-theme='dark']_&:text-gray-400 mt-1">Manage invoices and payments</p>
                    </div>
                </div>

                {/* Loading Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white p-4 rounded-lg shadow animate-pulse [data-theme='dark']_&:bg-gray-800">
                            <div className="h-4 bg-gray-200 rounded mb-2 [data-theme='dark']_&:bg-gray-700"></div>
                            <div className="h-8 bg-gray-200 rounded [data-theme='dark']_&:bg-gray-700"></div>
                        </div>
                    ))}
                </div>

                {/* Loading Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden [data-theme='dark']_&:bg-gray-800">
                    <div className="p-6">
                        <div className="space-y-3">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="h-4 bg-gray-200 rounded [data-theme='dark']_&:bg-gray-700"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 [data-theme='dark']_&:text-white">Invoice Management</h1>
                        <p className="text-gray-600 [data-theme='dark']_&:text-gray-400 mt-1">Manage invoices and payments</p>
                    </div>
                    <button
                        onClick={() => refetch()}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-150 flex items-center space-x-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Retry</span>
                    </button>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4 [data-theme='dark']_&:bg-red-900 [data-theme='dark']_&:border-red-700">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800 [data-theme='dark']_&:text-red-200">
                                Error loading invoices
                            </h3>
                            <div className="mt-2 text-sm text-red-700 [data-theme='dark']_&:text-red-300">
                                <p>Failed to fetch invoice data. Please check your connection and try again.</p>
                            </div>
                            <div className="mt-4">
                                <button
                                    onClick={() => refetch()}
                                    className="bg-red-100 text-red-800 px-3 py-2 text-sm rounded-md hover:bg-red-200 [data-theme='dark']_&:bg-red-800 [data-theme='dark']_&:text-red-200 [data-theme='dark']_&:hover:bg-red-700"
                                >
                                    Try Again
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 [data-theme='dark']_&:text-white">Invoice Management</h1>
                    <p className="text-gray-600 [data-theme='dark']_&:text-gray-400 mt-1">Manage invoices and payments</p>
                </div>
                <button
                    onClick={handleCreateInvoice}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors duration-150 flex items-center space-x-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Create Invoice</span>
                </button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow [data-theme='dark']_&:bg-gray-800">
                    <h3 className="text-sm font-medium text-gray-500 [data-theme='dark']_&:text-gray-400">Total Invoices</h3>
                    <p className="text-2xl font-bold text-gray-900 [data-theme='dark']_&:text-white">{invoices.length}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow [data-theme='dark']_&:bg-gray-800">
                    <h3 className="text-sm font-medium text-gray-500 [data-theme='dark']_&:text-gray-400">Paid</h3>
                    <p className="text-2xl font-bold text-green-600">{invoices.filter(i => i.payment_status === 'Paid').length}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow [data-theme='dark']_&:bg-gray-800">
                    <h3 className="text-sm font-medium text-gray-500 [data-theme='dark']_&:text-gray-400">Unpaid</h3>
                    <p className="text-2xl font-bold text-red-600">{invoices.filter(i => i.payment_status === 'Unpaid').length}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow [data-theme='dark']_&:bg-gray-800">
                    <h3 className="text-sm font-medium text-gray-500 [data-theme='dark']_&:text-gray-400">Total Amount</h3>
                    <p className="text-2xl font-bold text-blue-600">
                        Rp {invoices.reduce((sum, inv) => sum + parseFloat(inv.price), 0).toLocaleString('id-ID')}
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4 mb-6 [data-theme='dark']_&:bg-gray-800">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 [data-theme='dark']_&:text-gray-300 mb-1">
                            Search
                        </label>
                        <input
                            type="text"
                            placeholder="Search invoice code..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:text-white"
                        />
                    </div>

                    {/* Payment Method Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 [data-theme='dark']_&:text-gray-300 mb-1">
                            Payment Method
                        </label>
                        <select
                            value={filters.payment_method || 'All Methods'}
                            onChange={(e) => handleFilterChange('payment_method', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:text-white"
                        >
                            {paymentMethods.map((method) => (
                                <option key={method} value={method}>{method}</option>
                            ))}
                        </select>
                    </div>

                    {/* Payment Status Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 [data-theme='dark']_&:text-gray-300 mb-1">
                            Payment Status
                        </label>
                        <select
                            value={filters.payment_status || 'All Status'}
                            onChange={(e) => handleFilterChange('payment_status', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:text-white"
                        >
                            {paymentStatuses.map((status) => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>

                    {/* Clear Filters */}
                    <div className="flex items-end">
                        <button
                            onClick={clearFilters}
                            className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 [data-theme='dark']_&:bg-gray-600 [data-theme='dark']_&:text-gray-200 [data-theme='dark']_&:border-gray-500 [data-theme='dark']_&:hover:bg-gray-500"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Invoices Table */}
            {invoices.length > 0 ? (
                <div className="bg-white rounded-lg shadow overflow-hidden [data-theme='dark']_&:bg-gray-800">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 [data-theme='dark']_&:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 [data-theme='dark']_&:text-gray-300 uppercase tracking-wider">Invoice Code</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 [data-theme='dark']_&:text-gray-300 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 [data-theme='dark']_&:text-gray-300 uppercase tracking-wider">Payment Method</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 [data-theme='dark']_&:text-gray-300 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 [data-theme='dark']_&:text-gray-300 uppercase tracking-wider">Created Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 [data-theme='dark']_&:text-gray-300 uppercase tracking-wider">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200 [data-theme='dark']_&:bg-gray-800 [data-theme='dark']_&:divide-gray-600">
                            {invoices.map((invoice) => (
                                <tr key={invoice.id} className="hover:bg-gray-50 [data-theme='dark']_&:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center [data-theme='dark']_&:bg-green-900">
                                                    <svg className="h-6 w-6 text-green-600 [data-theme='dark']_&:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900 [data-theme='dark']_&:text-white">{invoice.invoice_code}</div>
                                                <div className="text-sm text-gray-500 [data-theme='dark']_&:text-gray-400">
                                                    ID: {invoice.id}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-bold text-gray-900 [data-theme='dark']_&:text-white">{invoice.formatted_price}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900 [data-theme='dark']_&:text-white">{invoice.payment_method}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${invoice.status_color}`}>
                                                {invoice.payment_status}
                                            </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 [data-theme='dark']_&:text-gray-400">
                                        {invoice.formatted_created_at}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => handleViewDetail(invoice.id)}
                                            className="text-blue-600 hover:text-blue-900 [data-theme='dark']_&:text-blue-400 [data-theme='dark']_&:hover:text-blue-300 mr-4"
                                        >
                                            View Details
                                        </button>
                                        <button
                                            onClick={() => handleEditInvoice(invoice)}
                                            className="text-green-600 hover:text-green-900 [data-theme='dark']_&:text-green-400 [data-theme='dark']_&:hover:text-green-300 mr-4"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleExportPDF(invoice)}
                                            className="text-purple-600 hover:text-purple-900 [data-theme='dark']_&:text-purple-400 [data-theme='dark']_&:hover:text-purple-300"
                                        >
                                            Export PDF
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900 [data-theme='dark']_&:text-white">No invoices found</h3>
                    <p className="mt-1 text-sm text-gray-500 [data-theme='dark']_&:text-gray-400">
                        {Object.values(filters).some(f => f)
                            ? 'No invoices match your current filters.'
                            : 'Get started by creating your first invoice.'
                        }
                    </p>
                    <div className="mt-6">
                        <button
                            onClick={handleCreateInvoice}
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                        >
                            <svg className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            Create New Invoice
                        </button>
                    </div>
                </div>
            )}

            {/* Invoice Detail Dialog */}
            <InvoiceDetailDialog
                isOpen={showDetailDialog}
                invoiceId={selectedInvoiceId}
                onClose={handleCloseDetailDialog}
                onEdit={handleEditFromDetail}
                onExportPDF={handleExportPDF}
            />

            {/* Create Invoice Dialog */}
            <CreateInvoiceDialog
                isOpen={showCreateDialog}
                onClose={handleCloseCreateDialog}
                onSuccess={handleFormSuccess}
            />

            {/* Edit Invoice Dialog */}
            <EditInvoiceDialog
                isOpen={showEditDialog}
                invoice={selectedInvoiceForEdit}
                onClose={handleCloseEditDialog}
                onSuccess={handleFormSuccess}
            />
        </div>
    );
}