// app/hooks/useUserData.ts

import { useState, useEffect, useCallback } from 'react';
import { UserData } from '../types/user';
import { userService } from '../services/userService';
import { useNotification } from './useNotification';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../config/constants';

interface UseUserDataReturn {
    userData: UserData | null;
    isLoading: boolean;
    error: string | null;
    refreshUserData: () => Promise<void>;
    updateUserData: (updates: Partial<UserData>) => void;
    updateAvatar: (file: File) => Promise<boolean>;
    changePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
    verifyEmail: (email: string, otp: string) => Promise<boolean>;
    createEmailVerification: (email: string) => Promise<boolean>;
}

export const useUserData = (): UseUserDataReturn => {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { showSuccess, showError } = useNotification();

    const refreshUserData = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await userService.getUser();
            setUserData(data);
        } catch (err: any) {
            const errorMessage = err.message || ERROR_MESSAGES.NETWORK_ERROR;
            setError(errorMessage);
            showError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [showError]);

    const updateUserData = useCallback((updates: Partial<UserData>) => {
        setUserData(prev => prev ? { ...prev, ...updates } : null);
    }, []);

    const updateAvatar = useCallback(async (file: File): Promise<boolean> => {
        try {
            const success = await userService.updateAvatar(file);
            if (success) {
                showSuccess(SUCCESS_MESSAGES.AVATAR_UPDATED);
                // Refresh user data to get new avatar URL
                await refreshUserData();
                return true;
            }
            return false;
        } catch (err: any) {
            showError(err.message || 'Failed to update avatar');
            return false;
        }
    }, [showSuccess, showError, refreshUserData]);

    const changePassword = useCallback(async (oldPassword: string, newPassword: string): Promise<boolean> => {
        try {
            const success = await userService.changePassword(oldPassword, newPassword);
            if (success) {
                showSuccess(SUCCESS_MESSAGES.PASSWORD_CHANGED);
                return true;
            }
            return false;
        } catch (err: any) {
            showError(err.message || 'Failed to change password');
            return false;
        }
    }, [showSuccess, showError]);

    const verifyEmail = useCallback(async (email: string, otp: string): Promise<boolean> => {
        try {
            const success = await userService.verifyEmail(email, otp);
            if (success) {
                showSuccess(SUCCESS_MESSAGES.EMAIL_VERIFIED);
                // Update local state
                updateUserData({ email_verification: true });
                return true;
            }
            return false;
        } catch (err: any) {
            showError(err.message || 'Failed to verify email');
            return false;
        }
    }, [showSuccess, showError, updateUserData]);

    const createEmailVerification = useCallback(async (email: string): Promise<boolean> => {
        try {
            const success = await userService.createEmailVerification(email);
            if (success) {
                showSuccess(SUCCESS_MESSAGES.OTP_SENT);
                return true;
            }
            return false;
        } catch (err: any) {
            showError(err.message || 'Failed to send verification code');
            return false;
        }
    }, [showSuccess, showError]);

    // Load user data on mount
    useEffect(() => {
        refreshUserData();
    }, [refreshUserData]);

    return {
        userData,
        isLoading,
        error,
        refreshUserData,
        updateUserData,
        updateAvatar,
        changePassword,
        verifyEmail,
        createEmailVerification,
    };
};