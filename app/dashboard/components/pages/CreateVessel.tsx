// app/dashboard/components/pages/CreateVessel.tsx

'use client';

import { useState } from 'react';
import Image from "next/image";

interface CreateVesselProps {
    onBack: () => void;
    onSubmit: (vesselData: unknown) => void;
}

export default function CreateVessel({ onBack, onSubmit }: CreateVesselProps) {
    const [formData, setFormData] = useState({
        name: '',
        previousName: '',
        imo: '',
        mmsi: '',
        flag: '',
        callsign: '',
        grossTonnage: '',
        summerDeadweight: '',
        yearOfBuild: '',
        vesselType: '',
        vesselClass: '',
        company: '',
        image: null as File | null
    });

    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const vesselTypes = [
        'Cargo Ship',
        'Tanker',
        'Container Ship',
        'Bulk Carrier',
        'Passenger Ship',
        'Cruise Ship',
        'Ferry',
        'Fishing Vessel',
        'Offshore Supply Vessel',
        'Tugboat',
        'Barge',
        'Research Vessel',
        'Naval Ship',
        'Yacht',
        'Other'
    ];

    const vesselClasses = [
        'Lloyd\'s Register',
        'DNV GL',
        'American Bureau of Shipping (ABS)',
        'Bureau Veritas',
        'ClassNK',
        'Korean Register',
        'China Classification Society',
        'Russian Maritime Register',
        'Indian Register of Shipping',
        'Turkish Lloyd',
        'Other'
    ];

    const companies = [
        'Ocean Shipping Ltd',
        'Maritime Solutions Inc',
        'Global Fleet Management',
        'Pacific Marine Corp',
        'Atlantic Shipping Co'
    ];

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
                    Back to Vessels
                </button>
                <h1 className="text-2xl font-bold text-gray-800">Add New Vessel</h1>
            </div>

            <form onSubmit={handleSubmit} className="max-w-4xl">
                <div className="bg-white rounded-lg shadow p-6 space-y-6">
                    {/* Vessel Image */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Vessel Image</h3>
                        <div className="flex items-center space-x-4">
                            <div className="w-32 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                                {imagePreview ? (
                                    <Image src={imagePreview} alt="Vessel preview" className="w-full h-full object-cover rounded-lg" />
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
                                    id="image-upload"
                                />
                                <label
                                    htmlFor="image-upload"
                                    className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                                >
                                    Upload Image
                                </label>
                                <p className="text-sm text-gray-500 mt-1">JPG, PNG up to 5MB</p>
                            </div>
                        </div>
                    </div>

                    {/* Basic Information */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Vessel Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter vessel name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Previous Name</label>
                                <input
                                    type="text"
                                    name="previousName"
                                    value={formData.previousName}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Previous vessel name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Vessel Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="vesselType"
                                    required
                                    value={formData.vesselType}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select Vessel Type</option>
                                    {vesselTypes.map((type) => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                                <select
                                    name="company"
                                    value={formData.company}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select Company</option>
                                    {companies.map((company) => (
                                        <option key={company} value={company}>{company}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Identification */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Identification</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">IMO Number</label>
                                <input
                                    type="text"
                                    name="imo"
                                    value={formData.imo}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="IMO1234567"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">MMSI</label>
                                <input
                                    type="text"
                                    name="mmsi"
                                    value={formData.mmsi}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="123456789"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Callsign</label>
                                <input
                                    type="text"
                                    name="callsign"
                                    value={formData.callsign}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="ABC123"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Flag</label>
                                <input
                                    type="text"
                                    name="flag"
                                    value={formData.flag}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Country flag"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Year of Build</label>
                                <input
                                    type="number"
                                    name="yearOfBuild"
                                    value={formData.yearOfBuild}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="2020"
                                    min="1900"
                                    max="2030"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                                <select
                                    name="vesselClass"
                                    value={formData.vesselClass}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select Class</option>
                                    {vesselClasses.map((vesselClass) => (
                                        <option key={vesselClass} value={vesselClass}>{vesselClass}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Technical Specifications */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Technical Specifications</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Gross Tonnage</label>
                                <input
                                    type="number"
                                    name="grossTonnage"
                                    value={formData.grossTonnage}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter gross tonnage"
                                    min="0"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Summer Deadweight</label>
                                <input
                                    type="number"
                                    name="summerDeadweight"
                                    value={formData.summerDeadweight}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter summer deadweight"
                                    min="0"
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
                            Add Vessel
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}