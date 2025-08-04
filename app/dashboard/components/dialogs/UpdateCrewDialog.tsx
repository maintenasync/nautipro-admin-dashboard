// app/dashboard/components/dialogs/UpdateCrewDialog.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRoles, useUpdateCrewMember, useRemoveCrewMember } from '@/app/hooks/useApiQuery';
import type { CrewMemberUI, UserRole } from '@/app/types/api';

interface UpdateCrewDialogProps {
    isOpen: boolean;
    crewMember: CrewMemberUI | null;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function UpdateCrewDialog({
                                             isOpen,
                                             crewMember,
                                             onClose,
                                             onSuccess
                                         }: UpdateCrewDialogProps) {
    const [selectedRole, setSelectedRole] = useState('');
    const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
    const [error, setError] = useState('');

    // Hooks
    const { data: roles = [], isLoading: rolesLoading } = useRoles();
    const updateCrewMutation = useUpdateCrewMember();
    const removeCrewMutation = useRemoveCrewMember();

    // Initialize form when crew member changes
    useEffect(() => {
        if (crewMember && roles.length > 0) {
            const currentRole = roles.find(role => role.name === crewMember.role);
            setSelectedRole(currentRole?.role_code || '');
        }
    }, [crewMember, roles]);

    // Reset form when dialog closes
    useEffect(() => {
        if (!isOpen) {
            setSelectedRole('');
            setError('');
            setShowRemoveConfirm(false);
        }
    }, [isOpen]);

    if (!isOpen || !crewMember) return null;

    const handleUpdateRole = async () => {
        if (!selectedRole) {
            setError('Please select a role');
            return;
        }

        try {
            setError('');
            await updateCrewMutation.mutateAsync({
                vessel_id: crewMember.vessel_id,
                user_role_code: selectedRole,
                user_id: crewMember.user_id, // Convert to string if needed
                company_id: crewMember.company.id, // You need to get this from context or props
            });

            onSuccess?.();
            onClose();
        } catch (error: any) {
            setError(error.message || 'Failed to update crew member role');
        }
    };

    const handleRemoveCrew = async () => {
        try {
            setError('');
            const currentRole = roles.find(role => role.name === crewMember.role);

            await removeCrewMutation.mutateAsync({
                vessel_id: crewMember.vessel_id,
                user_role_code: currentRole?.role_code || '',
                user_id: crewMember.user_id,
                company_id: crewMember.company.id, // You need to get this from context or props
            });

            onSuccess?.();
            onClose();
        } catch (error: any) {
            setError(error.message || 'Failed to remove crew member');
        }
    };

    const isLoading = updateCrewMutation.isPending || removeCrewMutation.isPending;

    return (
        <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white [data-theme='dark']_&:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 [data-theme='dark']_&:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-800 [data-theme='dark']_&:text-white">
                        Update Crew Member
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 [data-theme='dark']_&:text-gray-400 [data-theme='dark']_&:hover:text-gray-200"
                        disabled={isLoading}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {showRemoveConfirm ? (
                    /* Remove Confirmation */
                    <div className="p-6">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 [data-theme='dark']_&:bg-red-900 mb-4">
                                <svg className="h-6 w-6 text-red-600 [data-theme='dark']_&:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 [data-theme='dark']_&:text-white mb-2">
                                Remove Crew Member
                            </h3>
                            <p className="text-sm text-gray-500 [data-theme='dark']_&:text-gray-400 mb-6">
                                Are you sure you want to remove <strong>{crewMember.name}</strong> from this vessel?
                                This will end their current assignment.
                            </p>

                            {error && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md [data-theme='dark']_&:bg-red-900 [data-theme='dark']_&:border-red-700 [data-theme='dark']_&:text-red-300">
                                    {error}
                                </div>
                            )}

                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setShowRemoveConfirm(false)}
                                    className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:text-gray-300 [data-theme='dark']_&:hover:bg-gray-600"
                                    disabled={isLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleRemoveCrew}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={isLoading}
                                >
                                    {removeCrewMutation.isPending ? 'Removing...' : 'Remove'}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Update Form */
                    <div className="p-6">
                        {/* Current Info */}
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg [data-theme='dark']_&:bg-gray-700">
                            <div className="flex items-center space-x-3">
                                {crewMember.avatar ? (
                                    <img
                                        src={crewMember.avatar}
                                        alt={crewMember.name}
                                        className="w-10 h-10 rounded-full"
                                    />
                                ) : (
                                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center [data-theme='dark']_&:bg-gray-600">
                                        <span className="text-gray-600 font-medium [data-theme='dark']_&:text-gray-300">
                                            {crewMember.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-medium text-gray-900 [data-theme='dark']_&:text-white">
                                        {crewMember.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 [data-theme='dark']_&:text-gray-400">
                                        {crewMember.email}
                                    </p>
                                    <p className="text-sm text-gray-500 [data-theme='dark']_&:text-gray-400">
                                        Current Role: <span className="font-medium">{crewMember.role}</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Role Selection */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 [data-theme='dark']_&:text-gray-300 mb-2">
                                New Role
                            </label>
                            {rolesLoading ? (
                                <div className="animate-pulse bg-gray-200 h-10 rounded [data-theme='dark']_&:bg-gray-600"></div>
                            ) : (
                                <select
                                    value={selectedRole}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-md [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:text-white"
                                    disabled={isLoading}
                                >
                                    <option value="">Select a role</option>
                                    {roles.map((role) => (
                                        <option key={role.id} value={role.role_code}>
                                            {role.name}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md [data-theme='dark']_&:bg-red-900 [data-theme='dark']_&:border-red-700 [data-theme='dark']_&:text-red-300">
                                {error}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex space-x-3">
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:text-gray-300 [data-theme='dark']_&:hover:bg-gray-600"
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateRole}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isLoading || !selectedRole}
                            >
                                {updateCrewMutation.isPending ? 'Updating...' : 'Update Role'}
                            </button>
                            <button
                                onClick={() => setShowRemoveConfirm(true)}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isLoading}
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}