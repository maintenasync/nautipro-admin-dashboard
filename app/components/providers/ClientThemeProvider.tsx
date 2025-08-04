// app/components/providers/ClientThemeProvider.tsx

'use client';

import dynamic from 'next/dynamic';
import { ReactNode } from 'react';

// Dynamic import ThemeProvider dengan ssr: false untuk menghindari hydration mismatch
const ThemeProvider = dynamic(
    () => import('../../contexts/ThemeContext').then((mod) => ({ default: mod.ThemeProvider })),
    {
        ssr: false,
        loading: () => (
            <div style={{ visibility: 'hidden' }}>
                {/* Placeholder untuk mencegah layout shift */}
            </div>
        ),
    }
);

interface DynamicThemeProviderProps {
    children: ReactNode;
}

export default function ClientThemeProvider({ children }: DynamicThemeProviderProps) {
    return <ThemeProvider>{children}</ThemeProvider>;
}