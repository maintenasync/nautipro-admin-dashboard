// app/utils/index.ts

// File utilities
export {
    validateFile,
    formatFileSize,
    getFileExtension,
    isImageFile,
    createImagePreview,
    compressImage,
    cropImageToSquare,
    generateFileName
} from './fileUtils';

// Validation utilities
export {
    validateEmail,
    validatePassword,
    validatePasswordConfirmation,
    getPasswordStrength,
    validateOTP,
    validateUsername,
    validateName,
    validateForm,
    createDebouncedValidator
} from './validationUtils';

// Helper utilities
export {
    formatDate,
    formatDateTime,
    getTimeAgo,
    formatTimer,
    truncateText,
    capitalizeFirst,
    camelToKebab,
    kebabToCamel,
    slugify,
    groupBy,
    sortBy,
    uniqueBy,
    omit,
    pick,
    deepMerge,
    buildUrl,
    getQueryParams,
    safeLocalStorage,
    debounce,
    throttle,
    generateId,
    generateUUID,
    logger,
    isFeatureEnabled,
    handleApiError,
    retry
} from './helpers';

// Type exports
export type {
    FileValidationResult
} from './fileUtils';

export type {
    ValidationResult,
    PasswordStrength
} from './validationUtils';