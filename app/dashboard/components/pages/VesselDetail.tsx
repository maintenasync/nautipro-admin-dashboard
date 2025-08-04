// app/dashboard/components/pages/VesselDetail.tsx

'use client';

import { useState } from 'react';

interface VesselDetailProps {
    vesselId: string;
    onBack: () => void;
}

interface VesselDetails {
    id: string;
    name: string;
    previousName: string;
    imo: string;
    mmsi: string;
    flag: string;
    callsign: string;
    grossTonnage: number;
    summerDeadweight: number;
    yearOfBuild: number;
    vesselType: string;
    vesselClass: string;
    company: string;
    status: string;
    image: string;
    // Additional details
    owner: string;
    operator: string;
    port: string;
    lastUpdate: string;
    nextInspection: string;
    registrationDate: string;
    length: number;
    width: number;
    draft: number;
    enginePower: number;
    fuelType: string;
    crew: number;
    // Documents
    documents: {
        id: number;
        name: string;
        type: string;
        expiryDate: string;
        status: string;
    }[];
    // Licenses
    licenses: {
        id: number;
        name: string;
        issueDate: string;
        expiryDate: string;
        status: string;
    }[];
    // Maintenance History
    maintenanceHistory: {
        id: number;
        date: string;
        type: string;
        description: string;
        cost: number;
        status: string;
    }[];
}

export default function VesselDetail({ vesselId, onBack }: VesselDetailProps) {
    const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'licenses' | 'maintenance'>('overview');

    // Mock data - in real app, this would come from API
    const vesselDetails: VesselDetails = {
        id: vesselId,
        name: 'Ocean Explorer',
        previousName: 'Sea Master',
        imo: 'IMO1234567',
        mmsi: '123456789',
        flag: 'Singapore',
        callsign: 'ABCD123',
        grossTonnage: 25000,
        summerDeadweight: 40000,
        yearOfBuild: 2018,
        vesselType: 'Cargo Ship',
        vesselClass: 'Lloyd\'s Register',
        company: 'Ocean Shipping Ltd',
        status: 'Active',
        image: '/api/placeholder/800/400',
        owner: 'Ocean Shipping Ltd',
        operator: 'Maritime Operations Corp',
        port: 'Singapore Port',
        lastUpdate: '2024-07-15',
        nextInspection: '2024-12-15',
        registrationDate: '2018-03-20',
        length: 180,
        width: 32,
        draft: 12,
        enginePower: 12000,
        fuelType: 'Heavy Fuel Oil',
        crew: 24,
        documents: [
            { id: 1, name: 'Safety Certificate', type: 'Certificate', expiryDate: '2025-03-15', status: 'Valid' },
            { id: 2, name: 'Insurance Policy', type: 'Insurance', expiryDate: '2024-12-31', status: 'Valid' },
            { id: 3, name: 'Radio License', type: 'License', expiryDate: '2024-09-30', status: 'Expiring Soon' },
        ],
        licenses: [
            { id: 1, name: 'Navigation License', issueDate: '2024-01-15', expiryDate: '2025-01-15', status: 'Active' },
            { id: 2, name: 'Port Entry Permit', issueDate: '2024-06-01', expiryDate: '2024-12-01', status: 'Active' },
            { id: 3, name: 'Environmental Permit', issueDate: '2024-03-10', expiryDate: '2024-12-10', status: 'Expiring Soon' },
        ],
        maintenanceHistory: [
            { id: 1, date: '2024-07-01', type: 'Engine Maintenance', description: 'Routine engine inspection and oil change', cost: 15000, status: 'Completed' },
            { id: 2, date: '2024-06-15', type: 'Hull Inspection', description: 'Underwater hull inspection and cleaning', cost: 8000, status: 'Completed' },
            { id: 3, date: '2024-05-20', type: 'Safety Equipment', description: 'Fire extinguisher replacement and testing', cost: 3000, status: 'Completed' },
        ]
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: '📊' },
        { id: 'documents', label: 'Documents', icon: '📄' },
        { id: 'licenses', label: 'Licenses', icon: '📋' },
        { id: 'maintenance', label: 'Maintenance', icon: '🔧' }
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Active':
            case 'Valid':
            case 'Completed':
                return 'bg-green-100 text-green-800';
            case 'Expiring Soon':
                return 'bg-orange-100 text-orange-800';
            case 'Expired':
            case 'Inactive':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    return (
        <div className="p-6">
            {/* Header */}
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
                <div className="flex items-center space-x-4">
                    <h1 className="text-2xl font-bold text-gray-800">{vesselDetails.name}</h1>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(vesselDetails.status)}`}>
            {vesselDetails.status}
          </span>
                </div>
            </div>

            {/* Vessel Image and Basic Info */}
            <div className="bg-white rounded-lg shadow mb-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
                    {/* Vessel Image */}
                    <div>
                        <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    </div>

                    {/* Quick Info */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Information</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-600">IMO Number:</span>
                                <span className="font-medium">{vesselDetails.imo}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">MMSI:</span>
                                <span className="font-medium">{vesselDetails.mmsi}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Flag:</span>
                                <span className="font-medium">{vesselDetails.flag}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Type:</span>
                                <span className="font-medium">{vesselDetails.vesselType}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Company:</span>
                                <span className="font-medium">{vesselDetails.company}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Year Built:</span>
                                <span className="font-medium">{vesselDetails.yearOfBuild}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Current Port:</span>
                                <span className="font-medium">{vesselDetails.port}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow">
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as never)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="p-6">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Identification */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-gray-800 mb-3">Identification</h4>
                                <div className="space-y-2 text-sm">
                                    <div><span className="text-gray-600">IMO:</span> {vesselDetails.imo}</div>
                                    <div><span className="text-gray-600">MMSI:</span> {vesselDetails.mmsi}</div>
                                    <div><span className="text-gray-600">Callsign:</span> {vesselDetails.callsign}</div>
                                    <div><span className="text-gray-600">Flag:</span> {vesselDetails.flag}</div>
                                    <div><span className="text-gray-600">Previous Name:</span> {vesselDetails.previousName}</div>
                                </div>
                            </div>

                            {/* Technical Specifications */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-gray-800 mb-3">Technical Specs</h4>
                                <div className="space-y-2 text-sm">
                                    <div><span className="text-gray-600">Gross Tonnage:</span> {vesselDetails.grossTonnage.toLocaleString()} MT</div>
                                    <div><span className="text-gray-600">Deadweight:</span> {vesselDetails.summerDeadweight.toLocaleString()} MT</div>
                                    <div><span className="text-gray-600">Length:</span> {vesselDetails.length} m</div>
                                    <div><span className="text-gray-600">Width:</span> {vesselDetails.width} m</div>
                                    <div><span className="text-gray-600">Draft:</span> {vesselDetails.draft} m</div>
                                </div>
                            </div>

                            {/* Operational Info */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-gray-800 mb-3">Operational Info</h4>
                                <div className="space-y-2 text-sm">
                                    <div><span className="text-gray-600">Owner:</span> {vesselDetails.owner}</div>
                                    <div><span className="text-gray-600">Operator:</span> {vesselDetails.operator}</div>
                                    <div><span className="text-gray-600">Classification:</span> {vesselDetails.vesselClass}</div>
                                    <div><span className="text-gray-600">Engine Power:</span> {vesselDetails.enginePower.toLocaleString()} HP</div>
                                    <div><span className="text-gray-600">Fuel Type:</span> {vesselDetails.fuelType}</div>
                                    <div><span className="text-gray-600">Crew:</span> {vesselDetails.crew} persons</div>
                                </div>
                            </div>

                            {/* Important Dates */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-gray-800 mb-3">Important Dates</h4>
                                <div className="space-y-2 text-sm">
                                    <div><span className="text-gray-600">Registration:</span> {vesselDetails.registrationDate}</div>
                                    <div><span className="text-gray-600">Last Update:</span> {vesselDetails.lastUpdate}</div>
                                    <div><span className="text-gray-600">Next Inspection:</span> {vesselDetails.nextInspection}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Documents Tab */}
                    {activeTab === 'documents' && (
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-800">Documents</h3>
                                <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                                    Add Document
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                    {vesselDetails.documents.map((doc) => (
                                        <tr key={doc.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{doc.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.type}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.expiryDate}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(doc.status)}`}>
                            {doc.status}
                          </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <button className="text-blue-600 hover:text-blue-900 mr-2">View</button>
                                                <button className="text-green-600 hover:text-green-900 mr-2">Download</button>
                                                <button className="text-red-600 hover:text-red-900">Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Licenses Tab */}
                    {activeTab === 'licenses' && (
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-800">Licenses</h3>
                                <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                                    Add License
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {vesselDetails.licenses.map((license) => (
                                    <div key={license.id} className="bg-gray-50 p-4 rounded-lg">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-semibold text-gray-800">{license.name}</h4>
                                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(license.status)}`}>
                        {license.status}
                      </span>
                                        </div>
                                        <div className="space-y-1 text-sm text-gray-600">
                                            <div>Issue Date: {license.issueDate}</div>
                                            <div>Expiry Date: {license.expiryDate}</div>
                                        </div>
                                        <div className="mt-3 flex space-x-2">
                                            <button className="text-blue-600 hover:text-blue-900 text-sm">View</button>
                                            <button className="text-green-600 hover:text-green-900 text-sm">Renew</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Maintenance Tab */}
                    {activeTab === 'maintenance' && (
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-800">Maintenance History</h3>
                                <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                                    Add Maintenance
                                </button>
                            </div>
                            <div className="space-y-4">
                                {vesselDetails.maintenanceHistory.map((maintenance) => (
                                    <div key={maintenance.id} className="bg-gray-50 p-4 rounded-lg">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-semibold text-gray-800">{maintenance.type}</h4>
                                                <p className="text-sm text-gray-600">{maintenance.description}</p>
                                            </div>
                                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(maintenance.status)}`}>
                        {maintenance.status}
                      </span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm text-gray-600">
                                            <span>Date: {maintenance.date}</span>
                                            <span>Cost: {formatCurrency(maintenance.cost)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}