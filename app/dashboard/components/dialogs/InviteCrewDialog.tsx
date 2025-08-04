// app/dashboard/components/dialogs/InviteCrewDialog.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRoles, useCompanies, useAllVessels } from '@/app/hooks/useApiQuery';
import crewService, { InviteCrewRequest } from '../../../services/crewService';

interface InviteCrewDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function InviteCrewDialog({ isOpen, onClose, onSuccess }: InviteCrewDialogProps) {
    const [formData, setFormData] = useState({
        company_id: '',
        vessel_id: '',
        email: '',
        user_role_code: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Animation states
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    // Fetch data from API
    const { data: roles = [], isLoading: rolesLoading } = useRoles();
    const { data: companies = [], isLoading: companiesLoading } = useCompanies();
    const { data: allVessels = [], isLoading: vesselsLoading } = useAllVessels();

    // Filter vessels based on selected company
    const filteredVessels = formData.company_id
        ? allVessels.filter(vessel => {
            // Find the company name for the vessel and match with selected company ID
            const selectedCompany = companies.find(c => c.id === formData.company_id);
            return vessel.company === selectedCompany?.name;
        })
        : [];

    // Prevent body scroll when dialog is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setIsVisible(true);
            // Small delay to trigger animation after render
            setTimeout(() => setIsAnimating(true), 10);
        } else {
            document.body.style.overflow = 'unset';
            setIsAnimating(false);
            // Wait for exit animation to complete before hiding
            setTimeout(() => setIsVisible(false), 200);
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Reset form when dialog closes
    useEffect(() => {
        if (!isOpen) {
            setFormData({
                company_id: '',
                vessel_id: '',
                email: '',
                user_role_code: '',
            });
            setError('');
            setSuccess('');
        }
    }, [isOpen]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
            // Reset vessel when company changes
            ...(name === 'company_id' && { vessel_id: '' })
        }));
        setError('');
        setSuccess('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        // Validation
        if (!formData.company_id || !formData.vessel_id || !formData.email || !formData.user_role_code) {
            setError('Please fill in all fields');
            setIsLoading(false);
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address');
            setIsLoading(false);
            return;
        }

        try {
            const response = await crewService.inviteCrewMember(formData as InviteCrewRequest);

            if (response.code === 200) {
                setSuccess('Invitation sent successfully!');
                setTimeout(() => {
                    onSuccess();
                    handleClose();
                }, 2000);
            } else {
                setError(response.message || 'Failed to send invitation');
            }
        } catch (error) {
            console.error('Error inviting crew member:', error);
            setError('Failed to send invitation. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            onClose();
        }
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget && !isLoading) {
            handleClose();
        }
    };

    if (!isVisible) return null;

    return (
        <div
            className={`fixed inset-0 bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-200 ${
                isAnimating ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={handleBackdropClick}
        >
            <div
                className={`bg-white [data-theme='dark']_&:bg-gray-800 rounded-lg shadow-xl w-full max-w-md transform transition-all duration-200 ${
                    isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
                }`}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 [data-theme='dark']_&:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-800 [data-theme='dark']_&:text-white">
                        Invite Crew Member
                    </h2>
                    <button
                        onClick={handleClose}
                        disabled={isLoading}
                        className="text-gray-400 hover:text-gray-600 p-2 rounded-md hover:bg-gray-100 transition-colors duration-150 [data-theme='dark']_&:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4">
                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 [data-theme='dark']_&:text-gray-300 mb-1">
                                Email Address <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleInputChange}
                                disabled={isLoading}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150 [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                placeholder="Enter crew member's email"
                            />
                        </div>

                        {/* Company */}
                        <div>
                            <label htmlFor="company_id" className="block text-sm font-medium text-gray-700 [data-theme='dark']_&:text-gray-300 mb-1">
                                Company <span className="text-red-500">*</span>
                            </label>
                            {companiesLoading ? (
                                <div className="animate-pulse bg-gray-200 h-10 rounded [data-theme='dark']_&:bg-gray-600"></div>
                            ) : (
                                <select
                                    id="company_id"
                                    name="company_id"
                                    required
                                    value={formData.company_id}
                                    onChange={handleInputChange}
                                    disabled={isLoading}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150 [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <option value="">Select Company</option>
                                    {companies.map((company) => (
                                        <option key={company.id} value={company.id}>
                                            {company.name}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {/* Vessel */}
                        <div>
                            <label htmlFor="vessel_id" className="block text-sm font-medium text-gray-700 [data-theme='dark']_&:text-gray-300 mb-1">
                                Vessel <span className="text-red-500">*</span>
                            </label>
                            {vesselsLoading ? (
                                <div className="animate-pulse bg-gray-200 h-10 rounded [data-theme='dark']_&:bg-gray-600"></div>
                            ) : (
                                <select
                                    id="vessel_id"
                                    name="vessel_id"
                                    required
                                    value={formData.vessel_id}
                                    onChange={handleInputChange}
                                    disabled={!formData.company_id || isLoading}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors duration-150 [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:text-white [data-theme='dark']_&:disabled:bg-gray-600"
                                >
                                    <option value="">
                                        {!formData.company_id ? 'Select Company First' : 'Select Vessel'}
                                    </option>
                                    {filteredVessels.map((vessel) => (
                                        <option key={vessel.id} value={vessel.id}>
                                            {vessel.name}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {/* Role */}
                        <div>
                            <label htmlFor="user_role_code" className="block text-sm font-medium text-gray-700 [data-theme='dark']_&:text-gray-300 mb-1">
                                Role <span className="text-red-500">*</span>
                            </label>
                            {rolesLoading ? (
                                <div className="animate-pulse bg-gray-200 h-10 rounded [data-theme='dark']_&:bg-gray-600"></div>
                            ) : (
                                <select
                                    id="user_role_code"
                                    name="user_role_code"
                                    required
                                    value={formData.user_role_code}
                                    onChange={handleInputChange}
                                    disabled={isLoading}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150 [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <option value="">Select Role</option>
                                    {roles.map((role) => (
                                        <option key={role.role_code} value={role.role_code}>
                                            {role.name}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    </div>

                    {/* Error/Success Messages */}
                    {error && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md [data-theme='dark']_&:bg-red-900 [data-theme='dark']_&:border-red-700 [data-theme='dark']_&:text-red-300">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-md [data-theme='dark']_&:bg-green-900 [data-theme='dark']_&:border-green-700 [data-theme='dark']_&:text-green-300">
                            {success}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-3 mt-6 pt-4 border-t border-gray-100 [data-theme='dark']_&:border-gray-600">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isLoading}
                            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 [data-theme='dark']_&:bg-gray-600 [data-theme='dark']_&:text-gray-200 [data-theme='dark']_&:border-gray-500 [data-theme='dark']_&:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || rolesLoading || companiesLoading || vesselsLoading}
                            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Sending...
                                </>
                            ) : (
                                'Send Invitation'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}