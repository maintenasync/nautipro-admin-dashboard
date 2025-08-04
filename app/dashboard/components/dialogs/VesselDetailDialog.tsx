// app/dashboard/components/dialogs/VesselDetailDialog.tsx

'use client';

import { useState, useEffect } from 'react';
import { useAllVessels, useCrewsByVessel, useCompanies } from '@/app/hooks/useApiQuery';

interface VesselDetailDialogProps {
    isOpen: boolean;
    vesselId: string | null;
    onClose: () => void;
    onEdit?: (vesselId: string) => void;
    onDelete?: (vesselId: string) => void;
}

export default function VesselDetailDialog({
                                               isOpen,
                                               vesselId,
                                               onClose,
                                               onEdit,
                                               onDelete
                                           }: VesselDetailDialogProps) {
    const [activeTab, setActiveTab] = useState<'overview' | 'crew' | 'specifications' | 'maintenance'>('overview');
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    // Fetch data using API hooks
    const { data: vessels = [], isLoading: vesselsLoading, error: vesselsError } = useAllVessels();
    const { data: crews = [], isLoading: crewsLoading } = useCrewsByVessel(vesselId || '');
    const { data: companies = [] } = useCompanies();

    // Find the specific vessel
    const vessel = vessels.find(v => v.id === vesselId);
    const company = companies.find(c => c.name === vessel?.company);

    // Handle dialog visibility with animation
    useEffect(() => {
        if (isOpen && vesselId) {
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
    }, [isOpen, vesselId]);

    const tabs = [
        { id: 'overview', label: 'Overview', icon: '📊' },
        { id: 'crew', label: 'Crew', icon: '👥' },
        { id: 'specifications', label: 'Specifications', icon: '⚙️' },
        { id: 'maintenance', label: 'Maintenance', icon: '🔧' }
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Active':
            case 'Valid':
            case 'Completed':
                return 'bg-green-100 text-green-800 [data-theme=\'dark\']_&:bg-green-900 [data-theme=\'dark\']_&:text-green-200';
            case 'Maintenance':
            case 'Expiring Soon':
                return 'bg-orange-100 text-orange-800 [data-theme=\'dark\']_&:bg-orange-900 [data-theme=\'dark\']_&:text-orange-200';
            case 'Expired':
            case 'Inactive':
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
        if (onEdit && vesselId) {
            onEdit(vesselId);
        }
    };

    const handleDelete = () => {
        if (onDelete && vesselId && vessel) {
            if (window.confirm(`Are you sure you want to delete ${vessel.name}?`)) {
                onDelete(vesselId);
                handleClose();
            }
        }
    };

    if (!isVisible || !vesselId) return null;

    // Loading state
    if (vesselsLoading) {
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

    // Error state or vessel not found
    if (vesselsError || !vessel) {
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
                            <h3 className="text-lg font-medium text-gray-900 [data-theme='dark']_&:text-white">
                                {vessel ? 'Error loading vessel' : 'Vessel not found'}
                            </h3>
                            <div className="mt-2">
                                <p className="text-sm text-gray-500 [data-theme='dark']_&:text-gray-400">
                                    {vessel ? 'Unable to load vessel details. Please try again later.' : 'The requested vessel could not be found.'}
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
                        {/* Vessel Icon */}
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 [data-theme='dark']_&:text-white">{vessel.name}</h2>
                            <div className="flex items-center space-x-3 mt-1">
                                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(vessel.status)}`}>
                                    {vessel.status}
                                </span>
                                <span className="text-sm text-gray-500 [data-theme='dark']_&:text-gray-400">
                                    {vessel.imo}
                                </span>
                                <span className="text-sm text-gray-500 [data-theme='dark']_&:text-gray-400">
                                    {vessel.type}
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
                                Edit Vessel
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

                {/* Quick Info Bar */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:border-gray-600">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <span className="text-gray-500 [data-theme='dark']_&:text-gray-400">Company:</span>
                            <p className="font-medium [data-theme='dark']_&:text-gray-200">{vessel.company}</p>
                        </div>
                        <div>
                            <span className="text-gray-500 [data-theme='dark']_&:text-gray-400">Type:</span>
                            <p className="font-medium [data-theme='dark']_&:text-gray-200">{vessel.type}</p>
                        </div>
                        <div>
                            <span className="text-gray-500 [data-theme='dark']_&:text-gray-400">IMO:</span>
                            <p className="font-medium [data-theme='dark']_&:text-gray-200">{vessel.imo}</p>
                        </div>
                        <div>
                            <span className="text-gray-500 [data-theme='dark']_&:text-gray-400">Status:</span>
                            <p className="font-medium [data-theme='dark']_&:text-gray-200">{vessel.status}</p>
                        </div>
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
                            {/* Vessel Image and Key Metrics */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Vessel Image */}
                                <div>
                                    <h4 className="font-semibold text-gray-800 [data-theme='dark']_&:text-gray-200 mb-3">Vessel Image</h4>
                                    <div className="w-full h-48 bg-gray-200 rounded-lg overflow-hidden [data-theme='dark']_&:bg-gray-600">
                                        {vessel.image ? (
                                            <img
                                                src={vessel.image}
                                                alt={vessel.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Key Metrics */}
                                <div>
                                    <h4 className="font-semibold text-gray-800 [data-theme='dark']_&:text-gray-200 mb-3">Key Information</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-blue-50 p-3 rounded-lg [data-theme='dark']_&:bg-blue-900">
                                            <p className="text-xs text-blue-600 [data-theme='dark']_&:text-blue-300">IMO Number</p>
                                            <p className="text-lg font-bold text-blue-900 [data-theme='dark']_&:text-blue-100">{vessel.imo}</p>
                                        </div>
                                        <div className="bg-green-50 p-3 rounded-lg [data-theme='dark']_&:bg-green-900">
                                            <p className="text-xs text-green-600 [data-theme='dark']_&:text-green-300">Vessel Type</p>
                                            <p className="text-lg font-bold text-green-900 [data-theme='dark']_&:text-green-100">{vessel.type}</p>
                                        </div>
                                        <div className="bg-purple-50 p-3 rounded-lg [data-theme='dark']_&:bg-purple-900">
                                            <p className="text-xs text-purple-600 [data-theme='dark']_&:text-purple-300">Company</p>
                                            <p className="text-lg font-bold text-purple-900 [data-theme='dark']_&:text-purple-100">{vessel.company}</p>
                                        </div>
                                        <div className="bg-orange-50 p-3 rounded-lg [data-theme='dark']_&:bg-orange-900">
                                            <p className="text-xs text-orange-600 [data-theme='dark']_&:text-orange-300">Current Crew</p>
                                            <p className="text-lg font-bold text-orange-900 [data-theme='dark']_&:text-orange-100">{crews.length}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Detailed Information */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Basic Info */}
                                <div className="bg-gray-50 p-4 rounded-lg [data-theme='dark']_&:bg-gray-700">
                                    <h4 className="font-semibold text-gray-800 [data-theme='dark']_&:text-gray-200 mb-3">Basic Information</h4>
                                    <div className="space-y-2 text-sm">
                                        <div><span className="text-gray-600 [data-theme='dark']_&:text-gray-400">Name:</span> <span className="font-medium [data-theme='dark']_&:text-gray-200">{vessel.name}</span></div>
                                        <div><span className="text-gray-600 [data-theme='dark']_&:text-gray-400">IMO:</span> <span className="font-medium [data-theme='dark']_&:text-gray-200">{vessel.imo}</span></div>
                                        <div><span className="text-gray-600 [data-theme='dark']_&:text-gray-400">Type:</span> <span className="font-medium [data-theme='dark']_&:text-gray-200">{vessel.type}</span></div>
                                        <div><span className="text-gray-600 [data-theme='dark']_&:text-gray-400">Status:</span> <span className="font-medium [data-theme='dark']_&:text-gray-200">{vessel.status}</span></div>
                                        <div><span className="text-gray-600 [data-theme='dark']_&:text-gray-400">Company:</span> <span className="font-medium [data-theme='dark']_&:text-gray-200">{vessel.company}</span></div>
                                    </div>
                                </div>

                                {/* Company Information */}
                                <div className="bg-gray-50 p-4 rounded-lg [data-theme='dark']_&:bg-gray-700">
                                    <h4 className="font-semibold text-gray-800 [data-theme='dark']_&:text-gray-200 mb-3">Company Details</h4>
                                    <div className="space-y-2 text-sm">
                                        <div><span className="text-gray-600 [data-theme='dark']_&:text-gray-400">Owner:</span> <span className="font-medium [data-theme='dark']_&:text-gray-200">{vessel.company}</span></div>
                                        <div><span className="text-gray-600 [data-theme='dark']_&:text-gray-400">Location:</span> <span className="font-medium [data-theme='dark']_&:text-gray-200">{company?.location || 'N/A'}</span></div>
                                        <div><span className="text-gray-600 [data-theme='dark']_&:text-gray-400">Company ID:</span> <span className="font-medium [data-theme='dark']_&:text-gray-200">{company?.id.substring(0, 8) || 'N/A'}...</span></div>
                                        <div><span className="text-gray-600 [data-theme='dark']_&:text-gray-400">Fleet Size:</span> <span className="font-medium [data-theme='dark']_&:text-gray-200">{vessels.filter(v => v.company === vessel.company).length}</span></div>
                                    </div>
                                </div>

                                {/* Operational Info */}
                                <div className="bg-gray-50 p-4 rounded-lg [data-theme='dark']_&:bg-gray-700">
                                    <h4 className="font-semibold text-gray-800 [data-theme='dark']_&:text-gray-200 mb-3">Operational Status</h4>
                                    <div className="space-y-2 text-sm">
                                        <div><span className="text-gray-600 [data-theme='dark']_&:text-gray-400">Current Status:</span> <span className="font-medium [data-theme='dark']_&:text-gray-200">{vessel.status}</span></div>
                                        <div><span className="text-gray-600 [data-theme='dark']_&:text-gray-400">Crew Count:</span> <span className="font-medium [data-theme='dark']_&:text-gray-200">{crews.length}</span></div>
                                        <div><span className="text-gray-600 [data-theme='dark']_&:text-gray-400">Active Crew:</span> <span className="font-medium [data-theme='dark']_&:text-gray-200">{crews.filter(c => c.status === 'Active').length}</span></div>
                                        <div><span className="text-gray-600 [data-theme='dark']_&:text-gray-400">Vessel ID:</span> <span className="font-medium [data-theme='dark']_&:text-gray-200">{vessel.id.substring(0, 8)}...</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Crew Tab */}
                    {activeTab === 'crew' && (
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
                                                            <span>{crew.email}</span>
                                                            {crew.startDate !== 'N/A' && (
                                                                <>
                                                                    <span>•</span>
                                                                    <span>Started: {crew.startDate}</span>
                                                                </>
                                                            )}
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
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                    </svg>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900 [data-theme='dark']_&:text-white">No crew members</h3>
                                    <p className="mt-1 text-sm text-gray-500 [data-theme='dark']_&:text-gray-400">No crew members assigned to this vessel.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Specifications Tab */}
                    {activeTab === 'specifications' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-800 [data-theme='dark']_&:text-gray-200">Technical Specifications</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Identification */}
                                <div className="bg-gray-50 p-4 rounded-lg [data-theme='dark']_&:bg-gray-700">
                                    <h4 className="font-semibold text-gray-800 [data-theme='dark']_&:text-gray-200 mb-3">Identification</h4>
                                    <div className="space-y-2 text-sm">
                                        <div><span className="text-gray-600 [data-theme='dark']_&:text-gray-400">Vessel Name:</span> <span className="font-medium [data-theme='dark']_&:text-gray-200">{vessel.name}</span></div>
                                        <div><span className="text-gray-600 [data-theme='dark']_&:text-gray-400">IMO Number:</span> <span className="font-medium [data-theme='dark']_&:text-gray-200">{vessel.imo}</span></div>
                                        <div><span className="text-gray-600 [data-theme='dark']_&:text-gray-400">Vessel Type:</span> <span className="font-medium [data-theme='dark']_&:text-gray-200">{vessel.type}</span></div>
                                        <div><span className="text-gray-600 [data-theme='dark']_&:text-gray-400">Status:</span> <span className="font-medium [data-theme='dark']_&:text-gray-200">{vessel.status}</span></div>
                                    </div>
                                </div>

                                {/* Ownership */}
                                <div className="bg-gray-50 p-4 rounded-lg [data-theme='dark']_&:bg-gray-700">
                                    <h4 className="font-semibold text-gray-800 [data-theme='dark']_&:text-gray-200 mb-3">Ownership</h4>
                                    <div className="space-y-2 text-sm">
                                        <div><span className="text-gray-600 [data-theme='dark']_&:text-gray-400">Owner:</span> <span className="font-medium [data-theme='dark']_&:text-gray-200">{vessel.company}</span></div>
                                        <div><span className="text-gray-600 [data-theme='dark']_&:text-gray-400">Operator:</span> <span className="font-medium [data-theme='dark']_&:text-gray-200">{vessel.company}</span></div>
                                        <div><span className="text-gray-600 [data-theme='dark']_&:text-gray-400">Location:</span> <span className="font-medium [data-theme='dark']_&:text-gray-200">{company?.location || 'N/A'}</span></div>
                                    </div>
                                </div>

                                {/* Operational Data */}
                                <div className="bg-gray-50 p-4 rounded-lg [data-theme='dark']_&:bg-gray-700">
                                    <h4 className="font-semibold text-gray-800 [data-theme='dark']_&:text-gray-200 mb-3">Operational</h4>
                                    <div className="space-y-2 text-sm">
                                        <div><span className="text-gray-600 [data-theme='dark']_&:text-gray-400">Current Crew:</span> <span className="font-medium [data-theme='dark']_&:text-gray-200">{crews.length}</span></div>
                                        <div><span className="text-gray-600 [data-theme='dark']_&:text-gray-400">Active Crew:</span> <span className="font-medium [data-theme='dark']_&:text-gray-200">{crews.filter(c => c.status === 'Active').length}</span></div>
                                        <div><span className="text-gray-600 [data-theme='dark']_&:text-gray-400">Vessel ID:</span> <span className="font-medium [data-theme='dark']_&:text-gray-200">{vessel.id.substring(0, 8)}...</span></div>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Information */}
                            <div className="bg-gray-50 p-6 rounded-lg [data-theme='dark']_&:bg-gray-700">
                                <h4 className="font-semibold text-gray-800 [data-theme='dark']_&:text-gray-200 mb-4">Additional Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h5 className="font-medium text-gray-700 [data-theme='dark']_&:text-gray-300 mb-2">Vessel Details</h5>
                                        <div className="space-y-2 text-sm">
                                            <div><span className="text-gray-600 [data-theme='dark']_&:text-gray-400">Full Name:</span> <span className="font-medium [data-theme='dark']_&:text-gray-200">{vessel.name}</span></div>
                                            <div><span className="text-gray-600 [data-theme='dark']_&:text-gray-400">Type Classification:</span> <span className="font-medium [data-theme='dark']_&:text-gray-200">{vessel.type}</span></div>
                                            <div><span className="text-gray-600 [data-theme='dark']_&:text-gray-400">Current Status:</span> <span className="font-medium [data-theme='dark']_&:text-gray-200">{vessel.status}</span></div>
                                        </div>
                                    </div>
                                    <div>
                                        <h5 className="font-medium text-gray-700 [data-theme='dark']_&:text-gray-300 mb-2">Fleet Information</h5>
                                        <div className="space-y-2 text-sm">
                                            <div><span className="text-gray-600 [data-theme='dark']_&:text-gray-400">Fleet Size:</span> <span className="font-medium [data-theme='dark']_&:text-gray-200">{vessels.filter(v => v.company === vessel.company).length}</span></div>
                                            <div><span className="text-gray-600 [data-theme='dark']_&:text-gray-400">Company Fleet:</span> <span className="font-medium [data-theme='dark']_&:text-gray-200">{vessel.company}</span></div>
                                            <div><span className="text-gray-600 [data-theme='dark']_&:text-gray-400">Total Crew:</span> <span className="font-medium [data-theme='dark']_&:text-gray-200">{crews.length} assigned</span></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Maintenance Tab */}
                    {activeTab === 'maintenance' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-800 [data-theme='dark']_&:text-gray-200">Maintenance & Documents</h3>
                                <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-150 text-sm">
                                    Add Maintenance Record
                                </button>
                            </div>

                            {/* Maintenance Status */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-green-50 p-4 rounded-lg [data-theme='dark']_&:bg-green-900">
                                    <h4 className="text-sm font-medium text-green-600 [data-theme='dark']_&:text-green-300">Vessel Status</h4>
                                    <p className="text-2xl font-bold text-green-900 [data-theme='dark']_&:text-green-100">{vessel.status}</p>
                                    <p className="text-sm text-green-600 [data-theme='dark']_&:text-green-300">Current Condition</p>
                                </div>
                                <div className="bg-blue-50 p-4 rounded-lg [data-theme='dark']_&:bg-blue-900">
                                    <h4 className="text-sm font-medium text-blue-600 [data-theme='dark']_&:text-blue-300">Crew Status</h4>
                                    <p className="text-2xl font-bold text-blue-900 [data-theme='dark']_&:text-blue-100">{crews.filter(c => c.status === 'Active').length}/{crews.length}</p>
                                    <p className="text-sm text-blue-600 [data-theme='dark']_&:text-blue-300">Active Crew</p>
                                </div>
                                <div className="bg-purple-50 p-4 rounded-lg [data-theme='dark']_&:bg-purple-900">
                                    <h4 className="text-sm font-medium text-purple-600 [data-theme='dark']_&:text-purple-300">Operational</h4>
                                    <p className="text-2xl font-bold text-purple-900 [data-theme='dark']_&:text-purple-100">
                                        {vessel.status === 'Active' ? '✓' : '⚠️'}
                                    </p>
                                    <p className="text-sm text-purple-600 [data-theme='dark']_&:text-purple-300">Ready Status</p>
                                </div>
                            </div>

                            {/* Maintenance Records Placeholder */}
                            <div className="bg-gray-50 p-6 rounded-lg [data-theme='dark']_&:bg-gray-700">
                                <h4 className="font-semibold text-gray-800 [data-theme='dark']_&:text-gray-200 mb-4">Maintenance History</h4>
                                <div className="text-center py-8">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900 [data-theme='dark']_&:text-white">No maintenance records</h3>
                                    <p className="mt-1 text-sm text-gray-500 [data-theme='dark']_&:text-gray-400">Maintenance history will appear here when available.</p>
                                    <div className="mt-6">
                                        <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                                            Add Maintenance Record
                                        </button>
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