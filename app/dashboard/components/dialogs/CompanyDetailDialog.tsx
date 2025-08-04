// app/dashboard/components/dialogs/CompanyDetailDialog.tsx

'use client';

import { useState, useEffect } from 'react';
import { useCompany, useVesselsByCompany, useCrewsByCompany } from '@/app/hooks/useApiQuery';

interface CompanyDetailDialogProps {
    isOpen: boolean;
    companyId: string | null;
    onClose: () => void;
    onEdit?: (companyId: string) => void;
    onDelete?: (companyId: string) => void;
}

export default function CompanyDetailDialog({
                                                isOpen,
                                                companyId,
                                                onClose,
                                                onEdit,
                                                onDelete
                                            }: CompanyDetailDialogProps) {
    const [activeTab, setActiveTab] = useState<'overview' | 'vessels' | 'crews' | 'statistics'>('overview');
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    // Fetch data using API hooks
    const { data: company, isLoading: companyLoading, error: companyError } = useCompany(companyId || '');
    const { data: vessels = [], isLoading: vesselsLoading } = useVesselsByCompany(companyId || '');
    const { data: crews = [], isLoading: crewsLoading } = useCrewsByCompany(companyId || '');

    // Handle dialog visibility with animation
    useEffect(() => {
        if (isOpen && companyId) {
            document.body.style.overflow = 'hidden';
            setIsVisible(true);
            setTimeout(() => setIsAnimating(true), 10);
        } else {
            document.body.style.overflow = 'unset';
            setIsAnimating(false);
            setTimeout(() => setIsVisible(false), 200);
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, companyId]);

    const tabs = [
        { id: 'overview', label: 'Overview', icon: '🏢' },
        { id: 'vessels', label: 'Fleet', icon: '🚢' },
        { id: 'crews', label: 'Crew', icon: '👥' },
        { id: 'statistics', label: 'Statistics', icon: '📊' }
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Active':
            case 'Valid':
                return 'bg-green-100 text-green-800 [data-theme=\'dark\']_&:bg-green-900 [data-theme=\'dark\']_&:text-green-200';
            case 'Maintenance':
            case 'Expiring Soon':
                return 'bg-yellow-100 text-yellow-800 [data-theme=\'dark\']_&:bg-yellow-900 [data-theme=\'dark\']_&:text-yellow-200';
            case 'Inactive':
            case 'Expired':
                return 'bg-red-100 text-red-800 [data-theme=\'dark\']_&:bg-red-900 [data-theme=\'dark\']_&:text-red-200';
            default:
                return 'bg-gray-100 text-gray-800 [data-theme=\'dark\']_&:bg-gray-700 [data-theme=\'dark\']_&:text-gray-200';
        }
    };

    const handleClose = () => {
        setActiveTab('overview');
        onClose();
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    const handleEdit = () => {
        if (onEdit && companyId) {
            onEdit(companyId);
        }
    };

    const handleDelete = () => {
        if (onDelete && companyId && company) {
            if (window.confirm(`Are you sure you want to delete ${company.name}?`)) {
                onDelete(companyId);
                handleClose();
            }
        }
    };

    if (!isVisible || !companyId) return null;

    // Loading state
    if (companyLoading) {
        return (
            <div className={`fixed inset-0 flex items-center justify-center z-50 p-4 bg-opacity-50 backdrop-blur-sm`}>
                <div className="bg-white rounded-lg w-full max-w-6xl p-8 shadow-2xl [data-theme='dark']_&:bg-gray-800">
                    <div className="animate-pulse">
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="w-16 h-16 bg-gray-200 rounded-lg [data-theme='dark']_&:bg-gray-700"></div>
                            <div className="space-y-2">
                                <div className="h-6 bg-gray-200 rounded w-48 [data-theme='dark']_&:bg-gray-700"></div>
                                <div className="h-4 bg-gray-200 rounded w-32 [data-theme='dark']_&:bg-gray-700"></div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="h-4 bg-gray-200 rounded [data-theme='dark']_&:bg-gray-700"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4 [data-theme='dark']_&:bg-gray-700"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2 [data-theme='dark']_&:bg-gray-700"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (companyError || !company) {
        return (
            <div className={`fixed inset-0 flex items-center justify-center z-50 p-4 bg-opacity-50 backdrop-blur-sm`}>
                <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-2xl [data-theme='dark']_&:bg-gray-800">
                    <div className="text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 [data-theme='dark']_&:bg-red-900">
                            <svg className="h-6 w-6 text-red-600 [data-theme='dark']_&:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 [data-theme='dark']_&:text-white">Error loading company</h3>
                            <div className="mt-2">
                                <p className="text-sm text-gray-500 [data-theme='dark']_&:text-gray-400">
                                    Unable to load company details. Please try again later.
                                </p>
                            </div>
                        </div>
                        <div className="mt-6">
                            <button
                                onClick={handleClose}
                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`fixed inset-0 flex items-center justify-center z-50 p-4 transition-all duration-200 ease-out ${
                isAnimating
                    ? 'bg-opacity-50 backdrop-blur-sm'
                    : 'bg-opacity-0 backdrop-blur-0'
            }`}
            onClick={handleBackdropClick}
        >
            <div
                className={`bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-2xl transition-all duration-200 ease-out [data-theme='dark']_&:bg-gray-800 ${
                    isAnimating
                        ? 'scale-100 opacity-100 translate-y-0'
                        : 'scale-95 opacity-0 translate-y-4'
                }`}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 [data-theme='dark']_&:border-gray-600">
                    <div className="flex items-center space-x-4">
                        {/* Company Logo */}
                        {
                        company.logo ? (
                            <img
                                src={company.logo}
                                alt={`${company.name} Logo`}
                                className="w-16 h-16 rounded-lg object-cover"
                            />
                        ) : (

                        <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xl">
                                {company.name.split(' ').map(word => word[0]).join('').substring(0, 2)}
                            </span>
                        </div>
                        )}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 [data-theme='dark']_&:text-white">{company.name}</h2>
                            <div className="flex items-center space-x-3 mt-1">
                                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 [data-theme='dark']_&:bg-green-900 [data-theme='dark']_&:text-green-200">
                                    Active
                                </span>
                                <span className="text-sm text-gray-500 [data-theme='dark']_&:text-gray-400">
                                    {company.location}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        {onEdit && (
                            <button
                                onClick={handleEdit}
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-150 text-sm"
                            >
                                Edit Company
                            </button>
                        )}
                        {onDelete && (
                            <button
                                onClick={handleDelete}
                                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-150 text-sm"
                            >
                                Delete
                            </button>
                        )}
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-600 p-2 rounded-md hover:bg-gray-100 transition-colors duration-150 [data-theme='dark']_&:hover:bg-gray-700"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 [data-theme='dark']_&:border-gray-600">
                    <nav className="flex space-x-8 px-6">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as never)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-150 ${
                                    activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600 [data-theme=\'dark\']_&:text-blue-400'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 [data-theme=\'dark\']_&:text-gray-400 [data-theme=\'dark\']_&:hover:text-gray-200'
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
                        <div className="space-y-6">
                            {/* Key Metrics */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="bg-blue-50 p-4 rounded-lg [data-theme='dark']_&:bg-blue-900">
                                    <h4 className="text-sm font-medium text-blue-600 [data-theme='dark']_&:text-blue-300">Fleet Size</h4>
                                    <p className="text-2xl font-bold text-blue-900 [data-theme='dark']_&:text-blue-100">{vessels.length}</p>
                                    <p className="text-sm text-blue-600 [data-theme='dark']_&:text-blue-300">Active Vessels</p>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg [data-theme='dark']_&:bg-green-900">
                                    <h4 className="text-sm font-medium text-green-600 [data-theme='dark']_&:text-green-300">Total Crew</h4>
                                    <p className="text-2xl font-bold text-green-900 [data-theme='dark']_&:text-green-100">{crews.length}</p>
                                    <p className="text-sm text-green-600 [data-theme='dark']_&:text-green-300">Crew Members</p>
                                </div>
                                <div className="bg-purple-50 p-4 rounded-lg [data-theme='dark']_&:bg-purple-900">
                                    <h4 className="text-sm font-medium text-purple-600 [data-theme='dark']_&:text-purple-300">Active Crews</h4>
                                    <p className="text-2xl font-bold text-purple-900 [data-theme='dark']_&:text-purple-100">
                                        {crews.filter(c => c.status === 'Active').length}
                                    </p>
                                    <p className="text-sm text-purple-600 [data-theme='dark']_&:text-purple-300">Working Now</p>
                                </div>
                                <div className="bg-orange-50 p-4 rounded-lg [data-theme='dark']_&:bg-orange-900">
                                    <h4 className="text-sm font-medium text-orange-600 [data-theme='dark']_&:text-orange-300">Established</h4>
                                    <p className="text-2xl font-bold text-orange-900 [data-theme='dark']_&:text-orange-100">
                                        {company.created}
                                    </p>
                                    <p className="text-sm text-orange-600 [data-theme='dark']_&:text-orange-300">Company Added</p>
                                </div>
                            </div>

                            {/* Company Information */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Basic Information */}
                                <div className="bg-gray-50 p-6 rounded-lg [data-theme='dark']_&:bg-gray-700">
                                    <h4 className="font-semibold text-gray-800 [data-theme='dark']_&:text-gray-200 mb-4">Company Information</h4>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 [data-theme='dark']_&:text-gray-400">Company ID:</span>
                                            <span className="font-medium [data-theme='dark']_&:text-gray-200">{company.id}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 [data-theme='dark']_&:text-gray-400">Location:</span>
                                            <span className="font-medium [data-theme='dark']_&:text-gray-200">{company.location}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 [data-theme='dark']_&:text-gray-400">Founded:</span>
                                            <span className="font-medium [data-theme='dark']_&:text-gray-200">{company.created}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 [data-theme='dark']_&:text-gray-400">Status:</span>
                                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 [data-theme='dark']_&:bg-green-900 [data-theme='dark']_&:text-green-200">
                                                Active
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Fleet Summary */}
                                <div className="bg-gray-50 p-6 rounded-lg [data-theme='dark']_&:bg-gray-700">
                                    <h4 className="font-semibold text-gray-800 [data-theme='dark']_&:text-gray-200 mb-4">Fleet Summary</h4>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 [data-theme='dark']_&:text-gray-400">Total Vessels:</span>
                                            <span className="font-medium [data-theme='dark']_&:text-gray-200">{vessels.length}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 [data-theme='dark']_&:text-gray-400">Active Vessels:</span>
                                            <span className="font-medium [data-theme='dark']_&:text-gray-200">
                                                {vessels.filter(v => v.status === 'Active').length}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 [data-theme='dark']_&:text-gray-400">Total Crew:</span>
                                            <span className="font-medium [data-theme='dark']_&:text-gray-200">{crews.length}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 [data-theme='dark']_&:text-gray-400">Active Crew:</span>
                                            <span className="font-medium [data-theme='dark']_&:text-gray-200">
                                                {crews.filter(c => c.status === 'Active').length}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Vessels Tab */}
                    {activeTab === 'vessels' && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-semibold text-gray-800 [data-theme='dark']_&:text-gray-200">Fleet Overview</h3>
                                <div className="text-sm text-gray-500 [data-theme='dark']_&:text-gray-400">
                                    {vesselsLoading ? 'Loading...' : `${vessels.length} vessels`}
                                </div>
                            </div>

                            {vesselsLoading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="bg-gray-50 p-4 rounded-lg animate-pulse [data-theme='dark']_&:bg-gray-700">
                                            <div className="h-4 bg-gray-200 rounded mb-2 [data-theme='dark']_&:bg-gray-600"></div>
                                            <div className="h-3 bg-gray-200 rounded mb-1 [data-theme='dark']_&:bg-gray-600"></div>
                                            <div className="h-3 bg-gray-200 rounded w-3/4 [data-theme='dark']_&:bg-gray-600"></div>
                                        </div>
                                    ))}
                                </div>
                            ) : vessels.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {vessels.map((vessel) => (
                                        <div key={vessel.id} className="bg-gray-50 p-4 rounded-lg hover:shadow-md transition-shadow [data-theme='dark']_&:bg-gray-700">
                                            <div className="flex justify-between items-start mb-3">
                                                <h4 className="font-semibold text-gray-800 [data-theme='dark']_&:text-gray-200">{vessel.name}</h4>
                                                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(vessel.status)}`}>
                                                    {vessel.status}
                                                </span>
                                            </div>
                                            {vessel.image && (
                                                <div className="mb-3">
                                                    <img
                                                        src={vessel.image}
                                                        alt={vessel.name}
                                                        className="w-full h-32 object-cover rounded-md"
                                                    />
                                                </div>
                                            )}
                                            <div className="space-y-2 text-sm text-gray-600 [data-theme='dark']_&:text-gray-400">
                                                <div>Type: {vessel.type}</div>
                                                <div>IMO: {vessel.imo}</div>
                                            </div>
                                            <div className="mt-3 flex space-x-2">
                                                <button className="text-blue-600 hover:text-blue-900 text-sm [data-theme='dark']_&:text-blue-400">View Details</button>
                                                <button className="text-green-600 hover:text-green-900 text-sm [data-theme='dark']_&:text-green-400">Edit</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-gray-500 [data-theme='dark']_&:text-gray-400">No vessels found for this company.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Crews Tab */}
                    {activeTab === 'crews' && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-semibold text-gray-800 [data-theme='dark']_&:text-gray-200">Crew Members</h3>
                                <div className="text-sm text-gray-500 [data-theme='dark']_&:text-gray-400">
                                    {crewsLoading ? 'Loading...' : `${crews.length} crew members`}
                                </div>
                            </div>

                            {crewsLoading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="bg-gray-50 p-4 rounded-lg animate-pulse [data-theme='dark']_&:bg-gray-700">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-gray-200 rounded-full [data-theme='dark']_&:bg-gray-600"></div>
                                                <div className="flex-1">
                                                    <div className="h-4 bg-gray-200 rounded mb-2 [data-theme='dark']_&:bg-gray-600"></div>
                                                    <div className="h-3 bg-gray-200 rounded w-1/2 [data-theme='dark']_&:bg-gray-600"></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : crews.length > 0 ? (
                                <div className="space-y-4">
                                    {crews.map((crew) => (
                                        <div key={crew.id} className="bg-gray-50 p-4 rounded-lg hover:shadow-md transition-shadow [data-theme='dark']_&:bg-gray-700">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <div className="flex-shrink-0">
                                                        {crew.avatar ? (
                                                            <img className="h-10 w-10 rounded-full object-cover" src={crew.avatar} alt={crew.name} />
                                                        ) : (
                                                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center [data-theme='dark']_&:bg-gray-600">
                                                                <span className="text-sm font-medium text-gray-700 [data-theme='dark']_&:text-gray-300">
                                                                    {crew.name.split(' ').map(n => n[0]).join('')}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-gray-800 [data-theme='dark']_&:text-gray-200">{crew.name}</h4>
                                                        <div className="flex items-center space-x-4 text-sm text-gray-600 [data-theme='dark']_&:text-gray-400">
                                                            <span>{crew.role}</span>
                                                            <span>•</span>
                                                            <span>{crew.vessel}</span>
                                                            <span>•</span>
                                                            <span>{crew.email}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(crew.status)}`}>
                                                    {crew.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-gray-500 [data-theme='dark']_&:text-gray-400">No crew members found for this company.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Statistics Tab */}
                    {activeTab === 'statistics' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-800 [data-theme='dark']_&:text-gray-200">Company Statistics</h3>

                            {/* Performance Metrics */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-green-50 p-6 rounded-lg [data-theme='dark']_&:bg-green-900">
                                    <h4 className="text-sm font-medium text-green-600 [data-theme='dark']_&:text-green-300">Fleet Utilization</h4>
                                    <p className="text-2xl font-bold text-green-900 [data-theme='dark']_&:text-green-100">
                                        {vessels.length > 0 ? Math.round((vessels.filter(v => v.status === 'Active').length / vessels.length) * 100) : 0}%
                                    </p>
                                    <p className="text-sm text-green-600 [data-theme='dark']_&:text-green-300">Active Vessels</p>
                                </div>
                                <div className="bg-blue-50 p-6 rounded-lg [data-theme='dark']_&:bg-blue-900">
                                    <h4 className="text-sm font-medium text-blue-600 [data-theme='dark']_&:text-blue-300">Crew Efficiency</h4>
                                    <p className="text-2xl font-bold text-blue-900 [data-theme='dark']_&:text-blue-100">
                                        {crews.length > 0 ? Math.round((crews.filter(c => c.status === 'Active').length / crews.length) * 100) : 0}%
                                    </p>
                                    <p className="text-sm text-blue-600 [data-theme='dark']_&:text-blue-300">Active Crew</p>
                                </div>
                                <div className="bg-purple-50 p-6 rounded-lg [data-theme='dark']_&:bg-purple-900">
                                    <h4 className="text-sm font-medium text-purple-600 [data-theme='dark']_&:text-purple-300">Avg Crew per Vessel</h4>
                                    <p className="text-2xl font-bold text-purple-900 [data-theme='dark']_&:text-purple-100">
                                        {vessels.length > 0 ? Math.round(crews.length / vessels.length) : 0}
                                    </p>
                                    <p className="text-sm text-purple-600 [data-theme='dark']_&:text-purple-300">Crew Members</p>
                                </div>
                                <div className="bg-orange-50 p-6 rounded-lg [data-theme='dark']_&:bg-orange-900">
                                    <h4 className="text-sm font-medium text-orange-600 [data-theme='dark']_&:text-orange-300">Fleet Growth</h4>
                                    <p className="text-2xl font-bold text-orange-900 [data-theme='dark']_&:text-orange-100">
                                        +{vessels.length}
                                    </p>
                                    <p className="text-sm text-orange-600 [data-theme='dark']_&:text-orange-300">Total Vessels</p>
                                </div>
                            </div>

                            {/* Additional Statistics */}
                            <div className="bg-gray-50 p-6 rounded-lg [data-theme='dark']_&:bg-gray-700">
                                <h4 className="font-semibold text-gray-800 [data-theme='dark']_&:text-gray-200 mb-4">Company Overview</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h5 className="font-medium text-gray-700 [data-theme='dark']_&:text-gray-300 mb-2">Fleet Composition</h5>
                                        <div className="space-y-2">
                                            {Object.entries(
                                                vessels.reduce((acc, vessel) => {
                                                    acc[vessel.type] = (acc[vessel.type] || 0) + 1;
                                                    return acc;
                                                }, {} as Record<string, number>)
                                            ).map(([type, count]) => (
                                                <div key={type} className="flex justify-between text-sm">
                                                    <span className="text-gray-600 [data-theme='dark']_&:text-gray-400">{type}:</span>
                                                    <span className="font-medium [data-theme='dark']_&:text-gray-200">{count}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h5 className="font-medium text-gray-700 [data-theme='dark']_&:text-gray-300 mb-2">Crew Distribution</h5>
                                        <div className="space-y-2">
                                            {Object.entries(
                                                crews.reduce((acc, crew) => {
                                                    acc[crew.role] = (acc[crew.role] || 0) + 1;
                                                    return acc;
                                                }, {} as Record<string, number>)
                                            ).slice(0, 5).map(([role, count]) => (
                                                <div key={role} className="flex justify-between text-sm">
                                                    <span className="text-gray-600 [data-theme='dark']_&:text-gray-400">{role}:</span>
                                                    <span className="font-medium [data-theme='dark']_&:text-gray-200">{count}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}