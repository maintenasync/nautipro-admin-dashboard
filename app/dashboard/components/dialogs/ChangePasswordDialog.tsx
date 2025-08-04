import React, { useState } from 'react';
import { X, Eye, EyeOff, Shield, RefreshCw, AlertCircle } from 'lucide-react';
import { userService } from '@/app/services/userService';

interface ChangePasswordDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const ChangePasswordDialog: React.FC<ChangePasswordDialogProps> = ({
                                                                       isOpen,
                                                                       onClose,
                                                                       onSuccess
                                                                   }) => {
    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        old: false,
        new: false,
        confirm: false
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
        setError('');
    };

    const togglePasswordVisibility = (field: 'old' | 'new' | 'confirm') => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const validatePasswords = (): boolean => {
        if (!formData.oldPassword) {
            setError('Current password is required');
            return false;
        }

        if (!formData.newPassword) {
            setError('New password is required');
            return false;
        }

        if (formData.newPassword.length < 6) {
            setError('New password must be at least 6 characters');
            return false;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setError('New passwords do not match');
            return false;
        }

        if (formData.oldPassword === formData.newPassword) {
            setError('New password must be different from current password');
            return false;
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!validatePasswords()) return;

        setIsLoading(true);
        setError('');

        try {
            const success = await userService.changePassword(formData.oldPassword, formData.newPassword);
            if (success) {
                onSuccess();
                handleClose();
            }
        } catch (error: any) {
            if (error.message.includes('401') || error.message.includes('unauthorized')) {
                setError('Current password is incorrect');
            } else {
                setError('Failed to change password. Please try again.');
            }
            console.error('Failed to change password:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        onClose();
        setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setShowPasswords({ old: false, new: false, confirm: false });
        setError('');
    };

    const getPasswordStrength = (password: string): { strength: number; text: string; color: string } => {
        let strength = 0;
        if (password.length >= 6) strength++;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        const levels = [
            { strength: 0, text: 'Very Weak', color: 'text-red-500' },
            { strength: 1, text: 'Weak', color: 'text-red-400' },
            { strength: 2, text: 'Fair', color: 'text-yellow-500' },
            { strength: 3, text: 'Good', color: 'text-yellow-400' },
            { strength: 4, text: 'Strong', color: 'text-green-500' },
            { strength: 5, text: 'Very Strong', color: 'text-green-600' },
        ];

        return levels[Math.min(strength, 5)];
    };

    if (!isOpen) return null;

    const passwordStrength = getPasswordStrength(formData.newPassword);

    return (
        <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-md mx-auto [data-theme='dark']_&:bg-gray-800 shadow-2xl">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg [data-theme='dark']_&:bg-blue-900/30">
                                <Shield className="w-5 h-5 text-blue-600 [data-theme='dark']_&:text-blue-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 [data-theme='dark']_&:text-white">
                                Change Password
                            </h3>
                        </div>
                        <button
                            onClick={handleClose}
                            disabled={isLoading}
                            className="p-2 hover:bg-gray-100 rounded-lg [data-theme='dark']_&:hover:bg-gray-700 transition-colors disabled:opacity-50"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {/* Current Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 [data-theme='dark']_&:text-gray-300 mb-1">
                                Current Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPasswords.old ? 'text' : 'password'}
                                    name="oldPassword"
                                    value={formData.oldPassword}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:text-white transition-colors"
                                    placeholder="Enter your current password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility('old')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPasswords.old ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* New Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 [data-theme='dark']_&:text-gray-300 mb-1">
                                New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPasswords.new ? 'text' : 'password'}
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:text-white transition-colors"
                                    placeholder="Enter your new password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility('new')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {formData.newPassword && (
                                <div className="mt-1 flex items-center space-x-2">
                                    <div className="flex-1 bg-gray-200 rounded-full h-1.5 [data-theme='dark']_&:bg-gray-600">
                                        <div
                                            className={`h-1.5 rounded-full transition-all duration-300 ${
                                                passwordStrength.strength <= 1 ? 'bg-red-500' :
                                                    passwordStrength.strength <= 3 ? 'bg-yellow-500' : 'bg-green-500'
                                            }`}
                                            style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                                        />
                                    </div>
                                    <span className={`text-xs font-medium ${passwordStrength.color}`}>
                    {passwordStrength.text}
                  </span>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 [data-theme='dark']_&:text-gray-300 mb-1">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPasswords.confirm ? 'text' : 'password'}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:text-white transition-colors"
                                    placeholder="Confirm your new password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility('confirm')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg [data-theme='dark']_&:bg-red-900/20 [data-theme='dark']_&:border-red-800">
                                <AlertCircle className="w-4 h-4 text-red-600 [data-theme='dark']_&:text-red-400 flex-shrink-0" />
                                <span className="text-sm text-red-600 [data-theme='dark']_&:text-red-400">{error}</span>
                            </div>
                        )}

                        {/* Password Requirements */}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 [data-theme='dark']_&:bg-gray-700 [data-theme='dark']_&:border-gray-600">
                            <h5 className="text-sm font-medium text-gray-800 [data-theme='dark']_&:text-gray-200 mb-2">
                                Password Requirements:
                            </h5>
                            <ul className="text-xs text-gray-600 [data-theme='dark']_&:text-gray-400 space-y-1">
                                <li>• At least 6 characters long</li>
                                <li>• Must be different from current password</li>
                                <li>• Recommended: Include uppercase, lowercase, numbers, and symbols</li>
                            </ul>
                        </div>

                        {/* Actions */}
                        <div className="flex space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={isLoading}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:text-gray-300 [data-theme='dark']_&:hover:bg-gray-700 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isLoading || !formData.oldPassword || !formData.newPassword || !formData.confirmPassword}
                                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-colors"
                            >
                                {isLoading ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        <span>Updating...</span>
                                    </>
                                ) : (
                                    <>
                                        <Shield className="w-4 h-4" />
                                        <span>Update Password</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChangePasswordDialog;