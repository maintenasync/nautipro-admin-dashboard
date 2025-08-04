// app/contexts/ThemeContext.tsx

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'auto';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    resolvedTheme: 'light' | 'dark'; // Actual theme being used
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>('light');
    const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

    // Check system preference
    const getSystemTheme = (): 'light' | 'dark' => {
        if (typeof window !== 'undefined') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return 'light';
    };

    // Load saved theme from localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('theme') as Theme;
            if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
                setTheme(savedTheme);
            }
        }
    }, []);

    // Update resolved theme and apply to document
    useEffect(() => {
        let newResolvedTheme: 'light' | 'dark';

        if (theme === 'auto') {
            newResolvedTheme = getSystemTheme();
        } else {
            newResolvedTheme = theme;
        }

        setResolvedTheme(newResolvedTheme);

        // Apply theme to document and save preference
        if (typeof window !== 'undefined') {
            try {
                // Use resolved theme for document attribute instead of raw theme
                document.documentElement.setAttribute('data-theme', newResolvedTheme);
                localStorage.setItem('theme', theme);
            } catch (error) {
                console.error('Error accessing localStorage or setting document attribute:', error);
            }
        }
    }, [theme]);

    // Listen for system theme changes when in auto mode
    useEffect(() => {
        if (theme === 'auto' && typeof window !== 'undefined') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = () => {
                setResolvedTheme(getSystemTheme());
            };

            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}