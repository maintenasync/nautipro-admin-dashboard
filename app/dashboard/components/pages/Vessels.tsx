// app/dashboard/components/pages/Vessels.tsx - Modified for role-based access

'use client';

import { useState } from 'react';
import CreateVesselDialog from '../dialogs/CreateVesselDialog';
import EditVesselDialog from '../dialogs/EditVesselDialog';
import VesselDetailDialog from '../dialogs/VesselDetailDialog';
import ConfirmDeleteDialog from '../dialogs/ConfirmDeleteDialog';
import { useAllVessels, useDeleteVessel } from '@/app/hooks/useApiQuery';
import { useAuth } from '@/app/contexts/AuthContext'; // Import useAuth
import type { VesselUI } from '@/app/types/api';

export default function Vessels() {
    const { state: authState } = useAuth(); // Get auth state
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedVesselId, setSelectedVesselId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [companyFilter, setCompanyFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // Fetch vessels data
    const { data: vesselsData, isLoading, error, refetch } = useAllVessels();
    const deleteVesselMutation = useDeleteVessel();

    // Check if current user is superintendent
    const isSuperintendent = authState.user?.role?.toLowerCase() === 'superintendent';

    // Filter vessels
    const filteredVessels = vesselsData?.filter(vessel => {
        const matchesSearch = !searchTerm ||
            vessel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vessel.imo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vessel.company.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCompany = !companyFilter || companyFilter === 'All Companies' || vessel.company === companyFilter;
        const matchesType = !typeFilter || typeFilter === 'All Types' || vessel.type === typeFilter;
        const matchesStatus = !statusFilter || statusFilter === 'All Status' || vessel.status === statusFilter;

        return matchesSearch && matchesCompany && matchesType && matchesStatus;
    }) || [];

    // Get unique values for filters
    const availableCompanies = ['All Companies', ...new Set(vesselsData?.map(v => v.company) || [])];
    const availableTypes = ['All Types', ...new Set(vesselsData?.map(v => v.type) || [])];
    const availableStatuses = ['All Status', ...new Set(vesselsData?.map(v => v.status) || [])];

    const selectedVessel = vesselsData?.find(v => v.id === selectedVesselId) || null;

    const handleCreateVessel = () => {
        if (!isSuperintendent) return; // Block if not superintendent
        setIsCreateDialogOpen(true);
    };

    const handleEditVessel = (vesselId: string) => {
        if (!isSuperintendent) return; // Block if not superintendent
        setSelectedVesselId(vesselId);
        setIsEditDialogOpen(true);
    };

    const handleViewVesselDetail = (vesselId: string) => {
        setSelectedVesselId(vesselId);
        setIsDetailDialogOpen(true);
    };

    const handleDeleteVessel = (vesselId: string) => {
        if (!isSuperintendent) return; // Block if not superintendent
        setSelectedVesselId(vesselId);
        setIsDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (selectedVesselId) {
            await deleteVesselMutation.mutateAsync(selectedVesselId);
            handleCloseDialogs();
            refetch();
        }
    };

    const handleCloseDialogs = () => {
        setIsCreateDialogOpen(false);
        setIsEditDialogOpen(false);
        setIsDetailDialogOpen(false);
        setIsDeleteDialogOpen(false);
        setSelectedVesselId(null);
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
                            <h3 className="text-sm font-medium text-red-800 [data-theme='dark']_&:text-red-200">Error loading vessels</h3>
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
                    <h1 className="text-2xl font-bold text-gray-800 [data-theme='dark']_&:text-white">Vessels</h1>
                    <p className="text-gray-600 [data-theme='dark']_&:text-gray-400 mt-1">Manage your fleet of vessels</p>
                </div>
                {/* Only show Add Vessel button for superintendent */}
                {isSuperintendent && (
                    <button
                        onClick={handleCreateVessel}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-150 flex items-center space-x-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span>Add Vessel</span>
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="bg-white [data-theme='dark']_&:bg-gray-800 rounded-lg shadow mb-6 p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Search */}
                    <div className="lg:col-span-2">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search vessels by name, IMO, or company..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:text-white"
                            />
                            <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>

                    {/* Company Filter */}
                    <div>
                        <select
                            value={companyFilter}
                            onChange={(e) => setCompanyFilter(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:text-white"
                        >
                            {availableCompanies.map(company => (
                                <option key={company} value={company}>{company}</option>
                            ))}
                        </select>
                    </div>

                    {/* Type Filter */}
                    <div>
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:text-white"
                        >
                            {availableTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:text-white"
                        >
                            {availableStatuses.map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="mt-4 text-sm text-gray-500 [data-theme='dark']_&:text-gray-400">
                    {isLoading ? 'Loading...' : `${filteredVessels.length} vessels found`}
                </div>
            </div>

            {/* Vessels Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-white [data-theme='dark']_&:bg-gray-800 rounded-lg shadow p-6">
                            <div className="animate-pulse">
                                <div className="h-40 bg-gray-300 rounded-md mb-4 [data-theme='dark']_&:bg-gray-600"></div>
                                <div className="space-y-2">
                                    <div className="h-4 bg-gray-300 rounded w-3/4 [data-theme='dark']_&:bg-gray-600"></div>
                                    <div className="h-3 bg-gray-300 rounded w-1/2 [data-theme='dark']_&:bg-gray-600"></div>
                                </div>
                                <div className="mt-4 space-y-2">
                                    <div className="h-3 bg-gray-300 rounded [data-theme='dark']_&:bg-gray-600"></div>
                                    <div className="h-3 bg-gray-300 rounded w-2/3 [data-theme='dark']_&:bg-gray-600"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredVessels.length === 0 ? (
                <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900 [data-theme='dark']_&:text-gray-100">No vessels found</h3>
                    <p className="mt-1 text-sm text-gray-500 [data-theme='dark']_&:text-gray-400">
                        {searchTerm || companyFilter || typeFilter || statusFilter
                            ? 'Try adjusting your filters to see more vessels.'
                            : 'Get started by adding your first vessel.'
                        }
                    </p>
                    {!searchTerm && !companyFilter && !typeFilter && !statusFilter && isSuperintendent && (
                        <div className="mt-6">
                            <button
                                onClick={handleCreateVessel}
                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Add Vessel
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredVessels.map((vessel) => (
                        <div key={vessel.id} className="bg-white [data-theme='dark']_&:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow">
                            {/* Vessel Image */}
                            {vessel.image && (
                                <div className="aspect-w-16 aspect-h-9">
                                    <img
                                        src={vessel.image}
                                        alt={vessel.name}
                                        className="w-full h-40 object-cover rounded-t-lg"
                                    />
                                </div>
                            )}

                            <div className="p-6">
                                {/* Vessel Header */}
                                <div className="mb-4">
                                    <h3 className="text-lg font-semibold text-gray-800 [data-theme='dark']_&:text-white mb-1">
                                        {vessel.name}
                                    </h3>
                                    <div className="flex items-center space-x-2">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                            vessel.status === 'Active'
                                                ? 'bg-green-100 text-green-800 [data-theme=\'dark\']_&:bg-green-800 [data-theme=\'dark\']_&:text-green-200'
                                                : 'bg-red-100 text-red-800 [data-theme=\'dark\']_&:bg-red-800 [data-theme=\'dark\']_&:text-red-200'
                                        }`}>
                                            {vessel.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Vessel Details */}
                                <div className="space-y-2 text-sm mb-4">
                                    <div className="flex justify-between">
                                        <span>Type:</span>
                                        <span className="font-medium">{vessel.type}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>IMO:</span>
                                        <span className="font-medium">{vessel.imo}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Company:</span>
                                        <span className="font-medium truncate ml-2">{vessel.company}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleViewVesselDetail(vessel.id)}
                                        className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:text-gray-300 [data-theme='dark']_&:hover:bg-gray-600"
                                    >
                                        Details
                                    </button>
                                    {/* Only show Edit button for superintendent */}
                                    {isSuperintendent && (
                                        <button
                                            onClick={() => handleEditVessel(vessel.id)}
                                            className="px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm [data-theme='dark']_&:bg-blue-900 [data-theme='dark']_&:text-blue-300 [data-theme='dark']_&:hover:bg-blue-800"
                                        >
                                            Edit
                                        </button>
                                    )}
                                    {/* Only show Delete button for superintendent */}
                                    {isSuperintendent && (
                                        <button
                                            onClick={() => handleDeleteVessel(vessel.id)}
                                            className="px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm [data-theme='dark']_&:bg-red-900 [data-theme='dark']_&:text-red-300 [data-theme='dark']_&:hover:bg-red-800"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Dialogs - Only render if user is superintendent */}
            {isSuperintendent && (
                <>
                    <CreateVesselDialog
                        isOpen={isCreateDialogOpen}
                        onClose={handleCloseDialogs}
                        onSuccess={handleSuccess}
                    />

                    <EditVesselDialog
                        isOpen={isEditDialogOpen}
                        vessel={selectedVessel}
                        onClose={handleCloseDialogs}
                        onSuccess={handleSuccess}
                    />

                    <ConfirmDeleteDialog
                        isOpen={isDeleteDialogOpen}
                        title="Delete Vessel"
                        message={`Are you sure you want to delete "${selectedVessel?.name}"? This action cannot be undone and will affect all associated crew members and licenses.`}
                        onConfirm={handleConfirmDelete}
                        onCancel={handleCloseDialogs}
                        isLoading={deleteVesselMutation.isPending}
                        error={deleteVesselMutation.error?.message}
                    />
                </>
            )}

            <VesselDetailDialog
                isOpen={isDetailDialogOpen}
                vesselId={selectedVesselId}
                onClose={handleCloseDialogs}
                onEdit={(vesselId) => {
                    if (isSuperintendent) {
                        setIsDetailDialogOpen(false);
                        handleEditVessel(vesselId);
                    }
                }}
                onDelete={(vesselId) => {
                    if (isSuperintendent) {
                        setIsDetailDialogOpen(false);
                        handleDeleteVessel(vesselId);
                    }
                }}
            />
        </div>
    );
}