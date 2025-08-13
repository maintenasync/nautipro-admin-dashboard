'use client';

import { useState, useEffect } from 'react';
import {
    Users,
    Terminal,
    RefreshCcw,
    Search,
    ChevronDown,
    XCircle,
    CheckCircle2,
    AlertTriangle,
    PcCase,
    Laptop,
    Smartphone,
    Tablet,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Mail,
    User,
    BadgeInfo,
    Calendar,
    Clock,
    Briefcase
} from 'lucide-react';
import authService from '../../../services/authService';

// Use environment variables for production
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://auth.nautiproconnect.com/api/v1/web';
const ITEMS_PER_PAGE = 10;

interface User {
    id: string;
    username: string;
    email: string;
    email_verification: boolean;
    name: string;
    user_status: boolean;
    avatar: string;
    role: string;
    created_at: string;
    updated_at: string;
}

interface Session {
    id: number;
    user_id: string;
    hwid: string;
    device: string;
    app: string;
    created_at: string;
    updated_at: string;
    user: User;
}

interface ApiResponse<T> {
    code: number;
    status: string;
    data: T;
}

// Custom Modal Component
interface ModalProps {
    title: string;
    message: string;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const CustomModal: React.FC<ModalProps> = ({ title, message, isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center  bg-opacity-50">
            <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm m-4">
                <h3 className="text-xl font-bold mb-4 text-gray-900">{title}</h3>
                <p className="text-sm text-gray-600 mb-6">{message}</p>
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

// User Detail Dialog Component
interface UserDetailDialogProps {
    isOpen: boolean;
    user: User | null;
    onClose: () => void;
}

const UserDetailDialog: React.FC<UserDetailDialogProps> = ({ isOpen, user, onClose }) => {
    if (!isOpen || !user) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-opacity-50">
            <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-lg m-4">
                <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                    <h3 className="text-2xl font-bold text-gray-900">User Details</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition-colors">
                        <XCircle className="w-6 h-6" />
                    </button>
                </div>
                <div className="mt-6 flex flex-col items-center">
                    <img
                        className="h-24 w-24 rounded-full object-cover mb-4 shadow-md"
                        src={user.avatar || 'https://placehold.co/100x100/A0B9CE/white?text=JD'}
                        alt={user.name}
                    />
                    <h4 className="text-xl font-semibold text-gray-900">{user.name}</h4>
                    <p className="text-sm text-gray-500 mb-4">@{user.username}</p>
                </div>
                <div className="space-y-4 mt-6">
                    <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-gray-500" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-500">Email</p>
                            <p className="text-sm text-gray-900">{user.email}</p>
                        </div>
                        {user.email_verification ? (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                <CheckCircle2 className="w-3 h-3 mr-1" /> Verified
                            </span>
                        ) : (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                <XCircle className="w-3 h-3 mr-1" /> Unverified
                            </span>
                        )}
                    </div>
                    <div className="flex items-center space-x-3">
                        <BadgeInfo className="w-5 h-5 text-gray-500" />
                        <div>
                            <p className="text-sm font-medium text-gray-500">User Status</p>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.user_status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {user.user_status ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Briefcase className="w-5 h-5 text-gray-500" />
                        <div>
                            <p className="text-sm font-medium text-gray-500">Role</p>
                            <p className="text-sm text-gray-900">{user.role || 'No Role'}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-gray-500" />
                        <div>
                            <p className="text-sm font-medium text-gray-500">Created At</p>
                            <p className="text-sm text-gray-900">{new Date(parseInt(user.created_at)).toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Clock className="w-5 h-5 text-gray-500" />
                        <div>
                            <p className="text-sm font-medium text-gray-500">Last Updated</p>
                            <p className="text-sm text-gray-900">{new Date(parseInt(user.updated_at)).toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


// Pagination Component
interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div className="flex justify-center items-center space-x-2 mt-4">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <ChevronLeft className="h-4 w-4" />
            </button>
            {pages.map(page => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`px-3 py-1 text-sm font-medium rounded-md ${
                        page === currentPage
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                    {page}
                </button>
            ))}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <ChevronRight className="h-4 w-4" />
            </button>
        </div>
    );
};

export default function UserManagement() {
    const [activeTab, setActiveTab] = useState<'users' | 'sessions'>('users');
    const [users, setUsers] = useState<User[]>([]);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [isLoadingSessions, setIsLoadingSessions] = useState(false);
    const [userError, setUserError] = useState<string | null>(null);
    const [sessionError, setSessionError] = useState<string | null>(null);

    // User detail dialog states
    const [showUserDetailDialog, setShowUserDetailDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);


    // Pagination states
    const [userCurrentPage, setUserCurrentPage] = useState(1);
    const [sessionCurrentPage, setSessionCurrentPage] = useState(1);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', message: '', onConfirm: () => {} });

    // Filters for users
    const [userFilters, setUserFilters] = useState({
        search: '',
        role: '',
        status: '',
        emailVerified: '',
    });

    // Filters for sessions
    const [sessionFilters, setSessionFilters] = useState({
        search: '',
        device: '',
        app: '',
    });

    // Fetch users from the provided API endpoint using authService
    const fetchUsers = async () => {
        setIsLoadingUsers(true);
        setUserError(null);
        try {
            const response = await fetch(`${BASE_URL}/get-all-users`, {
                method: 'GET',
                headers: authService.getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }

            const data: ApiResponse<User[]> = await response.json();
            setUsers(data.data);
        } catch (error) {
            setUserError(error instanceof Error ? error.message : 'Failed to fetch users');
        } finally {
            setIsLoadingUsers(false);
        }
    };

    // Fetch sessions from the provided API endpoint using authService
    const fetchSessions = async () => {
        setIsLoadingSessions(true);
        setSessionError(null);
        try {
            const response = await fetch(`${BASE_URL}/get-sessions`, {
                method: 'GET',
                headers: authService.getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch sessions');
            }

            const data: ApiResponse<Session[]> = await response.json();
            setSessions(data.data);
        } catch (error) {
            setSessionError(error instanceof Error ? error.message : 'Failed to fetch sessions');
        } finally {
            setIsLoadingSessions(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'users') {
            fetchUsers();
        } else {
            fetchSessions();
        }
    }, [activeTab]);

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(userFilters.search.toLowerCase()) ||
            user.username.toLowerCase().includes(userFilters.search.toLowerCase()) ||
            user.email.toLowerCase().includes(userFilters.search.toLowerCase());
        const matchesRole = !userFilters.role || user.role === userFilters.role;
        const matchesStatus = !userFilters.status ||
            (userFilters.status === 'active' ? user.user_status : !user.user_status);
        const matchesEmailVerified = !userFilters.emailVerified ||
            (userFilters.emailVerified === 'verified' ? user.email_verification : !user.email_verification);

        return matchesSearch && matchesRole && matchesStatus && matchesEmailVerified;
    });

    const filteredSessions = sessions.filter(session => {
        const matchesSearch = session.user.name.toLowerCase().includes(sessionFilters.search.toLowerCase()) ||
            session.user.username.toLowerCase().includes(sessionFilters.search.toLowerCase());
        const matchesDevice = !sessionFilters.device || session.device.toLowerCase().includes(sessionFilters.device.toLowerCase());
        const matchesApp = !sessionFilters.app || session.app === sessionFilters.app;

        return matchesSearch && matchesDevice && matchesApp;
    });

    const availableRoles = ['All Roles', ...Array.from(new Set(users.map(u => u.role).filter(Boolean)))];
    const availableDevices = ['All Devices', ...Array.from(new Set(sessions.map(s => s.device)))];
    const availableApps = ['All Apps', ...Array.from(new Set(sessions.map(s => s.app)))];

    const handleUserFilterChange = (filterType: string, value: string) => {
        setUserFilters(prev => ({
            ...prev,
            [filterType]: value === 'All Roles' || value === 'All Status' || value === 'All' ? '' : value
        }));
        setUserCurrentPage(1); // Reset to first page on filter change
    };

    const handleSessionFilterChange = (filterType: string, value: string) => {
        setSessionFilters(prev => ({
            ...prev,
            [filterType]: value === 'All Devices' || value === 'All Apps' ? '' : value
        }));
        setSessionCurrentPage(1); // Reset to first page on filter change
    };

    const clearUserFilters = () => {
        setUserFilters({
            search: '',
            role: '',
            status: '',
            emailVerified: '',
        });
        setUserCurrentPage(1);
    };

    const clearSessionFilters = () => {
        setSessionFilters({
            search: '',
            device: '',
            app: '',
        });
        setSessionCurrentPage(1);
    };

    const formatDate = (timestamp: string) => {
        if (!timestamp) return 'N/A';
        return new Date(parseInt(timestamp)).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status: boolean) => {
        return status
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800';
    };

    const getDeviceIcon = (device: string) => {
        const normalizedDevice = device.toLowerCase();
        if (normalizedDevice.includes('desktop') || normalizedDevice.includes('pc')) return <PcCase className="h-5 w-5 text-gray-500" />;
        if (normalizedDevice.includes('laptop')) return <Laptop className="h-5 w-5 text-gray-500" />;
        if (normalizedDevice.includes('mobile') || normalizedDevice.includes('phone')) return <Smartphone className="h-5 w-5 text-gray-500" />;
        if (normalizedDevice.includes('tablet')) return <Tablet className="h-5 w-5 text-gray-500" />;
        return <Laptop className="h-5 w-5 text-gray-500" />;
    };

    const handleTerminateSession = (sessionId: number) => {
        setModalContent({
            title: 'Terminate Session',
            message: `Are you sure you want to terminate session ID #${sessionId}? This action cannot be undone.`,
            onConfirm: async () => {
                setIsModalOpen(false);
                try {
                    // API call to terminate the session
                    const response = await fetch(`${BASE_URL}/delete-session/${sessionId}`, {
                        method: 'DELETE',
                        headers: authService.getAuthHeaders(),
                    });

                    if (!response.ok) {
                        throw new Error('Failed to terminate session');
                    }

                    console.log('Session terminated successfully:', sessionId);
                    // After successful termination, refresh sessions
                    fetchSessions();
                } catch (error) {
                    console.error('Failed to terminate session:', error);
                    // You might want to show an error message to the user here
                }
            },
        });
        setIsModalOpen(true);
    };

    // Function to handle showing user details in a dialog
    const handleViewDetail = (user: User) => {
        setSelectedUser(user);
        setShowUserDetailDialog(true);
    };

    // Function to close the user detail dialog
    const handleCloseUserDetailDialog = () => {
        setShowUserDetailDialog(false);
        setSelectedUser(null);
    };


    const handleUserAction = (userId: string, action: 'view' | 'edit' | 'toggle') => {
        try {
            switch (action) {
                case 'view':
                    const userToView = users.find(u => u.id === userId);
                    if(userToView) handleViewDetail(userToView);
                    break;
                case 'edit':
                    console.log('Editing user:', userId);
                    // Add navigation to user edit form
                    break;
                case 'toggle':
                    const userToToggle = users.find(u => u.id === userId);
                    if (userToToggle) {
                        const statusText = userToToggle.user_status ? 'deactivate' : 'activate';
                        setModalContent({
                            title: `${statusText.charAt(0).toUpperCase() + statusText.slice(1)} User`,
                            message: `Are you sure you want to ${statusText} user "${userToToggle.name}"?`,
                            onConfirm: async () => {
                                setIsModalOpen(false);
                                console.log('Toggling user status for user:', userId);
                                // Add API call to toggle user status
                                fetchUsers();
                            },
                        });
                        setIsModalOpen(true);
                    }
                    break;
            }
        } catch (error) {
            console.error('Failed to perform user action:', error);
        }
    };

    // Pagination logic for users
    const totalUserPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
    const displayedUsers = filteredUsers.slice(
        (userCurrentPage - 1) * ITEMS_PER_PAGE,
        userCurrentPage * ITEMS_PER_PAGE
    );

    // Pagination logic for sessions
    const totalSessionPages = Math.ceil(filteredSessions.length / ITEMS_PER_PAGE);
    const displayedSessions = filteredSessions.slice(
        (sessionCurrentPage - 1) * ITEMS_PER_PAGE,
        sessionCurrentPage * ITEMS_PER_PAGE
    );

    return (
        <div className="min-h-screen text-gray-900 p-6 font-sans transition-colors duration-300">
            <CustomModal
                title={modalContent.title}
                message={modalContent.message}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={modalContent.onConfirm}
            />
            <UserDetailDialog
                isOpen={showUserDetailDialog}
                user={selectedUser}
                onClose={handleCloseUserDetailDialog}
            />

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">User Management</h1>
                    <p className="text-gray-600 mt-1">Manage users and active sessions</p>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={() => activeTab === 'users' ? fetchUsers() : fetchSessions()}
                        className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg shadow-sm hover:bg-gray-300 transition-colors duration-150"
                    >
                        <RefreshCcw className="w-5 h-5" />
                        <span>Refresh</span>
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="mb-6">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                                activeTab === 'users'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            All Users ({users.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('sessions')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                                activeTab === 'sessions'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Active Sessions ({sessions.length})
                        </button>
                    </nav>
                </div>
            </div>

            {/* Users Tab Content */}
            {activeTab === 'users' && (
                <div className="space-y-6">
                    {/* User Statistics */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
                            <p className="text-2xl font-bold">{users.length}</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="text-sm font-medium text-gray-500">Active Users</h3>
                            <p className="text-2xl font-bold text-green-600">{users.filter(u => u.user_status).length}</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="text-sm font-medium text-gray-500">Verified Emails</h3>
                            <p className="text-2xl font-bold text-blue-600">{users.filter(u => u.email_verification).length}</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="text-sm font-medium text-gray-500">Inactive Users</h3>
                            <p className="text-2xl font-bold text-red-600">{users.filter(u => !u.user_status).length}</p>
                        </div>
                    </div>

                    {/* User Filters */}
                    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                            {/* Search */}
                            <div className="col-span-1 lg:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Search
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search users..."
                                        value={userFilters.search}
                                        onChange={(e) => handleUserFilterChange('search', e.target.value)}
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                                    />
                                </div>
                            </div>

                            {/* Role Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Role
                                </label>
                                <div className="relative">
                                    <select
                                        value={userFilters.role}
                                        onChange={(e) => handleUserFilterChange('role', e.target.value)}
                                        className="w-full appearance-none px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                                    >
                                        <option value="">All Roles</option>
                                        {availableRoles.slice(1).map((role) => (
                                            <option key={role} value={role}>{role}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Status Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Status
                                </label>
                                <div className="relative">
                                    <select
                                        value={userFilters.status}
                                        onChange={(e) => handleUserFilterChange('status', e.target.value)}
                                        className="w-full appearance-none px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                                    >
                                        <option value="">All Status</option>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                    <ChevronDown className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Email Verification Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Status
                                </label>
                                <div className="relative">
                                    <select
                                        value={userFilters.emailVerified}
                                        onChange={(e) => handleUserFilterChange('emailVerified', e.target.value)}
                                        className="w-full appearance-none px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                                    >
                                        <option value="">All</option>
                                        <option value="verified">Verified</option>
                                        <option value="unverified">Unverified</option>
                                    </select>
                                    <ChevronDown className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={clearUserFilters}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>

                    {/* Users Table */}
                    {isLoadingUsers ? (
                        <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse border border-gray-200">
                            <div className="space-y-3">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="h-8 bg-gray-200 rounded-md"></div>
                                ))}
                            </div>
                        </div>
                    ) : userError ? (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                            <div className="text-red-800 flex items-center space-x-2">
                                <AlertTriangle className="w-5 h-5" />
                                <div>
                                    <p className="font-medium">Error: {userError}</p>
                                    <button
                                        onClick={fetchUsers}
                                        className="mt-2 bg-red-100 text-red-800 px-3 py-1 text-sm rounded-md hover:bg-red-200 transition-colors"
                                    >
                                        Retry
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : filteredUsers.length > 0 ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left table-auto">
                                    <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                    {displayedUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <img className="h-10 w-10 rounded-full object-cover" src={user.avatar || 'https://placehold.co/100x100/A0B9CE/white?text=JD'} alt={user.name} />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                        <div className="text-sm text-gray-500">@{user.username}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{user.email}</div>
                                                <div className="text-xs text-gray-500 flex items-center">
                                                    {user.email_verification ? (
                                                        <>
                                                            <CheckCircle2 className="w-3 h-3 text-green-500 mr-1" /> Verified
                                                        </>
                                                    ) : (
                                                        <>
                                                            <XCircle className="w-3 h-3 text-red-500 mr-1" /> Unverified
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {user.role || 'No Role'}
                          </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(user.user_status)}`}>
                            {user.user_status ? 'Active' : 'Inactive'}
                          </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(user.created_at)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                <button
                                                    onClick={() => handleUserAction(user.id, 'view')}
                                                    className="text-blue-600 hover:underline transition-colors"
                                                >
                                                    View
                                                </button>
                                                <button
                                                    onClick={() => handleUserAction(user.id, 'edit')}
                                                    className="text-green-600 hover:underline transition-colors"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleUserAction(user.id, 'toggle')}
                                                    className={`${user.user_status ? 'text-red-600' : 'text-green-600'} hover:underline transition-colors`}
                                                >
                                                    {user.user_status ? 'Deactivate' : 'Activate'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                            <Pagination
                                currentPage={userCurrentPage}
                                totalPages={totalUserPages}
                                onPageChange={setUserCurrentPage}
                            />
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
                            <Users className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium">No users found</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                No users match your current filters.
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Sessions Tab Content */}
            {activeTab === 'sessions' && (
                <div className="space-y-6">
                    {/* Session Statistics */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="text-sm font-medium text-gray-500">Active Sessions</h3>
                            <p className="text-2xl font-bold">{sessions.length}</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="text-sm font-medium text-gray-500">Unique Users</h3>
                            <p className="text-2xl font-bold text-blue-600">{new Set(sessions.map(s => s.user_id)).size}</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="text-sm font-medium text-gray-500">Unique Devices</h3>
                            <p className="text-2xl font-bold text-green-600">{new Set(sessions.map(s => s.device)).size}</p>
                        </div>
                    </div>

                    {/* Session Filters */}
                    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-4 items-end">
                            {/* Search */}
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Search
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search sessions..."
                                        value={sessionFilters.search}
                                        onChange={(e) => handleSessionFilterChange('search', e.target.value)}
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                                    />
                                </div>
                            </div>

                            {/* Device Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Device
                                </label>
                                <div className="relative">
                                    <select
                                        value={sessionFilters.device}
                                        onChange={(e) => handleSessionFilterChange('device', e.target.value)}
                                        className="w-full appearance-none px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                                    >
                                        <option value="">All Devices</option>
                                        {availableDevices.slice(1).map((device) => (
                                            <option key={device} value={device}>{device}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* App Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Application
                                </label>
                                <div className="relative">
                                    <select
                                        value={sessionFilters.app}
                                        onChange={(e) => handleSessionFilterChange('app', e.target.value)}
                                        className="w-full appearance-none px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                                    >
                                        <option value="">All Apps</option>
                                        {availableApps.slice(1).map((app) => (
                                            <option key={app} value={app}>{app}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={clearSessionFilters}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>

                    {/* Sessions Table */}
                    {isLoadingSessions ? (
                        <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse border border-gray-200">
                            <div className="space-y-3">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="h-8 bg-gray-200 rounded-md"></div>
                                ))}
                            </div>
                        </div>
                    ) : sessionError ? (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                            <div className="text-red-800 flex items-center space-x-2">
                                <AlertTriangle className="w-5 h-5" />
                                <div>
                                    <p className="font-medium">Error: {sessionError}</p>
                                    <button
                                        onClick={fetchSessions}
                                        className="mt-2 bg-red-100 text-red-800 px-3 py-1 text-sm rounded-md hover:bg-red-200 transition-colors"
                                    >
                                        Retry
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : filteredSessions.length > 0 ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left table-auto">
                                    <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Device Info</th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Application</th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Session Info</th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Last Activity</th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                    {displayedSessions.map((session) => (
                                        <tr key={session.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <img className="h-10 w-10 rounded-full object-cover" src={session.user.avatar || 'https://placehold.co/100x100/F2C94C/white?text=JS'} alt={session.user.name} />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium">{session.user.name}</div>
                                                        <div className="text-sm text-gray-500">@{session.user.username}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center space-x-2">
                                                    {getDeviceIcon(session.device)}
                                                    <span className="text-sm font-medium">{session.device}</span>
                                                </div>
                                                <div className="text-xs text-gray-500">HWID: {session.hwid}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium">{session.app}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium">Session #{session.id}</div>
                                                <div className="text-xs text-gray-500">
                                                    Created: {formatDate(session.created_at)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(session.updated_at)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => handleTerminateSession(session.id)}
                                                    className="flex items-center space-x-1 text-red-600 hover:underline transition-colors"
                                                >
                                                    <LogOut className="h-4 w-4" />
                                                    <span>Terminate</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                            <Pagination
                                currentPage={sessionCurrentPage}
                                totalPages={totalSessionPages}
                                onPageChange={setSessionCurrentPage}
                            />
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
                            <Terminal className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium">No active sessions found</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                No sessions match your current filters.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
