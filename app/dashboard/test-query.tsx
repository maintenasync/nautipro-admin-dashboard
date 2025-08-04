// app/dashboard/test-query.tsx - BUAT FILE INI UNTUK TEST
// (Bisa dihapus setelah test berhasil)

'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/app/contexts/AuthContext';

export default function TestQuery() {
    const queryClient = useQueryClient();
    const { state } = useAuth();

    const testClearCache = () => {
        queryClient.clear();
        console.log('Cache cleared successfully!');
        alert('Cache cleared! Check console for confirmation.');
    };

    return (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold text-yellow-800">QueryClient Test</h3>
            <div className="mt-2 space-y-2">
                <p className="text-sm text-yellow-700">
                    User: {state.user?.name || 'Not logged in'}
                </p>
                <p className="text-sm text-yellow-700">
                    QueryClient Status: {queryClient ? '✅ Available' : '❌ Not Available'}
                </p>
                <button
                    onClick={testClearCache}
                    className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
                >
                    Test Clear Cache
                </button>
            </div>
        </div>
    );
}