import React, { useState, useEffect } from 'react';
import {
    Camera, User, Mail, Calendar, Lock, Check, AlertCircle,
    RefreshCw, Edit3, Shield, Monitor
} from 'lucide-react';

import AvatarCropDialog from '../dialogs/AvatarCropDialog';
import ChangePasswordDialog from '../dialogs/ChangePasswordDialog';
import EmailVerificationDialog from '../dialogs/EmailVerificationDialog';


interface UserData {
    id: string;
    username: string;
    email: string;
    email_verification: boolean;
    name: string;
    user_status: boolean;
    avatar: string;
    avatar_link: string;
    role: string;
    created_at: string;
    updated_at: string;
}

interface SessionData {
    app_name: string;
    device: string;
}

const UserProfile: React.FC = () => {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [sessionData, setSessionData] = useState<SessionData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingSession, setIsLoadingSession] = useState(true);
    const [error, setError] = useState('');
    const [sessionError, setSessionError] = useState('');
    const [dialogs, setDialogs] = useState({
        avatar: false,
        password: false,
        emailVerification: false
    });

    useEffect(() => {
        loadUserData();
        loadCurrentSession();
    }, []);

    const loadUserData = async () => {
        setIsLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('auth_token');
            const apiKey = '12345678';

            console.log('Loading user data with token:', token, 'and API key:', apiKey);

            const response = await fetch(`https://auth.nautiproconnect.com/api/v1/web/user`, {
                method: 'GET',
                headers: {
                    'x-api-key': apiKey || '',
                    'authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user data');
            }

            const result = await response.json();
            setUserData(result.data);
        } catch (error: any) {
            setError('Failed to load profile information');
            console.error('Failed to load user data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadCurrentSession = async () => {
        setIsLoadingSession(true);
        setSessionError('');
        try {
            const token = localStorage.getItem('auth_token');
            const apiKey = '12345678';

            console.log('Loading current session with token:', token, 'and API key:', apiKey);

            const response = await fetch(`https://auth.nautiproconnect.com/api/v1/web/current-session`, {
                method: 'GET',
                headers: {
                    'x-api-key': apiKey || '',
                    'authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch session data');
            }

            const result = await response.json();
            setSessionData(result.data);
        } catch (error: any) {
            setSessionError('Failed to load session information');
            console.error('Failed to load session data:', error);
        } finally {
            setIsLoadingSession(false);
        }
    };

    const openDialog = (type: keyof typeof dialogs) => {
        setDialogs(prev => ({ ...prev, [type]: true }));
    };

    const closeDialog = (type: keyof typeof dialogs) => {
        setDialogs(prev => ({ ...prev, [type]: false }));
    };

    const handleAvatarUpdate = (newAvatar: string) => {
        if (userData) {
            setUserData(prev => prev ? { ...prev, avatar_link: newAvatar } : null);
            // Show success message
            setTimeout(() => loadUserData(), 1000);
        }
    };

    const handlePasswordChange = () => {
        // Show success message
        console.log('Password changed successfully');
    };

    const handleEmailVerification = () => {
        if (userData) {
            setUserData(prev => prev ? { ...prev, email_verification: true } : null);
            // Show success message
        }
    };

    const formatDate = (timestamp: string): string => {
        return new Date(parseInt(timestamp)).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getTimeAgo = (timestamp: string): string => {
        const now = new Date();
        const date = new Date(parseInt(timestamp));
        const diffInMs = now.getTime() - date.getTime();
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

        if (diffInDays === 0) return 'Today';
        if (diffInDays === 1) return 'Yesterday';
        if (diffInDays < 7) return `${diffInDays} days ago`;
        if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
        if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
        return `${Math.floor(diffInDays / 365)} years ago`;
    };

    if (isLoading) {
        return (
            <div className="p-6 animate-pulse">
                <div className="bg-white rounded-lg shadow overflow-hidden [data-theme='dark']_&:bg-gray-800 mb-6">
                    <div className="p-6">
                        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                            <div className="w-24 h-24 bg-gray-200 rounded-full [data-theme='dark']_&:bg-gray-700"></div>
                            <div className="flex-1 text-center sm:text-left">
                                <div className="h-6 bg-gray-200 rounded w-32 mb-2 [data-theme='dark']_&:bg-gray-700"></div>
                                <div className="h-4 bg-gray-200 rounded w-24 mb-2 [data-theme='dark']_&:bg-gray-700"></div>
                                <div className="h-4 bg-gray-200 rounded w-20 [data-theme='dark']_&:bg-gray-700"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {[1, 2].map((i) => (
                        <div key={i} className="bg-white rounded-lg shadow overflow-hidden [data-theme='dark']_&:bg-gray-800">
                            <div className="p-6">
                                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4 [data-theme='dark']_&:bg-gray-700"></div>
                                <div className="space-y-4">
                                    {[1, 2, 3].map((j) => (
                                        <div key={j} className="h-16 bg-gray-200 rounded [data-theme='dark']_&:bg-gray-700"></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error && !userData) {
        return (
            <div className="p-6">
                <div className="bg-white rounded-lg shadow overflow-hidden [data-theme='dark']_&:bg-gray-800">
                    <div className="p-8 text-center">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-800 [data-theme='dark']_&:text-white mb-2">
                            Failed to load profile
                        </h3>
                        <p className="text-gray-600 [data-theme='dark']_&:text-gray-400 mb-6">
                            We couldn&#39;t load your profile information. Please try again.
                        </p>
                        <button
                            onClick={loadUserData}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2 mx-auto"
                        >
                            <RefreshCw className="w-4 h-4" />
                            <span>Try Again</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!userData) return null;

    return (
        <div className="p-6">
            <div className="grid gap-6">
                {/* Profile Header */}
                <div className="bg-white rounded-lg shadow overflow-hidden [data-theme='dark']_&:bg-gray-800">
                    <div className="p-6">
                        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-gray-100 [data-theme='dark']_&:ring-gray-700">
                                    {userData.avatar_link ? (
                                        <img
                                            src={userData.avatar_link}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-200 flex items-center justify-center [data-theme='dark']_&:bg-gray-600">
                                            <User className="w-8 h-8 text-gray-400" />
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => openDialog('avatar')}
                                    className="absolute -bottom-1 -right-1 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 shadow-lg transition-colors"
                                    title="Change profile picture"
                                >
                                    <Camera className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex-1 text-center sm:text-left">
                                <h2 className="text-xl font-semibold text-gray-800 [data-theme='dark']_&:text-white">
                                    {userData.name}
                                </h2>
                                <p className="text-gray-600 [data-theme='dark']_&:text-gray-400">
                                    @{userData.username}
                                </p>
                                <div className="flex items-center justify-center sm:justify-start space-x-4 mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 [data-theme='dark']_&:bg-blue-900/30 [data-theme='dark']_&:text-blue-300">
                    {userData.role}
                  </span>
                                    {userData.user_status && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 [data-theme='dark']_&:bg-green-900/30 [data-theme='dark']_&:text-green-300">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></div>
                      Active
                    </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Account Information */}
                <div className="bg-white rounded-lg shadow overflow-hidden [data-theme='dark']_&:bg-gray-800">
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-800 [data-theme='dark']_&:text-white mb-4">
                            Account Information
                        </h3>

                        <div className="space-y-4">
                            {/* Email */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg [data-theme='dark']_&:bg-gray-700">
                                <div className="flex items-center space-x-3">
                                    <Mail className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-800 [data-theme='dark']_&:text-white">
                                            Email Address
                                        </p>
                                        <p className="text-sm text-gray-600 [data-theme='dark']_&:text-gray-400">
                                            {userData.email}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    {userData.email_verification ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 [data-theme='dark']_&:bg-green-900/30 [data-theme='dark']_&:text-green-300">
                      <Check className="w-3 h-3 mr-1" />
                      Verified
                    </span>
                                    ) : (
                                        <button
                                            onClick={() => openDialog('emailVerification')}
                                            className="px-3 py-1.5 text-xs font-medium text-orange-700 bg-orange-100 rounded-full hover:bg-orange-200 [data-theme='dark']_&:bg-orange-900/30 [data-theme='dark']_&:text-orange-300 [data-theme='dark']_&:hover:bg-orange-800/30 transition-colors"
                                        >
                                            Verify Email
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Username */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg [data-theme='dark']_&:bg-gray-700">
                                <div className="flex items-center space-x-3">
                                    <User className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-800 [data-theme='dark']_&:text-white">
                                            Username
                                        </p>
                                        <p className="text-sm text-gray-600 [data-theme='dark']_&:text-gray-400">
                                            @{userData.username}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Member Since */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg [data-theme='dark']_&:bg-gray-700">
                                <div className="flex items-center space-x-3">
                                    <Calendar className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-800 [data-theme='dark']_&:text-white">
                                            Member Since
                                        </p>
                                        <p className="text-sm text-gray-600 [data-theme='dark']_&:text-gray-400">
                                            {formatDate(userData.created_at)}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-xs text-gray-500 [data-theme='dark']_&:text-gray-400">
                  {getTimeAgo(userData.created_at)}
                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Security Settings */}
                <div className="bg-white rounded-lg shadow overflow-hidden [data-theme='dark']_&:bg-gray-800">
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-800 [data-theme='dark']_&:text-white mb-4">
                            Security & Privacy
                        </h3>

                        <div className="space-y-4">
                            {/* Current Session */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg [data-theme='dark']_&:bg-gray-700">
                                <div className="flex items-center space-x-3">
                                    <Monitor className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-800 [data-theme='dark']_&:text-white">
                                            Current Session
                                        </p>
                                        {isLoadingSession ? (
                                            <div className="flex items-center space-x-2">
                                                <div className="w-4 h-4 bg-gray-200 rounded animate-pulse [data-theme='dark']_&:bg-gray-600"></div>
                                                <div className="w-20 h-3 bg-gray-200 rounded animate-pulse [data-theme='dark']_&:bg-gray-600"></div>
                                            </div>
                                        ) : sessionError ? (
                                            <p className="text-sm text-yellow-500">
                                                No Session Active
                                            </p>
                                        ) : sessionData ? (
                                            <div className="text-sm text-gray-600 [data-theme='dark']_&:text-gray-400">
                                                <p>{sessionData.device}</p>
                                                <p className="text-xs text-gray-500 [data-theme='dark']_&:text-gray-500">
                                                    {sessionData.app_name}
                                                </p>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-600 [data-theme='dark']_&:text-gray-400">
                                                No active session
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={loadCurrentSession}
                                        className="p-1.5 text-gray-400 hover:text-gray-600 [data-theme='dark']_&:hover:text-gray-300 transition-colors"
                                        title="Refresh session"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                    </button>
                                    {sessionData && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 [data-theme='dark']_&:bg-green-900/30 [data-theme='dark']_&:text-green-300">
                                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></div>
                                            Active
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Password */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg [data-theme='dark']_&:bg-gray-700">
                                <div className="flex items-center space-x-3">
                                    <Lock className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-800 [data-theme='dark']_&:text-white">
                                            Password
                                        </p>
                                        <p className="text-sm text-gray-600 [data-theme='dark']_&:text-gray-400">
                                            Last updated {getTimeAgo(userData.updated_at)}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => openDialog('password')}
                                    className="px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 [data-theme='dark']_&:bg-blue-900/30 [data-theme='dark']_&:text-blue-300 [data-theme='dark']_&:hover:bg-blue-800/30 transition-colors flex items-center space-x-1"
                                >
                                    <Edit3 className="w-3 h-3" />
                                    <span>Change</span>
                                </button>
                            </div>

                            {/* Account Status */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg [data-theme='dark']_&:bg-gray-700">
                                <div className="flex items-center space-x-3">
                                    <Shield className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-800 [data-theme='dark']_&:text-white">
                                            Account Status
                                        </p>
                                        <p className="text-sm text-gray-600 [data-theme='dark']_&:text-gray-400">
                                            Your account is {userData.user_status ? 'active' : 'inactive'}
                                        </p>
                                    </div>
                                </div>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    userData.user_status
                                        ? 'bg-green-100 text-green-800 [data-theme="dark"]_&:bg-green-900/30 [data-theme="dark"]_&:text-green-300'
                                        : 'bg-red-100 text-red-800 [data-theme="dark"]_&:bg-red-900/30 [data-theme="dark"]_&:text-red-300'
                                }`}>
                  {userData.user_status ? 'Active' : 'Inactive'}
                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dialogs */}
            <AvatarCropDialog
                isOpen={dialogs.avatar}
                onClose={() => closeDialog('avatar')}
                onSave={handleAvatarUpdate}
                currentAvatar={userData.avatar_link}
            />

            <ChangePasswordDialog
                isOpen={dialogs.password}
                onClose={() => closeDialog('password')}
                onSuccess={handlePasswordChange}
            />

            <EmailVerificationDialog
                isOpen={dialogs.emailVerification}
                onClose={() => closeDialog('emailVerification')}
                email={userData.email}
                onSuccess={handleEmailVerification}
            />
        </div>
    );
};

export default UserProfile;