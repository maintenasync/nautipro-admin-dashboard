// app/dashboard/components/pages/NotificationSetting.tsx
// HANYA UPDATE BAGIAN-BAGIAN INI, sisanya tetap sama seperti existing

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useNotificationSetting, useSaveNotificationSetting } from '@/app/hooks/useApiQuery';
import TelegramVerificationDialog from '../dialogs/TelegramVerificationDialog';
import {NotificationSettingUI} from "@/app/types/api";

interface NotificationSettings {
    email: {
        enabled: boolean;
        address: string;
    };
    telegram: {
        enabled: boolean;
        username: string;
        verified: boolean;
    };
    whatsapp: {
        enabled: boolean;
        number: string;
    };
}

export default function NotificationSetting() {
    const { state } = useAuth(); // ← TAMBAH INI untuk get current user
    const { data: apiSettings, isLoading, error } = useNotificationSetting(); // ← TAMBAH INI untuk load dari API
    const saveMutation = useSaveNotificationSetting(); // ← TAMBAH INI untuk save ke API

    const [settings, setSettings] = useState<NotificationSettings>({
        email: {
            enabled: true,
            address: 'user@example.com'
        },
        telegram: {
            enabled: true,
            username: '@maritime_user',
            verified: false
        },
        whatsapp: {
            enabled: false,
            number: '+628123456789'
        }
    });

    const [isVerificationDialogOpen, setIsVerificationDialogOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // ← TAMBAH INI: Load data dari API saat component mount
    useEffect(() => {
        if (apiSettings && state.user) {
            // Transform API data ke format local state
            setSettings({
                email: {
                    enabled: !!apiSettings.email, // enabled jika ada email
                    address: apiSettings.email || state.user.email || ''
                },
                telegram: {
                    enabled: !!apiSettings.telegramUsername, // enabled jika ada username
                    username: apiSettings.telegramUsername || '',
                    verified: !!apiSettings.telegramUsername // verified jika sudah ada username di server
                },
                whatsapp: {
                    enabled: !!apiSettings.whatsappNumber, // enabled jika ada whatsapp number
                    number: apiSettings.whatsappNumber || ''
                }
            });
        }
    }, [apiSettings, state.user]);

    const handleToggle = (type: keyof NotificationSettings) => {
        setSettings(prev => ({
            ...prev,
            [type]: {
                ...prev[type],
                enabled: !prev[type].enabled
            }
        }));
    };

    const handleUpdate = (type: keyof NotificationSettings, field: string, value: string) => {
        setSettings(prev => ({
            ...prev,
            [type]: {
                ...prev[type],
                [field]: value
            }
        }));
    };

    const handleTelegramVerify = () => {
        setIsVerificationDialogOpen(true);
    };

    const handleVerificationSuccess = (username: string) => {
        setSettings(prev => ({
            ...prev,
            telegram: {
                ...prev.telegram,
                username,
                verified: true
            }
        }));
        setIsVerificationDialogOpen(false);
    };

    // ← UPDATE INI: Save ke API instead of mock
    const handleSaveSettings = async () => {
        if (!state.user?.id) return;

        setIsSaving(true);
        try {
            // Transform local state ke format API
            const apiData = {
                id: apiSettings?.id || 0, // 0 untuk create, existing ID untuk update
                userId: state.user.id,
                email: settings.email.enabled ? settings.email.address : '',
                telegramUsername: settings.telegram.enabled ? settings.telegram.username : '',
                telegramChatId: apiSettings?.telegramChatId || '', // keep existing chat_id
                phoneNumber: '', // tidak ada di current UI, keep empty
                whatsappNumber: settings.whatsapp.enabled ? settings.whatsapp.number : '',
                isNew: !apiSettings?.id || apiSettings.id === 0
            };

            await saveMutation.mutateAsync(apiData as NotificationSettingUI);

            console.log('Settings saved successfully');
            // You can add success notification here if you have notification system

        } catch (error) {
            console.error('Failed to save settings:', error);
            // You can add error notification here
        } finally {
            setIsSaving(false);
        }
    };

    // ← TAMBAH INI: Loading state
    if (isLoading) {
        return (
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 [data-theme='dark']_&:text-white">Notification Settings</h1>
                    <p className="text-gray-600 [data-theme='dark']_&:text-gray-400 mt-1">Loading your notification preferences...</p>
                </div>
                <div className="space-y-6">
                    {[1, 2, 3].map((item) => (
                        <div key={item} className="bg-white p-6 rounded-lg shadow [data-theme='dark']_&:bg-gray-800 animate-pulse">
                            <div className="h-4 bg-gray-200 rounded [data-theme='dark']_&:bg-gray-700 mb-4"></div>
                            <div className="h-8 bg-gray-200 rounded [data-theme='dark']_&:bg-gray-700"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // ← TAMBAH INI: Error state
    if (error) {
        return (
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 [data-theme='dark']_&:text-white">Notification Settings</h1>
                    <p className="text-gray-600 [data-theme='dark']_&:text-gray-400 mt-1">Manage how you receive notifications</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 [data-theme='dark']_&:bg-red-900/20 [data-theme='dark']_&:border-red-800">
                    <p className="text-sm text-red-600 [data-theme='dark']_&:text-red-300">
                        Failed to load notification settings. Please try again.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800 [data-theme='dark']_&:text-white">Notification Settings</h1>
                <p className="text-gray-600 [data-theme='dark']_&:text-gray-400 mt-1">Manage how you receive notifications</p>
            </div>

            <div className="space-y-6">
                {/* Email Notification - TETAP SAMA seperti existing */}
                <div className="bg-white p-6 rounded-lg shadow [data-theme='dark']_&:bg-gray-800">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="bg-blue-100 p-2 rounded-lg [data-theme='dark']_&:bg-blue-900">
                                <svg className="w-6 h-6 text-blue-600 [data-theme='dark']_&:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 [data-theme='dark']_&:text-white">Email Notifications</h3>
                                <p className="text-sm text-gray-600 [data-theme='dark']_&:text-gray-400">Receive alerts via email</p>
                            </div>
                        </div>
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.email.enabled}
                                onChange={() => handleToggle('email')}
                                className="sr-only"
                            />
                            <div className={`relative w-12 h-6 transition-colors duration-200 ease-in-out rounded-full ${
                                settings.email.enabled ? 'bg-blue-500' : 'bg-gray-300 [data-theme=\'dark\']_&:bg-gray-600'
                            }`}>
                                <div className={`absolute top-0.5 left-0.5 w-5 h-5 transition-transform duration-200 ease-in-out transform bg-white rounded-full ${
                                    settings.email.enabled ? 'translate-x-6' : 'translate-x-0'
                                }`}></div>
                            </div>
                        </label>
                    </div>
                    {settings.email.enabled && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 [data-theme='dark']_&:text-gray-300 mb-1">Email Address</label>
                            <input
                                type="email"
                                value={settings.email.address}
                                disabled={true}
                                onChange={(e) => handleUpdate('email', 'address', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400 [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:text-white"
                            />
                        </div>
                    )}
                </div>

                {/* Telegram Notification - TETAP SAMA seperti existing */}
                <div className="bg-white p-6 rounded-lg shadow [data-theme='dark']_&:bg-gray-800">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="bg-blue-100 p-2 rounded-lg [data-theme='dark']_&:bg-blue-900">
                                <svg className="w-6 h-6 text-blue-600 [data-theme='dark']_&:text-blue-300" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 [data-theme='dark']_&:text-white">Telegram Notifications</h3>
                                <p className="text-sm text-gray-600 [data-theme='dark']_&:text-gray-400">Receive alerts via Telegram bot</p>
                            </div>
                        </div>
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.telegram.enabled}
                                onChange={() => handleToggle('telegram')}
                                className="sr-only"
                            />
                            <div className={`relative w-12 h-6 transition-colors duration-200 ease-in-out rounded-full ${
                                settings.telegram.enabled ? 'bg-blue-500' : 'bg-gray-300 [data-theme=\'dark\']_&:bg-gray-600'
                            }`}>
                                <div className={`absolute top-0.5 left-0.5 w-5 h-5 transition-transform duration-200 ease-in-out transform bg-white rounded-full ${
                                    settings.telegram.enabled ? 'translate-x-6' : 'translate-x-0'
                                }`}></div>
                            </div>
                        </label>
                    </div>
                    {settings.telegram.enabled && (
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 [data-theme='dark']_&:text-gray-300 mb-1">
                                    Telegram Username
                                    {settings.telegram.verified && (
                                        <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 [data-theme='dark']_&:bg-green-900 [data-theme='dark']_&:text-green-200">
                                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            Verified
                                        </span>
                                    )}
                                </label>
                                <div className="flex space-x-3">
                                    <input
                                        type="text"
                                        value={settings.telegram.username}
                                        onChange={(e) => handleUpdate('telegram', 'username', e.target.value)}
                                        placeholder="@username"
                                        disabled={true}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:text-white [data-theme='dark']_&:disabled:bg-gray-600"
                                    />
                                    <button
                                        onClick={handleTelegramVerify}
                                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                                            settings.telegram.verified
                                                ? 'bg-green-100 text-green-700 hover:bg-green-200 [data-theme=\'dark\']_&:bg-green-900 [data-theme=\'dark\']_&:text-green-200 [data-theme=\'dark\']_&:hover:bg-green-800'
                                                : 'bg-blue-500 text-white hover:bg-blue-600'
                                        }`}
                                    >
                                        {settings.telegram.verified ? 'Re-verify' : 'Verification'}
                                    </button>
                                </div>
                            </div>
                            {!settings.telegram.verified && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 [data-theme='dark']_&:bg-yellow-900 [data-theme='dark']_&:border-yellow-700">
                                    <div className="flex">
                                        <svg className="flex-shrink-0 h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        <div className="ml-3">
                                            <p className="text-sm text-yellow-700 [data-theme='dark']_&:text-yellow-200">
                                                Please verify your Telegram account to receive notifications. Click the Verification button to start the process.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* WhatsApp Notification - TETAP SAMA seperti existing */}
                <div className="bg-white p-6 rounded-lg shadow [data-theme='dark']_&:bg-gray-800">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="bg-green-100 p-2 rounded-lg [data-theme='dark']_&:bg-green-900">
                                <svg className="w-6 h-6 text-green-600 [data-theme='dark']_&:text-green-300" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.520-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 [data-theme='dark']_&:text-white">WhatsApp Notifications</h3>
                                <p className="text-sm text-gray-600 [data-theme='dark']_&:text-gray-400">Receive alerts via WhatsApp</p>
                            </div>
                        </div>
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.whatsapp.enabled}
                                onChange={() => handleToggle('whatsapp')}
                                className="sr-only"
                            />
                            <div className={`relative w-12 h-6 transition-colors duration-200 ease-in-out rounded-full ${
                                settings.whatsapp.enabled ? 'bg-green-500' : 'bg-gray-300 [data-theme=\'dark\']_&:bg-gray-600'
                            }`}>
                                <div className={`absolute top-0.5 left-0.5 w-5 h-5 transition-transform duration-200 ease-in-out transform bg-white rounded-full ${
                                    settings.whatsapp.enabled ? 'translate-x-6' : 'translate-x-0'
                                }`}></div>
                            </div>
                        </label>
                    </div>
                    {settings.whatsapp.enabled && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 [data-theme='dark']_&:text-gray-300 mb-1">WhatsApp Number</label>
                            <input
                                type="tel"
                                value={settings.whatsapp.number}
                                onChange={(e) => handleUpdate('whatsapp', 'number', e.target.value)}
                                placeholder="+628123456789"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-400 [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:text-white"
                            />
                        </div>
                    )}
                </div>

                {/* Save Button - UPDATE INI dengan loading state dari API */}
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={handleSaveSettings}
                        disabled={isSaving || saveMutation.isPending}
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                        {(isSaving || saveMutation.isPending) && (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        )}
                        <span>{(isSaving || saveMutation.isPending) ? 'Saving...' : 'Save Settings'}</span>
                    </button>
                </div>

                {/* Success/Error Messages - TAMBAH INI */}
                {saveMutation.isSuccess && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 [data-theme='dark']_&:bg-green-900/20 [data-theme='dark']_&:border-green-800">
                        <p className="text-sm text-green-600 [data-theme='dark']_&:text-green-300">
                            ✅ Settings saved successfully!
                        </p>
                    </div>
                )}

                {saveMutation.isError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 [data-theme='dark']_&:bg-red-900/20 [data-theme='dark']_&:border-red-800">
                        <p className="text-sm text-red-600 [data-theme='dark']_&:text-red-300">
                            ❌ Failed to save settings. Please try again.
                        </p>
                    </div>
                )}
            </div>

            {/* Telegram Verification Dialog - TETAP SAMA seperti existing */}
            <TelegramVerificationDialog
                isOpen={isVerificationDialogOpen}
                onClose={() => setIsVerificationDialogOpen(false)}
                onSuccess={handleVerificationSuccess}
            />
        </div>
    );
}