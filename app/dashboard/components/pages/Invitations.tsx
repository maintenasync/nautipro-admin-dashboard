// app/dashboard/components/pages/Invitations.tsx

'use client';

import { useState } from 'react';
import { useFilteredInvitations, useCompanies } from '@/app/hooks/useApiQuery';
import InvitationDetailDialog from '../dialogs/InvitationDetailDialog';

export default function Invitations() {
    const [filters, setFilters] = useState({
        company: '',
        status: '',
        search: '',
    });

    const [showDetailDialog, setShowDetailDialog] = useState(false);
    const [selectedInvitationId, setSelectedInvitationId] = useState<number | null>(null);

    // Fetch data using custom hooks
    const { data: invitations = [], isLoading, error, refetch } = useFilteredInvitations(filters);
    const { data: companies = [] } = useCompanies();

    // Available companies for filter
    const availableCompanies = ['All Companies', ...companies.map(c => c.name)];

    const statuses = ['All Status', 'pending', 'accept', 'reject'];

    const handleFilterChange = (filterType: string, value: string) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
    };

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

    // Clear all filters
    const clearFilters = () => {
        setFilters({
            company: '',
            status: '',
            search: '',
        });
    };

    // Handle view invitation detail
    const handleViewDetail = (invitationId: number) => {
        setSelectedInvitationId(invitationId);
        setShowDetailDialog(true);
    };

    const handleCloseDetailDialog = () => {
        setShowDetailDialog(false);
        setSelectedInvitationId(null);
    };

    // Handle successful invitation action (accept/reject)
    const handleInvitationAction = () => {
        refetch(); // Refresh the list after action
        handleCloseDetailDialog();
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 [data-theme='dark']_&:text-white">Invitations</h1>
                        <p className="text-gray-600 [data-theme='dark']_&:text-gray-400 mt-1">Manage your vessel crew invitations</p>
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
                        <h1 className="text-2xl font-bold text-gray-800 [data-theme='dark']_&:text-white">Invitations</h1>
                        <p className="text-gray-600 [data-theme='dark']_&:text-gray-400 mt-1">Manage your vessel crew invitations</p>
                    </div>
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
                                Error loading invitations
                            </h3>
                            <div className="mt-2 text-sm text-red-700 [data-theme='dark']_&:text-red-300">
                                <p>Failed to fetch invitation data. Please check your connection and try again.</p>
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
                    <h1 className="text-2xl font-bold text-gray-800 [data-theme='dark']_&:text-white">Invitations</h1>
                    <p className="text-gray-600 [data-theme='dark']_&:text-gray-400 mt-1">Manage your vessel crew invitations</p>
                </div>
                <div className="text-sm text-gray-500 [data-theme='dark']_&:text-gray-400">
                    {invitations.length} total invitations
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow [data-theme='dark']_&:bg-gray-800">
                    <h3 className="text-sm font-medium text-gray-500 [data-theme='dark']_&:text-gray-400">Total Invitations</h3>
                    <p className="text-2xl font-bold text-gray-900 [data-theme='dark']_&:text-white">{invitations.length}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow [data-theme='dark']_&:bg-gray-800">
                    <h3 className="text-sm font-medium text-gray-500 [data-theme='dark']_&:text-gray-400">Pending</h3>
                    <p className="text-2xl font-bold text-yellow-600">{invitations.filter(i => i.status === 'pending').length}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow [data-theme='dark']_&:bg-gray-800">
                    <h3 className="text-sm font-medium text-gray-500 [data-theme='dark']_&:text-gray-400">Accepted</h3>
                    <p className="text-2xl font-bold text-green-600">{invitations.filter(i => i.status === 'accept').length}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow [data-theme='dark']_&:bg-gray-800">
                    <h3 className="text-sm font-medium text-gray-500 [data-theme='dark']_&:text-gray-400">Rejected</h3>
                    <p className="text-2xl font-bold text-red-600">{invitations.filter(i => i.status === 'reject').length}</p>
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
                            placeholder="Search company, vessel, role..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:text-white"
                        />
                    </div>

                    {/* Company Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 [data-theme='dark']_&:text-gray-300 mb-1">
                            Company
                        </label>
                        <select
                            value={filters.company}
                            onChange={(e) => handleFilterChange('company', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:text-white"
                        >
                            <option value="">All Companies</option>
                            {availableCompanies.slice(1).map((company) => (
                                <option key={company} value={company}>{company}</option>
                            ))}
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 [data-theme='dark']_&:text-gray-300 mb-1">
                            Status
                        </label>
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:text-white"
                        >
                            <option value="">All Status</option>
                            {statuses.slice(1).map((status) => (
                                <option key={status} value={status}>{getStatusLabel(status)}</option>
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

            {/* Invitations Table */}
            {invitations.length > 0 ? (
                <div className="bg-white rounded-lg shadow overflow-hidden [data-theme='dark']_&:bg-gray-800">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 [data-theme='dark']_&:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 [data-theme='dark']_&:text-gray-300 uppercase tracking-wider">Company & Vessel</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 [data-theme='dark']_&:text-gray-300 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 [data-theme='dark']_&:text-gray-300 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 [data-theme='dark']_&:text-gray-300 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 [data-theme='dark']_&:text-gray-300 uppercase tracking-wider">Expires</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 [data-theme='dark']_&:text-gray-300 uppercase tracking-wider">Details</th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200 [data-theme='dark']_&:bg-gray-800 [data-theme='dark']_&:divide-gray-600">
                            {invitations.map((invitation) => (
                                <tr key={invitation.id} className="hover:bg-gray-50 [data-theme='dark']_&:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center [data-theme='dark']_&:bg-blue-900">
                                                    <svg className="h-6 w-6 text-blue-600 [data-theme='dark']_&:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900 [data-theme='dark']_&:text-white">{invitation.company_name}</div>
                                                <div className="text-sm text-gray-500 [data-theme='dark']_&:text-gray-400">
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                                {invitation.vessel_name}
                            </span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900 [data-theme='dark']_&:text-white">{invitation.role_name}</div>
                                        <div className="text-sm text-gray-500 [data-theme='dark']_&:text-gray-400 max-w-xs truncate" title={invitation.role_description}>
                                            {invitation.role_description}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 [data-theme='dark']_&:text-white">{invitation.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invitation.status)}`}>
                        {getStatusLabel(invitation.status)}
                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900 [data-theme='dark']_&:text-white">{invitation.expired_date}</div>
                                        <div className={`text-sm ${getDaysRemainingColor(invitation.days_remaining, invitation.is_expired)}`}>
                                            {invitation.is_expired
                                                ? `Expired ${Math.abs(invitation.days_remaining)} days ago`
                                                : `${invitation.days_remaining} days left`
                                            }
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => handleViewDetail(invitation.id)}
                                            className="text-blue-600 hover:text-blue-900 [data-theme='dark']_&:text-blue-400 [data-theme='dark']_&:hover:text-blue-300"
                                        >
                                            View Details
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900 [data-theme='dark']_&:text-white">No invitations found</h3>
                    <p className="mt-1 text-sm text-gray-500 [data-theme='dark']_&:text-gray-400">
                        {Object.values(filters).some(f => f)
                            ? 'No invitations match your current filters.'
                            : 'You have no vessel crew invitations at the moment.'
                        }
                    </p>
                </div>
            )}

            {/* Invitation Detail Dialog */}
            <InvitationDetailDialog
                isOpen={showDetailDialog}
                invitationId={selectedInvitationId}
                onClose={handleCloseDetailDialog}
                onAction={handleInvitationAction}
            />
        </div>
    );
}