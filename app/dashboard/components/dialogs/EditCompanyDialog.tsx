// app/dashboard/components/dialogs/EditCompanyDialog.tsx

'use client';

import { useState, useRef, useEffect } from 'react';
import { useUpdateCompany, useUpdateCompanyLogo } from '@/app/hooks/useApiQuery';
import type { CompanyUI } from '@/app/types/api';

interface EditCompanyDialogProps {
    isOpen: boolean;
    company: CompanyUI | null;
    onClose: () => void;
    onSuccess?: () => void;
}

interface FormData {
    name: string;
    registration_number: string;
    address: string;
    city: string;
    province: string;
    postal_code: string;
    country: string;
    phone: string;
    email: string;
    website: string;
    logo?: File;
}

export default function EditCompanyDialog({ isOpen, company, onClose, onSuccess }: EditCompanyDialogProps) {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        registration_number: '',
        address: '',
        city: '',
        province: '',
        postal_code: '',
        country: 'Indonesia',
        phone: '',
        email: '',
        website: '',
    });

    const [logoPreview, setLogoPreview] = useState<string>('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Hooks
    const updateCompanyMutation = useUpdateCompany();
    const updateLogoMutation = useUpdateCompanyLogo();

    // Initialize form data when company changes
    useEffect(() => {
        if (company && isOpen) {
            // You'll need to fetch the full company details since CompanyUI doesn't have all fields
            // For now, we'll populate what we can from the UI data
            setFormData({
                name: company.name || '',
                registration_number: company.registrationNumber || '',
                address: company.address || '',
                city: company.city || '',
                province: company.province || '',
                postal_code: company.postalCode || '',
                country: company.country || 'Indonesia',
                phone: company.phone || '',
                email: company.email || '',
                website: company.website || '',
            });

            // Set logo preview if available
            if (company.logo) {
                setLogoPreview(company.logo);
            } else {
                setLogoPreview('');
            }
        }
    }, [company, isOpen]);

    // Reset form when dialog closes
    useEffect(() => {
        if (!isOpen) {
            setFormData({
                name: '',
                registration_number: '',
                address: '',
                city: '',
                province: '',
                postal_code: '',
                country: 'Indonesia',
                phone: '',
                email: '',
                website: '',
            });
            setLogoPreview('');
            setError('');
            setSuccess('');
        }
    }, [isOpen]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                setError('Logo file size must be less than 5MB');
                return;
            }

            // Validate file type
            if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
                setError('Logo must be a PNG, JPG, or JPEG file');
                return;
            }

            setFormData(prev => ({
                ...prev,
                logo: file
            }));

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setLogoPreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeLogo = () => {
        setFormData(prev => ({
            ...prev,
            logo: undefined
        }));
        setLogoPreview('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!company) {
            setError('No company selected for editing');
            return;
        }

        setError('');
        setSuccess('');

        // Validation
        if (!formData.name || !formData.registration_number || !formData.email) {
            setError('Please fill in all required fields');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address');
            return;
        }

        try {
            // Update company data first
            await updateCompanyMutation.mutateAsync({
                companyId: company.id,
                data: {
                    name: formData.name,
                    registration_number: formData.registration_number,
                    address: formData.address,
                    city: formData.city,
                    province: formData.province,
                    postal_code: formData.postal_code,
                    country: formData.country,
                    phone: formData.phone,
                    email: formData.email,
                    website: formData.website,
                },
            });

            let logoUploadSuccess = true;

            // Upload logo if provided
            if (formData.logo) {
                try {
                    await updateLogoMutation.mutateAsync({
                        companyId: company.id,
                        logoFile: formData.logo,
                    });
                } catch (logoError) {
                    console.error('Logo upload failed:', logoError);
                    logoUploadSuccess = false;
                }
            }

            if (logoUploadSuccess) {
                setSuccess('Company updated successfully!');
            } else {
                setSuccess('Company updated successfully, but logo upload failed. You can update the logo later.');
            }

            onSuccess?.();
            setTimeout(() => {
                handleClose();
            }, 1500);

        } catch (error: any) {
            console.error('Error updating company:', error);
            setError(error.message || 'Failed to update company. Please try again.');
        }
    };

    const handleClose = () => {
        onClose();
    };

    if (!isOpen || !company) return null;

    const isLoading = updateCompanyMutation.isPending || updateLogoMutation.isPending;

    return (
        <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white [data-theme='dark']_&:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b [data-theme='dark']_&:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-800 [data-theme='dark']_&:text-white">
                        Edit Company
                    </h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-500 hover:text-gray-700 [data-theme='dark']_&:text-gray-400 [data-theme='dark']_&:hover:text-gray-200"
                        disabled={isLoading}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    {/* Logo Upload */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 [data-theme='dark']_&:text-gray-300 mb-2">
                            Company Logo
                        </label>
                        <div className="flex items-center space-x-4">
                            {logoPreview ? (
                                <div className="relative">
                                    <img
                                        src={logoPreview}
                                        alt="Logo preview"
                                        className="w-16 h-16 object-cover rounded-lg border border-gray-300"
                                    />
                                    <button
                                        type="button"
                                        onClick={removeLogo}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                                        disabled={isLoading}
                                    >
                                        ×
                                    </button>
                                </div>
                            ) : (
                                <div className="w-16 h-16 bg-gray-200 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:border-gray-600">
                                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".png,.jpg,.jpeg"
                                onChange={handleLogoChange}
                                className="hidden"
                                disabled={isLoading}
                            />
                            <div>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:text-gray-300 [data-theme='dark']_&:hover:bg-gray-600"
                                    disabled={isLoading}
                                >
                                    Change Logo
                                </button>
                                <p className="text-xs text-gray-500 mt-1">PNG, JPG, or JPEG. Max 5MB.</p>
                            </div>
                        </div>
                    </div>

                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 [data-theme='dark']_&:text-gray-300 mb-1">
                                Company Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full p-3 border border-gray-300 rounded-md [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:text-white"
                                placeholder="Enter company name"
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 [data-theme='dark']_&:text-gray-300 mb-1">
                                Registration Number *
                            </label>
                            <input
                                type="text"
                                name="registration_number"
                                value={formData.registration_number}
                                onChange={handleInputChange}
                                className="w-full p-3 border border-gray-300 rounded-md [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:text-white"
                                placeholder="Enter registration number"
                                required
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    {/* Address */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 [data-theme='dark']_&:text-gray-300 mb-1">
                            Address
                        </label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            className="w-full p-3 border border-gray-300 rounded-md [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:text-white"
                            placeholder="Enter address"
                            disabled={isLoading}
                        />
                    </div>

                    {/* Location */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 [data-theme='dark']_&:text-gray-300 mb-1">
                                City
                            </label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                className="w-full p-3 border border-gray-300 rounded-md [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:text-white"
                                placeholder="Enter city"
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 [data-theme='dark']_&:text-gray-300 mb-1">
                                Province
                            </label>
                            <input
                                type="text"
                                name="province"
                                value={formData.province}
                                onChange={handleInputChange}
                                className="w-full p-3 border border-gray-300 rounded-md [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:text-white"
                                placeholder="Enter province"
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 [data-theme='dark']_&:text-gray-300 mb-1">
                                Postal Code
                            </label>
                            <input
                                type="text"
                                name="postal_code"
                                value={formData.postal_code}
                                onChange={handleInputChange}
                                className="w-full p-3 border border-gray-300 rounded-md [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:text-white"
                                placeholder="Enter postal code"
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    {/* Country */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 [data-theme='dark']_&:text-gray-300 mb-1">
                            Country
                        </label>
                        <input
                            type="text"
                            name="country"
                            value={formData.country}
                            onChange={handleInputChange}
                            className="w-full p-3 border border-gray-300 rounded-md [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:text-white"
                            placeholder="Enter country"
                            disabled={isLoading}
                        />
                    </div>

                    {/* Contact Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 [data-theme='dark']_&:text-gray-300 mb-1">
                                Phone
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className="w-full p-3 border border-gray-300 rounded-md [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:text-white"
                                placeholder="Enter phone number"
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 [data-theme='dark']_&:text-gray-300 mb-1">
                                Email *
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full p-3 border border-gray-300 rounded-md [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:text-white"
                                placeholder="Enter email address"
                                required
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    {/* Website */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 [data-theme='dark']_&:text-gray-300 mb-1">
                            Website
                        </label>
                        <input
                            type="url"
                            name="website"
                            value={formData.website}
                            onChange={handleInputChange}
                            className="w-full p-3 border border-gray-300 rounded-md [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:text-white"
                            placeholder="Enter website URL"
                            disabled={isLoading}
                        />
                    </div>

                    {/* Error/Success Messages */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md [data-theme='dark']_&:bg-red-900 [data-theme='dark']_&:border-red-700 [data-theme='dark']_&:text-red-300">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-md [data-theme='dark']_&:bg-green-900 [data-theme='dark']_&:border-green-700 [data-theme='dark']_&:text-green-300">
                            {success}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex space-x-3 pt-4 border-t [data-theme='dark']_&:border-gray-700">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:text-gray-300 [data-theme='dark']_&:hover:bg-gray-600"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Updating...' : 'Update Company'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}