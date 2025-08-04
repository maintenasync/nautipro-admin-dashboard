// app/utils/fileUtils.ts

import { UPLOAD_CONFIG, ERROR_MESSAGES } from '../config/constants';

export interface FileValidationResult {
    isValid: boolean;
    error?: string;
}

export const validateFile = (file: File): FileValidationResult => {
    // Check file type
    if (!UPLOAD_CONFIG.ALLOWED_TYPES.includes(file.type)) {
        return {
            isValid: false,
            error: ERROR_MESSAGES.INVALID_FILE_TYPE
        };
    }

    // Check file size
    if (file.size > UPLOAD_CONFIG.MAX_FILE_SIZE) {
        return {
            isValid: false,
            error: ERROR_MESSAGES.FILE_TOO_LARGE
        };
    }

    return { isValid: true };
};

export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileExtension = (filename: string): string => {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

export const isImageFile = (file: File): boolean => {
    return file.type.startsWith('image/');
};

export const createImagePreview = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        if (!isImageFile(file)) {
            reject(new Error('File is not an image'));
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            resolve(e.target?.result as string);
        };
        reader.onerror = () => {
            reject(new Error('Failed to read file'));
        };
        reader.readAsDataURL(file);
    });
};

export const compressImage = (
    file: File,
    maxWidth: number = 800,
    quality: number = 0.8
): Promise<File> => {
    return new Promise((resolve, reject) => {
        if (!isImageFile(file)) {
            reject(new Error('File is not an image'));
            return;
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            // Calculate new dimensions
            let { width, height } = img;

            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;

            // Draw and compress
            ctx?.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        const compressedFile = new File([blob], file.name, {
                            type: file.type,
                            lastModified: Date.now(),
                        });
                        resolve(compressedFile);
                    } else {
                        reject(new Error('Failed to compress image'));
                    }
                },
                file.type,
                quality
            );
        };

        img.onerror = () => {
            reject(new Error('Failed to load image'));
        };

        img.src = URL.createObjectURL(file);
    });
};

export const cropImageToSquare = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
        if (!isImageFile(file)) {
            reject(new Error('File is not an image'));
            return;
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            const size = Math.min(img.width, img.height);
            const offsetX = (img.width - size) / 2;
            const offsetY = (img.height - size) / 2;

            canvas.width = size;
            canvas.height = size;

            ctx?.drawImage(img, offsetX, offsetY, size, size, 0, 0, size, size);

            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        const croppedFile = new File([blob], file.name, {
                            type: file.type,
                            lastModified: Date.now(),
                        });
                        resolve(croppedFile);
                    } else {
                        reject(new Error('Failed to crop image'));
                    }
                },
                file.type,
                0.9
            );
        };

        img.onerror = () => {
            reject(new Error('Failed to load image'));
        };

        img.src = URL.createObjectURL(file);
    });
};

export const generateFileName = (originalName: string): string => {
    const extension = getFileExtension(originalName);
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `avatar_${timestamp}_${random}.${extension}`;
};