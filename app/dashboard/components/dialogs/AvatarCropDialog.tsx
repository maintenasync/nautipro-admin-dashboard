import React, { useState, useRef } from 'react';
import { X, Upload, Crop, Save, RefreshCw } from 'lucide-react';
import { userService } from '@/app/services/userService';

interface AvatarCropDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (newAvatarUrl: string) => void;
    currentAvatar?: string;
}

const AvatarCropDialog: React.FC<AvatarCropDialogProps> = ({
                                                               isOpen,
                                                               onClose,
                                                               onSave,
                                                               currentAvatar
                                                           }) => {
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>(currentAvatar || '');
    const [isLoading, setIsLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const validateFile = (file: File): boolean => {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        const maxSize = 10 * 1024 * 1024; // 10MB

        if (!validTypes.includes(file.type)) {
            setError('Please select a valid image file (JPG, JPEG, PNG)');
            return false;
        }

        if (file.size > maxSize) {
            setError('File size must be less than 10MB');
            return false;
        }

        return true;
    };

    const handleFileSelect = (file: File) => {
        if (file && validateFile(file)) {
            setError('');
            const reader = new FileReader();
            reader.onload = (e) => {
                setSelectedImage(file);
                setPreviewUrl(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) handleFileSelect(file);
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const file = e.dataTransfer.files[0];
        if (file) handleFileSelect(file);
    };

    const handleSave = async () => {
        if (!selectedImage) return;

        setIsLoading(true);
        setError('');
        try {
            const success = await userService.updateAvatar(selectedImage);
            if (success) {
                onSave(previewUrl);
                onClose();
                setSelectedImage(null);
                setPreviewUrl(currentAvatar || '');
            }
        } catch (error) {
            setError('Failed to update avatar. Please try again.');
            console.error('Failed to update avatar:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        onClose();
        setSelectedImage(null);
        setPreviewUrl(currentAvatar || '');
        setError('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-md mx-auto [data-theme='dark']_&:bg-gray-800 shadow-2xl">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 [data-theme='dark']_&:text-white">
                            Update Profile Picture
                        </h3>
                        <button
                            onClick={handleClose}
                            className="p-2 hover:bg-gray-100 rounded-lg [data-theme='dark']_&:hover:bg-gray-700 transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Upload Area */}
                    <div
                        className={`relative border-2 border-dashed rounded-xl p-6 mb-4 transition-colors ${
                            dragActive
                                ? 'border-blue-400 bg-blue-50 [data-theme="dark"]_&:bg-blue-900/20'
                                : 'border-gray-300 [data-theme="dark"]_&:border-gray-600'
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleInputChange}
                            className="hidden"
                        />

                        {previewUrl ? (
                            <div className="text-center">
                                <div className="w-32 h-32 mx-auto mb-4 relative">
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        className="w-full h-full object-cover rounded-full border-4 border-white shadow-lg"
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                                        <Crop className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="text-blue-500 hover:text-blue-600 text-sm font-medium transition-colors"
                                >
                                    Choose different image
                                </button>
                            </div>
                        ) : (
                            <div className="text-center">
                                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-sm text-gray-600 [data-theme='dark']_&:text-gray-400 mb-2">
                                    Drop an image here, or{' '}
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="text-blue-500 hover:text-blue-600 font-medium"
                                    >
                                        browse
                                    </button>
                                </p>
                                <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                            </div>
                        )}
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg [data-theme='dark']_&:bg-red-900/20 [data-theme='dark']_&:border-red-800">
                            <p className="text-sm text-red-600 [data-theme='dark']_&:text-red-400">{error}</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex space-x-3">
                        <button
                            onClick={handleClose}
                            disabled={isLoading}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 [data-theme='dark']_&:border-gray-600 [data-theme='dark']_&:text-gray-300 [data-theme='dark']_&:hover:bg-gray-700 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!selectedImage || isLoading}
                            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-colors"
                        >
                            {isLoading ? (
                                <>
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    <span>Uploading...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    <span>Save</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AvatarCropDialog;