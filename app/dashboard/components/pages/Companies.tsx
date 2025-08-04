// app/dashboard/components/pages/Companies.tsx - Modified for role-based access

'use client';

import { useState } from 'react';
import CreateCompanyDialog from '../dialogs/CreateCompanyDialog';
import EditCompanyDialog from '../dialogs/EditCompanyDialog';
import CompanyDetailDialog from '../dialogs/CompanyDetailDialog';
import ConfirmDeleteDialog from '../dialogs/ConfirmDeleteDialog';
import { useCompanies, useDeleteCompany } from '@/app/hooks/useApiQuery';
import { useAuth } from '@/app/contexts/AuthContext'; // Import useAuth
import type { CompanyUI } from '@/app/types/api';

export default function Companies() {
    const { state: authState } = useAuth(); // Get auth state
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch companies data
    const { data: companiesData, isLoading, error, refetch } = useCompanies();
    const deleteCompanyMutation = useDeleteCompany();

    // Check if current user is superintendent
    const isSuperintendent = authState.user?.role?.toLowerCase() === 'superintendent';

    // Filter companies based on search term
    const filteredCompanies = companiesData?.filter(company =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.location.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const selectedCompany = companiesData?.find(c => c.id === selectedCompanyId) || null;

    const handleCreateCompany = () => {
        if (!isSuperintendent) return; // Block if not superintendent
        setIsCreateDialogOpen(true);
    };

    const handleEditCompany = (companyId: string) => {
        if (!isSuperintendent) return; // Block if not superintendent
        setSelectedCompanyId(companyId);
        setIsEditDialogOpen(true);
    };

    const handleViewCompanyDetail = (companyId: string) => {
        setSelectedCompanyId(companyId);
        setIsDetailDialogOpen(true);
    };

    const handleDeleteCompany = (companyId: string) => {
        if (!isSuperintendent) return; // Block if not superintendent
        setSelectedCompanyId(companyId);
        setIsDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (selectedCompanyId) {
            await deleteCompanyMutation.mutateAsync(selectedCompanyId);
            handleCloseDialogs();
            refetch();
        }
    };

    const handleCloseDialogs = () => {
        setIsCreateDialogOpen(false);
        setIsEditDialogOpen(false);
        setIsDetailDialogOpen(false);
        setIsDeleteDialogOpen(false);
        setSelectedCompanyId(null);
    };

    const handleSuccess = () => {
        refetch();
        handleCloseDialogs();
    };

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 [data-theme='dark']_&:bg-red-900 rounded-lg p-4">
                    <div className="flex">
                        <svg className="h-5 w-5 text-red-400 [data-theme='dark']_&:text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800 [data-theme='dark']_&:text-red-200">Error loading companies</h3>
                            <p className="text-sm text-red-700 [data-theme='dark']_&:text-red-300 mt-1">{error.message}</p>
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
                    <h1 className="text-2xl font-bold text-gray-800 [data-theme='dark']_&:text-white">Companies</h1>
                    <p className="text-gray-600 [data-theme='dark']_&:text-gray-400 mt-1">Manage your maritime company details</p>
                </div>
                {/* Only show Add Company button for superintendent */}
                {isSuperintendent && (
                    <button
                        onClick={handleCreateCompany}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span>Add Company</span>
                    </button>
                )}
            </div>

            {/* Search and Filter */}
            <div className="bg-white [data-theme='dark']_&:bg-gray-800 rounded-lg shadow mb-6 p-4">
                <div className="flex items-center space-x-4">
                    <div className="flex-1">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search companies..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:text-white"
                            />
                            <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                    <div className="text-sm text-gray-500 [data-theme='dark']_&:text-gray-400">
                        {isLoading ? 'Loading...' : `${filteredCompanies.length} companies`}
                    </div>
                </div>
            </div>

            {/* Companies Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-white [data-theme='dark']_&:bg-gray-800 rounded-lg shadow p-6">
                            <div className="animate-pulse">
                                <div className="flex items-center space-x-4 mb-4">
                                    <div className="w-12 h-12 bg-gray-300 rounded-lg [data-theme='dark']_&:bg-gray-600"></div>
                                    <div className="space-y-2">
                                        <div className="h-4 bg-gray-300 rounded w-24 [data-theme='dark']_&:bg-gray-600"></div>
                                        <div className="h-3 bg-gray-300 rounded w-32 [data-theme='dark']_&:bg-gray-600"></div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="h-3 bg-gray-300 rounded [data-theme='dark']_&:bg-gray-600"></div>
                                    <div className="h-3 bg-gray-300 rounded w-3/4 [data-theme='dark']_&:bg-gray-600"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredCompanies.length === 0 ? (
                <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900 [data-theme='dark']_&:text-gray-100">No companies found</h3>
                    <p className="mt-1 text-sm text-gray-500 [data-theme='dark']_&:text-gray-400">
                        {searchTerm
                            ? 'Try adjusting your search terms to find companies.'
                            : 'Get started by adding your first maritime company.'
                        }
                    </p>
                    {!searchTerm && isSuperintendent && (
                        <div className="mt-6">
                            <button
                                onClick={handleCreateCompany}
                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Add Company
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCompanies.map((company) => (
                        <div key={company.id} className="bg-white [data-theme='dark']_&:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow">
                            <div className="p-6">
                                {/* Company Header */}
                                <div className="flex items-center space-x-4 mb-4">
                                    <div className="w-12 h-12 bg-blue-100 [data-theme='dark']_&:bg-blue-900 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-blue-600 [data-theme='dark']_&:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-800 [data-theme='dark']_&:text-white truncate">
                                            {company.name}
                                        </h3>
                                        <p className="text-sm text-gray-500 [data-theme='dark']_&:text-gray-400 truncate">
                                            {company.location}
                                        </p>
                                    </div>
                                </div>

                                {/* Company Stats */}
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-600 [data-theme='dark']_&:text-blue-400">
                                            {company.vessels || "-"}
                                        </div>
                                        <div className="text-xs text-gray-500 [data-theme='dark']_&:text-gray-400">Vessels</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-600 [data-theme='dark']_&:text-green-400">
                                            {company.crews || "-"}
                                        </div>
                                        <div className="text-xs text-gray-500 [data-theme='dark']_&:text-gray-400">Crew</div>
                                    </div>
                                </div>

                                {/* Company Actions */}
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleViewCompanyDetail(company.id)}
                                        className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:text-gray-300 [data-theme='dark']_&:hover:bg-gray-600"
                                    >
                                        View Details
                                    </button>
                                    {/* Only show Edit button for superintendent */}
                                    {isSuperintendent && (
                                        <button
                                            onClick={() => handleEditCompany(company.id)}
                                            className="px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm [data-theme='dark']_&:bg-blue-900 [data-theme='dark']_&:text-blue-300 [data-theme='dark']_&:hover:bg-blue-800"
                                        >
                                            Edit
                                        </button>
                                    )}
                                    {/* Only show Delete button for superintendent */}
                                    {isSuperintendent && (
                                        <button
                                            onClick={() => handleDeleteCompany(company.id)}
                                            className="px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm [data-theme='dark']_&:bg-red-900 [data-theme='dark']_&:text-red-300 [data-theme='dark']_&:hover:bg-red-800"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>

                                {/* Created Date */}
                                <div className="mt-4 text-xs text-gray-500 [data-theme='dark']_&:text-gray-400">
                                    Created: {company.created}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Dialogs - Only render if user is superintendent */}
            {isSuperintendent && (
                <>
                    <CreateCompanyDialog
                        isOpen={isCreateDialogOpen}
                        onClose={handleCloseDialogs}
                        onSuccess={handleSuccess}
                    />

                    <EditCompanyDialog
                        isOpen={isEditDialogOpen}
                        company={selectedCompany}
                        onClose={handleCloseDialogs}
                        onSuccess={handleSuccess}
                    />

                    <ConfirmDeleteDialog
                        isOpen={isDeleteDialogOpen}
                        title="Delete Company"
                        message={`Are you sure you want to delete "${selectedCompany?.name}"? This action cannot be undone and will affect all associated vessels and crew members.`}
                        onConfirm={handleConfirmDelete}
                        onCancel={handleCloseDialogs}
                        isLoading={deleteCompanyMutation.isPending}
                        error={deleteCompanyMutation.error?.message}
                    />
                </>
            )}

            <CompanyDetailDialog
                isOpen={isDetailDialogOpen}
                companyId={selectedCompanyId}
                onClose={handleCloseDialogs}
                onEdit={(companyId) => {
                    if (isSuperintendent) {
                        setIsDetailDialogOpen(false);
                        handleEditCompany(companyId);
                    }
                }}
                onDelete={(companyId) => {
                    if (isSuperintendent) {
                        setIsDetailDialogOpen(false);
                        handleDeleteCompany(companyId);
                    }
                }}
            />
        </div>
    );
}