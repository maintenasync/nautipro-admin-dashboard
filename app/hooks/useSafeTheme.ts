// app/hooks/useSafeTheme.ts

'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export function useSafeTheme() {
    const [mounted, setMounted] = useState(false);
    const themeContext = useTheme();

    useEffect(() => {
        setMounted(true);
    }, []);

    // Return default values until mounted to prevent hydration mismatch
    if (!mounted) {
        return {
            theme: 'auto' as const,
            setTheme: () => {},
            resolvedTheme: 'light' as const,
            mounted: false,
        };
    }

    return {
        ...themeContext,
        mounted: true,
    };
}