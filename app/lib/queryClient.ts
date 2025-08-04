// app/lib/queryClient.ts - Create this new file for centralized query client setup

import { QueryClient } from '@tanstack/react-query';

export const createQueryClient = () => {
    return new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 1 * 60 * 1000, // 1 minute
                gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
                retry: (failureCount, error: any) => {
                    // Don't retry on 401 (unauthorized) errors
                    if (error?.status === 401) {
                        return false;
                    }
                    return failureCount < 3;
                },
                refetchOnWindowFocus: false,
                refetchOnMount: true,
            },
            mutations: {
                retry: false,
            },
        },
    });
};

// Custom hook to handle query cleanup on user change
export const useQueryCleanup = () => {
    const queryClient = createQueryClient();

    const cleanupUserData = () => {
        // Remove all queries that contain user-specific data
        queryClient.removeQueries({
            predicate: (query) => {
                // Clean queries that are user-specific
                const userSpecificQueries = [
                    'companies',
                    'vessels',
                    'crews',
                    'licenses',
                    'invitations',
                    'dashboard-overview'
                ];

                return userSpecificQueries.some(key =>
                    query.queryKey.includes(key)
                );
            }
        });

        // Force garbage collection
        queryClient.getQueryCache().clear();
        queryClient.getMutationCache().clear();
    };

    return { cleanupUserData };
};