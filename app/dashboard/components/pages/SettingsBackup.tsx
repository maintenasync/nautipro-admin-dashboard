import React, { useState } from 'react';
import { User, Shield, Bell, Palette, Globe } from 'lucide-react';
import UserProfile from '../profile/UserProfile';

// Tab navigation component
const TabNavigation = ({ activeTab, onTabChange }: {
    activeTab: string;
    onTabChange: (tab: string) => void;
}) => {
    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'account', label: 'Account', icon: SettingsBackup },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'preferences', label: 'Preferences', icon: Palette },
    ];

    return (
        <div className="border-b border-gray-200 [data-theme='dark']_&:border-gray-700">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                                isActive
                                    ? 'border-blue-500 text-blue-600 [data-theme="dark"]_&:text-blue-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 [data-theme="dark"]_&:text-gray-400 [data-theme="dark"]_&:hover:text-gray-300'
                            }`}
                        >
                            <Icon className={`mr-2 h-5 w-5 ${
                                isActive ? 'text-blue-500 [data-theme="dark"]_&:text-blue-400' : 'text-gray-400 group-hover:text-gray-500'
                            }`} />
                            {tab.label}
                        </button>
                    );
                })}
            </nav>
        </div>
    );
};

// Account Settings Tab
const AccountSettings = () => {
    const [settings, setSettings] = useState({
        twoFactor: false,
        autoSave: true,
        darkMode: false
    });

    const handleToggle = (setting: keyof typeof settings) => {
        setSettings(prev => ({
            ...prev,
            [setting]: !prev[setting]
        }));
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 [data-theme='dark']_&:text-white mb-4">
                    Account Preferences
                </h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg [data-theme='dark']_&:border-gray-600">
                        <div>
                            <h4 className="text-sm font-medium text-gray-900 [data-theme='dark']_&:text-white">
                                Two-factor authentication
                            </h4>
                            <p className="text-sm text-gray-500 [data-theme='dark']_&:text-gray-400">
                                Add an extra layer of security to your account
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={settings.twoFactor}
                                onChange={() => handleToggle('twoFactor')}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:peer-focus:ring-blue-800"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg [data-theme='dark']_&:border-gray-600">
                        <div>
                            <h4 className="text-sm font-medium text-gray-900 [data-theme='dark']_&:text-white">
                                Auto-save data
                            </h4>
                            <p className="text-sm text-gray-500 [data-theme='dark']_&:text-gray-400">
                                Automatically save your work as you type
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={settings.autoSave}
                                onChange={() => handleToggle('autoSave')}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:peer-focus:ring-blue-800"></div>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Security Settings Tab
const SecuritySettings = () => {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 [data-theme='dark']_&:text-white mb-4">
                    Security Settings
                </h3>
                <div className="space-y-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 [data-theme='dark']_&:bg-yellow-900/20 [data-theme='dark']_&:border-yellow-700">
                        <h4 className="text-sm font-medium text-yellow-800 [data-theme='dark']_&:text-yellow-200 mb-2">
                            Security Recommendations
                        </h4>
                        <ul className="text-sm text-yellow-700 [data-theme='dark']_&:text-yellow-300 space-y-1">
                            <li>• Enable two-factor authentication for better security</li>
                            <li>• Use a strong, unique password with at least 8 characters</li>
                            <li>• Review your recent login activity regularly</li>
                            <li>• Keep your recovery email up to date</li>
                        </ul>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4 [data-theme='dark']_&:border-gray-700">
                        <h4 className="text-sm font-medium text-gray-900 [data-theme='dark']_&:text-white mb-3">
                            Recent Login Activity
                        </h4>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between py-2 border-b border-gray-100 [data-theme='dark']_&:border-gray-600 last:border-b-0">
                                <div>
                                    <p className="text-sm font-medium text-gray-900 [data-theme='dark']_&:text-white">
                                        Current session
                                    </p>
                                    <p className="text-xs text-gray-500 [data-theme='dark']_&:text-gray-400">
                                        Today at 09:30 AM • Chrome • Jakarta, Indonesia
                                    </p>
                                </div>
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 [data-theme='dark']_&:bg-green-900/30 [data-theme='dark']_&:text-green-300">
                  Active
                </span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-gray-100 [data-theme='dark']_&:border-gray-600 last:border-b-0">
                                <div>
                                    <p className="text-sm font-medium text-gray-900 [data-theme='dark']_&:text-white">
                                        Previous session
                                    </p>
                                    <p className="text-xs text-gray-500 [data-theme='dark']_&:text-gray-400">
                                        Yesterday at 06:15 PM • Firefox • Jakarta, Indonesia
                                    </p>
                                </div>
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:text-gray-300">
                  Ended
                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Notifications Settings Tab
const NotificationSettings = () => {
    const [notifications, setNotifications] = useState({
        systemUpdates: true,
        securityAlerts: true,
        weeklySummary: false,
        marketingEmails: false,
        pushNotifications: true,
        emailDigest: true
    });

    const handleToggle = (setting: keyof typeof notifications) => {
        setNotifications(prev => ({
            ...prev,
            [setting]: !prev[setting]
        }));
    };

    const notificationItems = [
        {
            key: 'systemUpdates' as const,
            label: 'System updates',
            desc: 'Get notified about system maintenance and updates'
        },
        {
            key: 'securityAlerts' as const,
            label: 'Security alerts',
            desc: 'Important security-related notifications'
        },
        {
            key: 'weeklySummary' as const,
            label: 'Weekly summary',
            desc: 'Weekly summary of your activity and insights'
        },
        {
            key: 'marketingEmails' as const,
            label: 'Marketing emails',
            desc: 'Product updates and promotional content'
        },
        {
            key: 'pushNotifications' as const,
            label: 'Push notifications',
            desc: 'Browser push notifications for important updates'
        },
        {
            key: 'emailDigest' as const,
            label: 'Daily digest',
            desc: 'Daily email digest of your activities'
        }
    ];

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 [data-theme='dark']_&:text-white mb-4">
                    Notification Preferences
                </h3>
                <div className="space-y-4">
                    <div className="border border-gray-200 rounded-lg p-4 [data-theme='dark']_&:border-gray-700">
                        <h4 className="text-sm font-medium text-gray-900 [data-theme='dark']_&:text-white mb-4">
                            Email & Push Notifications
                        </h4>
                        <div className="space-y-4">
                            {notificationItems.map((item) => (
                                <div key={item.key} className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 [data-theme='dark']_&:text-white">
                                            {item.label}
                                        </p>
                                        <p className="text-sm text-gray-500 [data-theme='dark']_&:text-gray-400">
                                            {item.desc}
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={notifications[item.key]}
                                            onChange={() => handleToggle(item.key)}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:peer-focus:ring-blue-800"></div>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Preferences Settings Tab
const PreferencesSettings = () => {
    const [preferences, setPreferences] = useState({
        theme: 'system',
        language: 'en',
        timezone: 'Asia/Jakarta',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12'
    });

    const handleChange = (key: keyof typeof preferences, value: string) => {
        setPreferences(prev => ({
            ...prev,
            [key]: value
        }));
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 [data-theme='dark']_&:text-white mb-4">
                    Application Preferences
                </h3>
                <div className="space-y-4">
                    <div className="border border-gray-200 rounded-lg p-4 [data-theme='dark']_&:border-gray-700">
                        <h4 className="text-sm font-medium text-gray-900 [data-theme='dark']_&:text-white mb-4">
                            Appearance & Language
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 [data-theme='dark']_&:text-gray-300 mb-2">
                                    Theme
                                </label>
                                <select
                                    value={preferences.theme}
                                    onChange={(e) => handleChange('theme', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:text-white"
                                >
                                    <option value="system">System Default</option>
                                    <option value="light">Light</option>
                                    <option value="dark">Dark</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 [data-theme='dark']_&:text-gray-300 mb-2">
                                    Language
                                </label>
                                <select
                                    value={preferences.language}
                                    onChange={(e) => handleChange('language', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:text-white"
                                >
                                    <option value="en">English</option>
                                    <option value="id">Bahasa Indonesia</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 [data-theme='dark']_&:text-gray-300 mb-2">
                                    Timezone
                                </label>
                                <select
                                    value={preferences.timezone}
                                    onChange={(e) => handleChange('timezone', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:text-white"
                                >
                                    <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
                                    <option value="Asia/Makassar">Asia/Makassar (WITA)</option>
                                    <option value="Asia/Jayapura">Asia/Jayapura (WIT)</option>
                                    <option value="Asia/Singapore">Asia/Singapore</option>
                                    <option value="UTC">UTC</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 [data-theme='dark']_&:text-gray-300 mb-2">
                                    Date Format
                                </label>
                                <select
                                    value={preferences.dateFormat}
                                    onChange={(e) => handleChange('dateFormat', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:text-white"
                                >
                                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end">
                        <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                            Save Preferences
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Main Settings component
export default function SettingsBackup() {
    const [activeTab, setActiveTab] = useState('profile');

    const renderTabContent = () => {
        switch (activeTab) {
            case 'profile':
                return <UserProfile />;
            case 'account':
                return <AccountSettings />;
            case 'security':
                return <SecuritySettings />;
            case 'notifications':
                return <NotificationSettings />;
            case 'preferences':
                return <PreferencesSettings />;
            default:
                return <UserProfile />;
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header - only show if not in profile tab since UserProfile has its own header */}
            {activeTab !== 'profile' && (
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 [data-theme='dark']_&:text-white">
                        Settings
                    </h1>
                    <p className="text-gray-600 [data-theme='dark']_&:text-gray-400">
                        Manage your account settings, preferences, and security options
                    </p>
                </div>
            )}

            {/* Tab Navigation */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 [data-theme='dark']_&:bg-gray-800 [data-theme='dark']_&:border-gray-700">
                <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

                {/* Tab Content */}
                <div className={activeTab === 'profile' ? '' : 'p-6'}>
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
}