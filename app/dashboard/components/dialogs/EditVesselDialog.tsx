// app/dashboard/components/dialogs/EditVesselDialog.tsx

'use client';

import { useState, useRef, useEffect } from 'react';
import { useUpdateVessel, useUpdateVesselImage, useVesselTypes, useCompanies } from '@/app/hooks/useApiQuery';
import type { VesselUI } from '@/app/types/api';

interface EditVesselDialogProps {
    isOpen: boolean;
    vessel: VesselUI | null;
    onClose: () => void;
    onSuccess?: () => void;
}

interface FormData {
    id: string;
    name: string;
    previous_name: string;
    imo: string;
    mmsi: string;
    flag: string;
    callsign: string;
    gross_tonnage: string;
    summer_deadweight: string;
    year_of_build: string;
    place_of_build: string;
    vesseltype_id: string;
    class_name: string;
    company_id: string;
    image?: File;
}

export default function EditVesselDialog({ isOpen, vessel, onClose, onSuccess }: EditVesselDialogProps) {
    const [formData, setFormData] = useState<FormData>({
        id: '',
        name: '',
        previous_name: '',
        imo: '',
        mmsi: '',
        flag: '',
        callsign: '',
        gross_tonnage: '',
        summer_deadweight: '',
        year_of_build: '',
        place_of_build: '',
        vesseltype_id: '',
        class_name: '',
        company_id: '',
    });

    const [imagePreview, setImagePreview] = useState<string>('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Hooks
    const updateVesselMutation = useUpdateVessel();
    const updateImageMutation = useUpdateVesselImage();
    const { data: vesselTypes = [], isLoading: typesLoading } = useVesselTypes();
    const { data: companies = [], isLoading: companiesLoading } = useCompanies();

    // Common flags
    const flags = [
        'Panama', 'Liberia', 'Marshall Islands', 'Hong Kong', 'Singapore', 'Bahamas',
        'Malta', 'Cyprus', 'Indonesia', 'Malaysia', 'Philippines', 'Thailand', 'Vietnam'
    ];

    // Classification societies
    const classSocieties = [
        'Lloyd\'s Register', 'DNV', 'American Bureau of Shipping (ABS)', 'Bureau Veritas',
        'ClassNK', 'Korean Register', 'China Classification Society', 'Russian Maritime Register',
        'Indian Register of Shipping', 'Turkish Lloyd', 'Others'
    ];

    // Initialize form data when vessel changes
    useEffect(() => {
        if (vessel && isOpen) {
            // Find company ID from the company name
            const company = companies.find(c => c.name === vessel.company);
            // Find vessel type ID from the type name
            const vesselType = vesselTypes.find(vt => vt.name === vessel.type);

            setFormData({
                id: vessel.id,
                name: vessel.name || '',
                previous_name: '', // Need to fetch from detailed API
                imo: vessel.imo || '',
                mmsi: vessel.mmsi || '',
                flag: vessel.flag || '',
                callsign: vessel.callsign || '',
                gross_tonnage: vessel.gross_tonnage?.toString() || '',
                summer_deadweight: vessel.summer_dead_weight?.toString() || '',
                year_of_build: vessel.year_of_build?.toString() || '',
                place_of_build: vessel.place_of_build || '',
                vesseltype_id: vesselType?.id.toString() || '',
                class_name: vessel.class_name || '',
                company_id: company?.id || '',
            });

            // Set existing image preview if available
            if (vessel.image) {
                setImagePreview(vessel.image);
            }
        }
    }, [vessel, companies, vesselTypes, isOpen]);

    // Reset form when dialog closes
    useEffect(() => {
        if (!isOpen) {
            setFormData({
                id: '',
                name: '',
                previous_name: '',
                imo: '',
                mmsi: '',
                flag: '',
                callsign: '',
                gross_tonnage: '',
                summer_deadweight: '',
                year_of_build: '',
                place_of_build: '',
                vesseltype_id: '',
                class_name: '',
                company_id: '',
            });
            setImagePreview('');
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

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                setError('Image file size must be less than 5MB');
                return;
            }

            // Validate file type
            if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
                setError('Image must be a PNG, JPG, or JPEG file');
                return;
            }

            setFormData(prev => ({
                ...prev,
                image: file
            }));

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setFormData(prev => ({
            ...prev,
            image: undefined
        }));
        setImagePreview(vessel?.image || '');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!vessel) {
            setError('No vessel selected for editing');
            return;
        }

        setError('');
        setSuccess('');

        // Validation
        if (!formData.name || !formData.imo || !formData.vesseltype_id || !formData.company_id) {
            setError('Please fill in all required fields');
            return;
        }

        // Validate numeric fields
        const grossTonnage = parseFloat(formData.gross_tonnage);
        const summerDeadweight = parseFloat(formData.summer_deadweight);
        const yearOfBuild = parseInt(formData.year_of_build);

        if (formData.gross_tonnage && isNaN(grossTonnage)) {
            setError('Gross tonnage must be a valid number');
            return;
        }

        if (formData.summer_deadweight && isNaN(summerDeadweight)) {
            setError('Summer deadweight must be a valid number');
            return;
        }

        if (formData.year_of_build && (isNaN(yearOfBuild) || yearOfBuild < 1900 || yearOfBuild > new Date().getFullYear())) {
            setError('Please enter a valid year of build');
            return;
        }

        try {
            // Update vessel data first
            await updateVesselMutation.mutateAsync({
                id: formData.id,
                name: formData.name,
                previous_name: formData.previous_name,
                imo: formData.imo,
                mmsi: formData.mmsi,
                flag: formData.flag,
                callsign: formData.callsign,
                gross_tonnage: grossTonnage || 0,
                summer_deadweight: summerDeadweight || 0,
                year_of_build: yearOfBuild || 0,
                place_of_build: formData.place_of_build,
                vesseltype_id: parseInt(formData.vesseltype_id),
                class_name: formData.class_name,
                company_id: formData.company_id,
            });

            let imageUploadSuccess = true;

            // Upload image if a new one is provided
            if (formData.image) {
                try {
                    await updateImageMutation.mutateAsync({
                        vesselId: vessel.id,
                        imageFile: formData.image,
                    });
                } catch (imageError) {
                    console.error('Image upload failed:', imageError);
                    imageUploadSuccess = false;
                }
            }

            if (imageUploadSuccess) {
                setSuccess('Vessel updated successfully!');
            } else {
                setSuccess('Vessel updated successfully, but image upload failed. You can update the image later.');
            }

            onSuccess?.();
            setTimeout(() => {
                handleClose();
            }, 1500);

        } catch (error: any) {
            console.error('Error updating vessel:', error);
            setError(error.message || 'Failed to update vessel. Please try again.');
        }
    };

    const handleClose = () => {
        onClose();
    };

    if (!isOpen || !vessel) return null;

    const isLoading = updateVesselMutation.isPending || updateImageMutation.isPending;

    return (
        <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white [data-theme='dark']_&:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 [data-theme='dark']_&:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-800 [data-theme='dark']_&:text-white">
                        Edit Vessel
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
                    {/* Image Upload */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 [data-theme='dark']_&:text-gray-300 mb-2">
                            Vessel Image
                        </label>
                        <div className="flex items-center space-x-4">
                            {imagePreview ? (
                                <div className="relative">
                                    <img
                                        src={imagePreview}
                                        alt="Vessel preview"
                                        className="w-32 h-20 object-cover rounded-lg border border-gray-300"
                                    />
                                    {formData.image && (
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                                            disabled={isLoading}
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="w-32 h-20 bg-gray-200 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:border-gray-600">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".png,.jpg,.jpeg"
                                onChange={handleImageChange}
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
                                    Change Image
                                </button>
                                <p className="text-xs text-gray-500 mt-1">PNG, JPG, or JPEG. Max 5MB.</p>
                            </div>
                        </div>
                    </div>

                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 [data-theme='dark']_&:text-gray-300 mb-1">
                                Vessel Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full p-3 border border-gray-300 rounded-md [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:text-white"
                                placeholder="Enter vessel name"
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 [data-theme='dark']_&:text-gray-300 mb-1">
                                Previous Name
                            </label>
                            <input
                                type="text"
                                name="previous_name"
                                value={formData.previous_name}
                                onChange={handleInputChange}
                                className="w-full p-3 border border-gray-300 rounded-md [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:text-white"
                                placeholder="Enter previous name (if any)"
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    {/* Vessel Type and Company */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 [data-theme='dark']_&:text-gray-300 mb-1">
                                Vessel Type *
                            </label>
                            {typesLoading ? (
                                <div className="animate-pulse bg-gray-200 h-12 rounded [data-theme='dark']_&:bg-gray-600"></div>
                            ) : (
                                <select
                                    name="vesseltype_id"
                                    value={formData.vesseltype_id}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-md [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:text-white"
                                    required
                                    disabled={isLoading}
                                >
                                    <option value="">Select vessel type</option>
                                    {vesselTypes.map((type) => (
                                        <option key={type.id} value={type.id}>
                                            {type.name}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 [data-theme='dark']_&:text-gray-300 mb-1">
                                Company *
                            </label>
                            {companiesLoading ? (
                                <div className="animate-pulse bg-gray-200 h-12 rounded [data-theme='dark']_&:bg-gray-600"></div>
                            ) : (
                                <select
                                    name="company_id"
                                    value={formData.company_id}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-md [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:text-white"
                                    required
                                    disabled={isLoading}
                                >
                                    <option value="">Select company</option>
                                    {companies.map((company) => (
                                        <option key={company.id} value={company.id}>
                                            {company.name}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    </div>

                    {/* Identification */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 [data-theme='dark']_&:text-gray-300 mb-1">
                                IMO Number *
                            </label>
                            <input
                                type="text"
                                name="imo"
                                value={formData.imo}
                                onChange={handleInputChange}
                                className="w-full p-3 border border-gray-300 rounded-md [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:text-white"
                                placeholder="Enter IMO number"
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 [data-theme='dark']_&:text-gray-300 mb-1">
                                MMSI Number
                            </label>
                            <input
                                type="text"
                                name="mmsi"
                                value={formData.mmsi}
                                onChange={handleInputChange}
                                className="w-full p-3 border border-gray-300 rounded-md [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:text-white"
                                placeholder="Enter MMSI number"
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 [data-theme='dark']_&:text-gray-300 mb-1">
                                Call Sign
                            </label>
                            <input
                                type="text"
                                name="callsign"
                                value={formData.callsign}
                                onChange={handleInputChange}
                                className="w-full p-3 border border-gray-300 rounded-md [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:text-white"
                                placeholder="Enter call sign"
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    {/* Flag and Classification */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 [data-theme='dark']_&:text-gray-300 mb-1">
                                Flag
                            </label>
                            <select
                                name="flag"
                                value={formData.flag}
                                onChange={handleInputChange}
                                className="w-full p-3 border border-gray-300 rounded-md [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:text-white"
                                disabled={isLoading}
                            >
                                <option value="">Select flag</option>
                                {flags.map((flag) => (
                                    <option key={flag} value={flag}>
                                        {flag}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 [data-theme='dark']_&:text-gray-300 mb-1">
                                Classification Society
                            </label>
                            <select
                                name="class_name"
                                value={formData.class_name}
                                onChange={handleInputChange}
                                className="w-full p-3 border border-gray-300 rounded-md [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:text-white"
                                disabled={isLoading}
                            >
                                <option value="">Select classification society</option>
                                {classSocieties.map((society) => (
                                    <option key={society} value={society}>
                                        {society}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Technical Specifications */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 [data-theme='dark']_&:text-gray-300 mb-1">
                                Gross Tonnage
                            </label>
                            <input
                                type="number"
                                name="gross_tonnage"
                                value={formData.gross_tonnage}
                                onChange={handleInputChange}
                                className="w-full p-3 border border-gray-300 rounded-md [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:text-white"
                                placeholder="Enter gross tonnage"
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 [data-theme='dark']_&:text-gray-300 mb-1">
                                Summer Deadweight
                            </label>
                            <input
                                type="number"
                                name="summer_deadweight"
                                value={formData.summer_deadweight}
                                onChange={handleInputChange}
                                className="w-full p-3 border border-gray-300 rounded-md [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:text-white"
                                placeholder="Enter summer deadweight"
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    {/* Construction Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 [data-theme='dark']_&:text-gray-300 mb-1">
                                Year of Build
                            </label>
                            <input
                                type="number"
                                name="year_of_build"
                                value={formData.year_of_build}
                                onChange={handleInputChange}
                                className="w-full p-3 border border-gray-300 rounded-md [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:text-white"
                                placeholder="Enter year of build"
                                min="1900"
                                max={new Date().getFullYear()}
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 [data-theme='dark']_&:text-gray-300 mb-1">
                                Place of Build
                            </label>
                            <input
                                type="text"
                                name="place_of_build"
                                value={formData.place_of_build}
                                onChange={handleInputChange}
                                className="w-full p-3 border border-gray-300 rounded-md [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:text-white"
                                placeholder="Enter place of build"
                                disabled={isLoading}
                            />
                        </div>
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
                    <div className="flex space-x-3 pt-4 border-t border-gray-100 [data-theme='dark']_&:border-gray-700">
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
                            {isLoading ? 'Updating...' : 'Update Vessel'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}