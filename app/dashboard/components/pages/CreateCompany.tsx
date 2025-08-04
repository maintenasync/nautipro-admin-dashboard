// app/dashboard/components/pages/CreateCompany.tsx

'use client';

import { useState } from 'react';
import Image from "next/image";

interface CreateCompanyProps {
    onBack: () => void;
    onSubmit: (companyData: unknown) => void;
}

export default function CreateCompany({ onBack, onSubmit }: CreateCompanyProps) {
    const [formData, setFormData] = useState({
        name: '',
        registrationNumber: '',
        address: '',
        city: '',
        province: '',
        postalCode: '',
        country: '',
        phone: '',
        email: '',
        website: '',
        logo: null as File | null
    });

    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="p-6">
            <div className="flex items-center mb-6">
                <button
                    onClick={onBack}
                    className="flex items-center text-gray-600 hover:text-gray-800 mr-4"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Companies
                </button>
                <h1 className="text-2xl font-bold text-gray-800">Create New Company</h1>
            </div>

            <form onSubmit={handleSubmit} className="max-w-4xl">
                <div className="bg-white rounded-lg shadow p-6 space-y-6">
                    {/* Company Logo */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Company Logo</h3>
                        <div className="flex items-center space-x-4">
                            <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                                {logoPreview ? (
                                    <Image src={logoPreview} alt="Logo preview" className="w-full h-full object-contain rounded-lg" />
                                ) : (
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                )}
                            </div>
                            <div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="logo-upload"
                                />
                                <label
                                    htmlFor="logo-upload"
                                    className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                                >
                                    Upload Logo
                                </label>
                                <p className="text-sm text-gray-500 mt-1">JPG, PNG, or SVG up to 2MB</p>
                            </div>
                        </div>
                    </div>

                    {/* Basic Information */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Company Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter company name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
                                <input
                                    type="text"
                                    name="registrationNumber"
                                    value={formData.registrationNumber}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Company registration number"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Address Information */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Address Information</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Address <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="address"
                                    required
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Street address"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        City <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="city"
                                        required
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="City"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Province <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="province"
                                        required
                                        value={formData.province}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Province"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Postal Code <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="postalCode"
                                        required
                                        value={formData.postalCode}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Postal code"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Country <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="country"
                                        required
                                        value={formData.country}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select Country</option>
                                        <option value="Indonesia">Indonesia</option>
                                        <option value="Singapore">Singapore</option>
                                        <option value="Malaysia">Malaysia</option>
                                        <option value="Thailand">Thailand</option>
                                        <option value="Philippines">Philippines</option>
                                        <option value="Vietnam">Vietnam</option>
                                        <option value="Hong Kong">Hong Kong</option>
                                        <option value="Japan">Japan</option>
                                        <option value="South Korea">South Korea</option>
                                        <option value="China">China</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    required
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="+62 123 456 7890"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="company@example.com"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                                <input
                                    type="url"
                                    name="website"
                                    value={formData.website}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="https://www.company.com"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-4 pt-6 border-t">
                        <button
                            type="button"
                            onClick={onBack}
                            className="px-6 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                            Create Company
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}