// app/utils/validationUtils.ts

import { PASSWORD_CONFIG, OTP_CONFIG, ERROR_MESSAGES } from '../config/constants';

export interface ValidationResult {
    isValid: boolean;
    error?: string;
}

export interface PasswordStrength {
    score: number;
    level: 'very-weak' | 'weak' | 'fair' | 'good' | 'strong' | 'very-strong';
    text: string;
    color: string;
    feedback: string[];
}

// Email validation
export const validateEmail = (email: string): ValidationResult => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
        return { isValid: false, error: 'Email is required' };
    }

    if (!emailRegex.test(email)) {
        return { isValid: false, error: 'Please enter a valid email address' };
    }

    return { isValid: true };
};

// Password validation
export const validatePassword = (password: string): ValidationResult => {
    if (!password) {
        return { isValid: false, error: 'Password is required' };
    }

    if (password.length < PASSWORD_CONFIG.MIN_LENGTH) {
        return { isValid: false, error: ERROR_MESSAGES.PASSWORD_TOO_SHORT };
    }

    if (password.length > PASSWORD_CONFIG.MAX_LENGTH) {
        return { isValid: false, error: `Password must be less than ${PASSWORD_CONFIG.MAX_LENGTH} characters` };
    }

    return { isValid: true };
};

// Password confirmation validation
export const validatePasswordConfirmation = (password: string, confirmPassword: string): ValidationResult => {
    if (!confirmPassword) {
        return { isValid: false, error: 'Password confirmation is required' };
    }

    if (password !== confirmPassword) {
        return { isValid: false, error: ERROR_MESSAGES.PASSWORDS_DO_NOT_MATCH };
    }

    return { isValid: true };
};

// Password strength checker
export const getPasswordStrength = (password: string): PasswordStrength => {
    let score = 0;
    const feedback: string[] = [];

    // Length check
    if (password.length >= 8) {
        score += 1;
    } else if (password.length >= 6) {
        score += 0.5;
        feedback.push('Use at least 8 characters for better security');
    } else {
        feedback.push('Password is too short');
    }

    // Uppercase letters
    if (/[A-Z]/.test(password)) {
        score += 1;
    } else {
        feedback.push('Add uppercase letters');
    }

    // Lowercase letters
    if (/[a-z]/.test(password)) {
        score += 1;
    } else {
        feedback.push('Add lowercase letters');
    }

    // Numbers
    if (/\d/.test(password)) {
        score += 1;
    } else {
        feedback.push('Add numbers');
    }

    // Special characters
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        score += 1;
    } else {
        feedback.push('Add special characters');
    }

    // Repeated characters
    if (!/(.)\1{2,}/.test(password)) {
        score += 0.5;
    } else {
        feedback.push('Avoid repeated characters');
    }

    // Common patterns
    if (!/123|abc|qwe|password|admin/i.test(password)) {
        score += 0.5;
    } else {
        feedback.push('Avoid common patterns');
    }

    // Determine level and color
    let level: PasswordStrength['level'];
    let text: string;
    let color: string;

    if (score < 2) {
        level = 'very-weak';
        text = 'Very Weak';
        color = 'text-red-600';
    } else if (score < 3) {
        level = 'weak';
        text = 'Weak';
        color = 'text-red-500';
    } else if (score < 4) {
        level = 'fair';
        text = 'Fair';
        color = 'text-yellow-500';
    } else if (score < 5) {
        level = 'good';
        text = 'Good';
        color = 'text-yellow-400';
    } else if (score < 6) {
        level = 'strong';
        text = 'Strong';
        color = 'text-green-500';
    } else {
        level = 'very-strong';
        text = 'Very Strong';
        color = 'text-green-600';
    }

    return {
        score: Math.min(score, 6),
        level,
        text,
        color,
        feedback: feedback.slice(0, 3) // Limit to 3 suggestions
    };
};

// OTP validation
export const validateOTP = (otp: string): ValidationResult => {
    if (!otp) {
        return { isValid: false, error: 'Verification code is required' };
    }

    if (otp.length !== OTP_CONFIG.LENGTH) {
        return { isValid: false, error: `Verification code must be ${OTP_CONFIG.LENGTH} digits` };
    }

    if (!/^\d+$/.test(otp)) {
        return { isValid: false, error: 'Verification code must contain only numbers' };
    }

    return { isValid: true };
};

// Username validation
export const validateUsername = (username: string): ValidationResult => {
    if (!username) {
        return { isValid: false, error: 'Username is required' };
    }

    if (username.length < 3) {
        return { isValid: false, error: 'Username must be at least 3 characters' };
    }

    if (username.length > 30) {
        return { isValid: false, error: 'Username must be less than 30 characters' };
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        return { isValid: false, error: 'Username can only contain letters, numbers, underscore, and dash' };
    }

    return { isValid: true };
};

// Name validation
export const validateName = (name: string): ValidationResult => {
    if (!name) {
        return { isValid: false, error: 'Name is required' };
    }

    if (name.trim().length < 2) {
        return { isValid: false, error: 'Name must be at least 2 characters' };
    }

    if (name.length > 100) {
        return { isValid: false, error: 'Name must be less than 100 characters' };
    }

    return { isValid: true };
};

// Form validation helper
export const validateForm = (fields: Record<string, any>, rules: Record<string, (value: any) => ValidationResult>): { isValid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};
    let isValid = true;

    for (const [fieldName, value] of Object.entries(fields)) {
        if (rules[fieldName]) {
            const result = rules[fieldName](value);
            if (!result.isValid) {
                errors[fieldName] = result.error || 'Invalid value';
                isValid = false;
            }
        }
    }

    return { isValid, errors };
};

// Debounced validation
export const createDebouncedValidator = (
    validator: (value: any) => ValidationResult,
    delay: number = 500
) => {
    let timeoutId: NodeJS.Timeout;

    return (value: any, callback: (result: ValidationResult) => void) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            const result = validator(value);
            callback(result);
        }, delay);
    };
};