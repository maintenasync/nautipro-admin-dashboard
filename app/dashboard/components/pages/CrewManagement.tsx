// app/dashboard/components/pages/CrewManagement.tsx - Mobile Responsive with Card View

'use client';

import { useState } from 'react';
import InviteCrewDialog from '../dialogs/InviteCrewDialog';
import UpdateCrewDialog from '../dialogs/UpdateCrewDialog';
import { useFilteredCrews, useAllVessels, useRoles } from '@/app/hooks/useApiQuery';
import type { CrewMemberUI } from '@/app/types/api';
import { useAuth } from '@/app/contexts/AuthContext';

export default function CrewManagement() {
    const { state: authState } = useAuth();
    const [showInviteDialog, setShowInviteDialog] = useState(false);
    const [showUpdateDialog, setShowUpdateDialog] = useState(false);
    const [selectedCrewMember, setSelectedCrewMember] = useState<CrewMemberUI | null>(null);

    // Filter states
    const [filters, setFilters] = useState({
        vessel: '',
        role: '',
        status: '',
        search: ''
    });

    // View mode state for mobile/desktop
    const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

    // Fetch data
    const { data: crewMembers, isLoading, error, refetch } = useFilteredCrews(filters);
    const { data: vessels } = useAllVessels();
    const { data: roles } = useRoles();

    // Check if current user is superintendent
    const isSuperintendent = authState.user?.role?.toLowerCase() === 'superintendent';

    const handleUpdateCrew = (crew: CrewMemberUI) => {
        if (!isSuperintendent) return;
        setSelectedCrewMember(crew);
        setShowUpdateDialog(true);
    };

    const handleCloseUpdateDialog = () => {
        setShowUpdateDialog(false);
        setSelectedCrewMember(null);
    };

    const handleUpdateSuccess = () => {
        refetch();
        handleCloseUpdateDialog();
    };

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    // Get unique values for filters
    const vesselNames = [...new Set(crewMembers?.map(crew => crew.vessel) || [])];
    const roleNames = [...new Set(crewMembers?.map(crew => crew.role) || [])];
    const statusValues = [...new Set(crewMembers?.map(crew => crew.status) || [])];

    if (error) {
        return (
            <div className="p-3 sm:p-6">
                <div className="bg-red-50 [data-theme='dark']_&:bg-red-900 rounded-lg p-4">
                    <div className="flex">
                        <svg className="h-5 w-5 text-red-400 [data-theme='dark']_&:text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800 [data-theme='dark']_&:text-red-200">Error loading crew data</h3>
                            <p className="text-sm text-red-700 [data-theme='dark']_&:text-red-300 mt-1">{error.message}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-3 sm:p-6 max-w-full overflow-hidden">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 space-y-3 sm:space-y-0">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-800 [data-theme='dark']_&:text-white">Crew Management</h1>
                    <p className="text-gray-600 [data-theme='dark']_&:text-gray-400 mt-1 text-sm sm:text-base">Manage vessel crew members and their roles</p>
                </div>
                {isSuperintendent && (
                    <button
                        onClick={() => setShowInviteDialog(true)}
                        className="bg-blue-500 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg hover:bg-blue-600 transition-colors duration-150 flex items-center justify-center space-x-2 text-sm sm:text-base"
                    >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span className="hidden sm:inline">Invite Crew</span>
                        <span className="sm:hidden">Invite</span>
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="bg-white [data-theme='dark']_&:bg-gray-800 rounded-lg shadow mb-4 sm:mb-6 p-3 sm:p-4">
                {/* Search */}
                <div className="mb-3 sm:mb-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search crew members..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            className="w-full pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-md [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:text-white"
                        />
                        <svg className="absolute left-3 top-2.5 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                {/* Filter Dropdowns */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <select
                        value={filters.vessel}
                        onChange={(e) => handleFilterChange('vessel', e.target.value)}
                        className="w-full p-2 text-sm border border-gray-300 rounded-md [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:text-white"
                    >
                        <option value="">All Vessels</option>
                        {vesselNames.map(vessel => (
                            <option key={vessel} value={vessel}>{vessel}</option>
                        ))}
                    </select>

                    <select
                        value={filters.role}
                        onChange={(e) => handleFilterChange('role', e.target.value)}
                        className="w-full p-2 text-sm border border-gray-300 rounded-md [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:text-white"
                    >
                        <option value="">All Roles</option>
                        {roleNames.map(role => (
                            <option key={role} value={role}>{role}</option>
                        ))}
                    </select>

                    <select
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        className="w-full p-2 text-sm border border-gray-300 rounded-md [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:text-white"
                    >
                        <option value="">All Status</option>
                        {statusValues.map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                </div>

                {/* View Toggle - Desktop Only */}
                <div className="hidden lg:flex justify-end mt-4">
                    <div className="flex rounded-md border border-gray-300 [data-theme='dark']_&:border-gray-600 overflow-hidden">
                        <button
                            onClick={() => setViewMode('table')}
                            className={`px-3 py-1 text-sm ${viewMode === 'table'
                                ? 'bg-blue-500 text-white'
                                : 'bg-white [data-theme=\'dark\']_&:bg-gray-700 text-gray-700 [data-theme=\'dark\']_&:text-gray-300'
                            }`}
                        >
                            Table
                        </button>
                        <button
                            onClick={() => setViewMode('cards')}
                            className={`px-3 py-1 text-sm ${viewMode === 'cards'
                                ? 'bg-blue-500 text-white'
                                : 'bg-white [data-theme=\'dark\']_&:bg-gray-700 text-gray-700 [data-theme=\'dark\']_&:text-gray-300'
                            }`}
                        >
                            Cards
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="bg-white [data-theme='dark']_&:bg-gray-800 rounded-lg shadow overflow-hidden">
                {isLoading ? (
                    <div className="p-6 sm:p-8 text-center">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-500"></div>
                        <p className="mt-2 text-gray-600 [data-theme='dark']_&:text-gray-400 text-sm sm:text-base">Loading crew members...</p>
                    </div>
                ) : !crewMembers || crewMembers.length === 0 ? (
                    <div className="p-6 sm:p-8 text-center">
                        <svg className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900 [data-theme='dark']_&:text-gray-100">No crew members found</h3>
                        <p className="mt-1 text-sm text-gray-500 [data-theme='dark']_&:text-gray-400">
                            {filters.search || filters.vessel || filters.role || filters.status
                                ? 'Try adjusting your filters to see more crew members.'
                                : 'Get started by inviting your first crew member.'
                            }
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Mobile Card View */}
                        <div className="lg:hidden">
                            <div className="divide-y divide-gray-200 [data-theme='dark']_&:divide-gray-700">
                                {crewMembers.map((crew) => (
                                    <div key={crew.id} className="p-4 hover:bg-gray-50 [data-theme='dark']_&:hover:bg-gray-700 transition-colors">
                                        <div className="flex items-start space-x-3">
                                            {/* Avatar */}
                                            <div className="flex-shrink-0">
                                                {crew.avatar ? (
                                                    <img className="h-10 w-10 rounded-full" src={crew.avatar} alt="" />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-gray-300 [data-theme='dark']_&:bg-gray-600 flex items-center justify-center">
                                                        <span className="text-sm font-medium text-gray-700 [data-theme='dark']_&:text-gray-300">
                                                            {crew.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-gray-900 [data-theme='dark']_&:text-white truncate">
                                                            {crew.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500 [data-theme='dark']_&:text-gray-400 truncate">
                                                            {crew.email}
                                                        </p>
                                                    </div>

                                                    {/* Status Badge */}
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ml-2 ${
                                                        crew.status === 'Active'
                                                            ? 'bg-green-100 text-green-800 [data-theme=\'dark\']_&:bg-green-800 [data-theme=\'dark\']_&:text-green-200'
                                                            : 'bg-red-100 text-red-800 [data-theme=\'dark\']_&:bg-red-800 [data-theme=\'dark\']_&:text-red-200'
                                                    }`}>
                                                        {crew.status}
                                                    </span>
                                                </div>

                                                {/* Details Grid */}
                                                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                                                    <div>
                                                        <span className="text-gray-500 [data-theme='dark']_&:text-gray-400">Role:</span>
                                                        <p className="text-gray-900 [data-theme='dark']_&:text-white font-medium">{crew.role}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500 [data-theme='dark']_&:text-gray-400">Vessel:</span>
                                                        <p className="text-gray-900 [data-theme='dark']_&:text-white font-medium truncate">{crew.vessel}</p>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <span className="text-gray-500 [data-theme='dark']_&:text-gray-400">Start Date:</span>
                                                        <p className="text-gray-900 [data-theme='dark']_&:text-white font-medium">{crew.startDate}</p>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                {isSuperintendent && (
                                                    <div className="mt-3 flex justify-end">
                                                        <button
                                                            onClick={() => handleUpdateCrew(crew)}
                                                            className="text-indigo-600 hover:text-indigo-900 [data-theme='dark']_&:text-indigo-400 [data-theme='dark']_&:hover:text-indigo-300 text-sm font-medium"
                                                        >
                                                            Edit
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Desktop Table View */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 [data-theme='dark']_&:divide-gray-700">
                                <thead className="bg-gray-50 [data-theme='dark']_&:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 [data-theme='dark']_&:text-gray-300 uppercase tracking-wider">
                                        Crew Member
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 [data-theme='dark']_&:text-gray-300 uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 [data-theme='dark']_&:text-gray-300 uppercase tracking-wider">
                                        Vessel
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 [data-theme='dark']_&:text-gray-300 uppercase tracking-wider">
                                        Start Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 [data-theme='dark']_&:text-gray-300 uppercase tracking-wider">
                                        Status
                                    </th>
                                    {isSuperintendent && (
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 [data-theme='dark']_&:text-gray-300 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    )}
                                </tr>
                                </thead>
                                <tbody className="bg-white [data-theme='dark']_&:bg-gray-800 divide-y divide-gray-200 [data-theme='dark']_&:divide-gray-700">
                                {crewMembers.map((crew) => (
                                    <tr key={crew.id} className="hover:bg-gray-50 [data-theme='dark']_&:hover:bg-gray-700">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {crew.avatar ? (
                                                    <img className="h-10 w-10 rounded-full" src={crew.avatar} alt="" />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-gray-300 [data-theme='dark']_&:bg-gray-600 flex items-center justify-center">
                                                            <span className="text-sm font-medium text-gray-700 [data-theme='dark']_&:text-gray-300">
                                                                {crew.name.charAt(0).toUpperCase()}
                                                            </span>
                                                    </div>
                                                )}
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900 [data-theme='dark']_&:text-white">{crew.name}</div>
                                                    <div className="text-sm text-gray-500 [data-theme='dark']_&:text-gray-400">{crew.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 [data-theme='dark']_&:text-white">{crew.role}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 [data-theme='dark']_&:text-white">{crew.vessel}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 [data-theme='dark']_&:text-gray-400">
                                            {crew.startDate}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                    crew.status === 'Active'
                                                        ? 'bg-green-100 text-green-800 [data-theme=\'dark\']_&:bg-green-800 [data-theme=\'dark\']_&:text-green-200'
                                                        : 'bg-red-100 text-red-800 [data-theme=\'dark\']_&:bg-red-800 [data-theme=\'dark\']_&:text-red-200'
                                                }`}>
                                                    {crew.status}
                                                </span>
                                        </td>
                                        {isSuperintendent && (
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => handleUpdateCrew(crew)}
                                                    className="text-indigo-600 hover:text-indigo-900 [data-theme='dark']_&:text-indigo-400 [data-theme='dark']_&:hover:text-indigo-300"
                                                >
                                                    Edit
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>

            {/* Summary Stats */}
            {!isLoading && crewMembers && crewMembers.length > 0 && (
                <div className="mt-4 text-sm text-gray-500 [data-theme='dark']_&:text-gray-400 text-center sm:text-left">
                    Showing {crewMembers.length} crew members
                </div>
            )}

            {/* Dialogs */}
            {isSuperintendent && (
                <>
                    <InviteCrewDialog
                        isOpen={showInviteDialog}
                        onClose={() => setShowInviteDialog(false)}
                        onSuccess={() => {
                            setShowInviteDialog(false);
                            refetch();
                        }}
                    />

                    <UpdateCrewDialog
                        isOpen={showUpdateDialog}
                        crewMember={selectedCrewMember}
                        onClose={handleCloseUpdateDialog}
                        onSuccess={handleUpdateSuccess}
                    />
                </>
            )}
        </div>
    );
}