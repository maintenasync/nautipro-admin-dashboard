// app/utils/helpers.ts

import { FEATURE_FLAGS } from '../config/constants';

// Date formatting utilities
export const formatDate = (timestamp: string | number, locale: string = 'en-US'): string => {
    const date = new Date(typeof timestamp === 'string' ? parseInt(timestamp) : timestamp);
    return date.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

export const formatDateTime = (timestamp: string | number, locale: string = 'en-US'): string => {
    const date = new Date(typeof timestamp === 'string' ? parseInt(timestamp) : timestamp);
    return date.toLocaleString(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export const getTimeAgo = (timestamp: string | number): string => {
    const now = new Date();
    const date = new Date(typeof timestamp === 'string' ? parseInt(timestamp) : timestamp);
    const diffInMs = now.getTime() - date.getTime();
    const diffInSeconds = Math.floor(diffInMs / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    const diffInWeeks = Math.floor(diffInDays / 7);
    const diffInMonths = Math.floor(diffInDays / 30);
    const diffInYears = Math.floor(diffInDays / 365);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInMinutes === 1) return '1 minute ago';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInHours === 1) return '1 hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInWeeks === 1) return '1 week ago';
    if (diffInWeeks < 4) return `${diffInWeeks} weeks ago`;
    if (diffInMonths === 1) return '1 month ago';
    if (diffInMonths < 12) return `${diffInMonths} months ago`;
    if (diffInYears === 1) return '1 year ago';
    return `${diffInYears} years ago`;
};

export const formatTimer = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// String utilities
export const truncateText = (text: string, maxLength: number, suffix: string = '...'): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - suffix.length) + suffix;
};

export const capitalizeFirst = (text: string): string => {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const camelToKebab = (text: string): string => {
    return text.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
};

export const kebabToCamel = (text: string): string => {
    return text.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
};

export const slugify = (text: string): string => {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

// Array utilities
export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
    return array.reduce((groups, item) => {
        const group = String(item[key]);
        if (!groups[group]) {
            groups[group] = [];
        }
        groups[group].push(item);
        return groups;
    }, {} as Record<string, T[]>);
};

export const sortBy = <T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] => {
    return [...array].sort((a, b) => {
        const aVal = a[key];
        const bVal = b[key];

        if (aVal < bVal) return direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return direction === 'asc' ? 1 : -1;
        return 0;
    });
};

export const uniqueBy = <T>(array: T[], key: keyof T): T[] => {
    const seen = new Set();
    return array.filter(item => {
        const value = item[key];
        if (seen.has(value)) {
            return false;
        }
        seen.add(value);
        return true;
    });
};

// Object utilities
export const omit = <T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
    const result = { ...obj };
    keys.forEach(key => delete result[key]);
    return result;
};

export const pick = <T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
    const result = {} as Pick<T, K>;
    keys.forEach(key => {
        if (key in obj) {
            result[key] = obj[key];
        }
    });
    return result;
};

export const deepMerge = <T extends object>(target: T, source: Partial<T>): T => {
    const result = { ...target };

    for (const key in source) {
        if (source[key] !== undefined) {
            if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
                result[key] = deepMerge(result[key] as any, source[key] as any);
            } else {
                result[key] = source[key] as T[Extract<keyof T, string>];
            }
        }
    }

    return result;
};

// URL utilities
export const buildUrl = (base: string, params: Record<string, any>): string => {
    const url = new URL(base);
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            url.searchParams.append(key, String(value));
        }
    });
    return url.toString();
};

export const getQueryParams = (search: string): Record<string, string> => {
    const params = new URLSearchParams(search);
    const result: Record<string, string> = {};

    for (const [key, value] of params.entries()) {
        result[key] = value;
    }

    return result;
};

// Storage utilities
export const safeLocalStorage = {
    getItem: (key: string): string | null => {
        try {
            return localStorage.getItem(key);
        } catch {
            return null;
        }
    },

    setItem: (key: string, value: string): boolean => {
        try {
            localStorage.setItem(key, value);
            return true;
        } catch {
            return false;
        }
    },

    removeItem: (key: string): boolean => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch {
            return false;
        }
    },

    clear: (): boolean => {
        try {
            localStorage.clear();
            return true;
        } catch {
            return false;
        }
    }
};

// Performance utilities
export const debounce = <T extends (...args: any[]) => any>(
    func: T,
    delay: number
): ((...args: Parameters<T>) => void) => {
    let timeoutId: NodeJS.Timeout;

    return (...args: Parameters<T>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
};

export const throttle = <T extends (...args: any[]) => any>(
    func: T,
    delay: number
): ((...args: Parameters<T>) => void) => {
    let lastCall = 0;

    return (...args: Parameters<T>) => {
        const now = Date.now();
        if (now - lastCall >= delay) {
            lastCall = now;
            func.apply(null, args);
        }
    };
};

// Random utilities
export const generateId = (length: number = 8): string => {
    return Math.random().toString(36).substring(2, 2 + length);
};

export const generateUUID = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

// Development utilities
export const logger = {
    log: (...args: any[]) => {
        if (FEATURE_FLAGS.DEBUG_MODE) {
            console.log('[LOG]', ...args);
        }
    },

    warn: (...args: any[]) => {
        if (FEATURE_FLAGS.DEBUG_MODE) {
            console.warn('[WARN]', ...args);
        }
    },

    error: (...args: any[]) => {
        if (FEATURE_FLAGS.DEBUG_MODE) {
            console.error('[ERROR]', ...args);
        }
    },

    info: (...args: any[]) => {
        if (FEATURE_FLAGS.DEBUG_MODE) {
            console.info('[INFO]', ...args);
        }
    }
};

// Feature flag utilities
export const isFeatureEnabled = (feature: keyof typeof FEATURE_FLAGS): boolean => {
    return FEATURE_FLAGS[feature];
};

// Error handling utilities
export const handleApiError = (error: any): string => {
    if (error.response?.data?.message) {
        return error.response.data.message;
    }

    if (error.message) {
        return error.message;
    }

    return 'An unexpected error occurred';
};

export const retry = async <T>(
    fn: () => Promise<T>,
    maxAttempts: number = 3,
    delay: number = 1000
): Promise<T> => {
    let attempt = 1;

    while (attempt <= maxAttempts) {
        try {
            return await fn();
        } catch (error) {
            if (attempt === maxAttempts) {
                throw error;
            }

            await new Promise(resolve => setTimeout(resolve, delay * attempt));
            attempt++;
        }
    }

    throw new Error('Max attempts reached');
};