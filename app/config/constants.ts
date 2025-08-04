// app/config/constants.ts

export const API_CONFIG = {
    BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || '',
    API_KEY: process.env.NEXT_PUBLIC_API_KEY || '',
    TIMEOUT: 30000, // 30 seconds
} as const;

export const UPLOAD_CONFIG = {
    MAX_FILE_SIZE: parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '10485760'), // 10MB default
    ALLOWED_TYPES: (process.env.NEXT_PUBLIC_ALLOWED_FILE_TYPES || 'image/jpeg,image/jpg,image/png').split(','),
    ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png'],
} as const;

export const OTP_CONFIG = {
    LENGTH: parseInt(process.env.NEXT_PUBLIC_OTP_LENGTH || '5'),
    EXPIRY_MINUTES: parseInt(process.env.NEXT_PUBLIC_OTP_EXPIRY_MINUTES || '15'),
    EXPIRY_SECONDS: parseInt(process.env.NEXT_PUBLIC_OTP_EXPIRY_MINUTES || '15') * 60,
} as const;

export const PASSWORD_CONFIG = {
    MIN_LENGTH: 6,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: false,
    REQUIRE_LOWERCASE: false,
    REQUIRE_NUMBERS: false,
    REQUIRE_SPECIAL_CHARS: false,
} as const;

export const FEATURE_FLAGS = {
    ENABLE_AVATAR_UPLOAD: process.env.NEXT_PUBLIC_ENABLE_AVATAR_UPLOAD !== 'false',
    ENABLE_EMAIL_VERIFICATION: process.env.NEXT_PUBLIC_ENABLE_EMAIL_VERIFICATION !== 'false',
    ENABLE_PASSWORD_CHANGE: process.env.NEXT_PUBLIC_ENABLE_PASSWORD_CHANGE !== 'false',
    DEBUG_MODE: process.env.NEXT_PUBLIC_DEBUG_MODE === 'true',
} as const;

export const UI_CONFIG = {
    NOTIFICATION_DURATION: 5000, // 5 seconds
    LOADING_DELAY: 300, // Show loading after 300ms
    DEBOUNCE_DELAY: 500, // Input debounce delay
    ANIMATION_DURATION: 200, // Default animation duration
} as const;

export const STORAGE_KEYS = {
    TOKEN: 'token',
    REFRESH_TOKEN: 'refresh_token',
    USER_DATA: 'user_data',
    THEME: 'theme',
    LANGUAGE: 'language',
} as const;

export const API_ENDPOINTS = {
    // User endpoints
    GET_USER: '/user',
    UPDATE_AVATAR: '/update-avatar',
    CHANGE_PASSWORD: '/change-password',
    CREATE_EMAIL_VERIFICATION: (email: string) => `/create-email-verification/${email}`,
    VERIFY_EMAIL: (email: string, otp: string) => `/verify-email-verification/${email}/${otp}`,

    // Auth endpoints (if needed)
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
} as const;

export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
} as const;

export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Network error. Please check your connection.',
    UNAUTHORIZED: 'Please log in to continue.',
    FORBIDDEN: 'You do not have permission to perform this action.',
    NOT_FOUND: 'The requested resource was not found.',
    TOO_MANY_REQUESTS: 'Too many requests. Please try again later.',
    INTERNAL_SERVER_ERROR: 'An unexpected error occurred. Please try again.',
    INVALID_FILE_TYPE: 'Please select a valid image file (JPG, JPEG, PNG).',
    FILE_TOO_LARGE: `File size must be less than ${UPLOAD_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB.`,
    PASSWORD_TOO_SHORT: `Password must be at least ${PASSWORD_CONFIG.MIN_LENGTH} characters long.`,
    PASSWORDS_DO_NOT_MATCH: 'Passwords do not match.',
    INVALID_OTP: 'Invalid verification code.',
    OTP_EXPIRED: 'Verification code has expired.',
    EMAIL_ALREADY_VERIFIED: 'Email is already verified.',
} as const;

export const SUCCESS_MESSAGES = {
    AVATAR_UPDATED: 'Profile picture updated successfully!',
    PASSWORD_CHANGED: 'Password changed successfully!',
    EMAIL_VERIFIED: 'Email verified successfully!',
    OTP_SENT: 'Verification code sent to your email.',
    SETTINGS_SAVED: 'Settings saved successfully!',
} as const;