// app/hooks/useUserDataManager.ts - Create this new file

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/app/contexts/AuthContext';

/**
 * Hook to manage user data and prevent data leakage between different user sessions
 */
export const useUserDataManager = () => {
    const { state } = useAuth();
    const queryClient = useQueryClient();
    const currentUserIdRef = useRef<string | null>(null);
    const isInitializedRef = useRef(false);

    useEffect(() => {
        const currentUserId = state.user?.id || null;

        // Skip on initial mount to prevent unnecessary cleanup
        if (!isInitializedRef.current) {
            currentUserIdRef.current = currentUserId;
            isInitializedRef.current = true;
            return;
        }

        // If user changed (including login/logout scenarios)
        if (currentUserIdRef.current !== currentUserId) {
            console.log('User changed, cleaning up previous user data...');

            // Clear all queries to prevent data leakage
            queryClient.clear();

            // Additional cleanup for specific query patterns
            const userSpecificQueryPatterns = [
                'companies',
                'vessels',
                'crews',
                'licenses',
                'invitations',
                'dashboard-overview',
                'user-profile'
            ];

            userSpecificQueryPatterns.forEach(pattern => {
                queryClient.removeQueries({
                    queryKey: [pattern],
                    exact: false
                });
            });

            // Force garbage collection
            queryClient.getQueryCache().clear();
            queryClient.getMutationCache().clear();

            // Update the ref to current user
            currentUserIdRef.current = currentUserId;

            console.log(`Data cleanup completed. Current user: ${currentUserId || 'None'}`);
        }
    }, [state.user?.id, queryClient]);

    // Manual cleanup function that can be called when needed
    const forceCleanup = () => {
        queryClient.clear();
        queryClient.getQueryCache().clear();
        queryClient.getMutationCache().clear();
        console.log('Manual data cleanup completed');
    };

    return {
        forceCleanup,
        currentUserId: currentUserIdRef.current
    };
};