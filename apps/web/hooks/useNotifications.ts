import useSWR from 'swr';
import { getNotifications, Notification, getAuthToken } from '@/lib/api';

export function useNotifications() {
    const isAuthenticated = !!getAuthToken();
    
    const { data, error, mutate } = useSWR<Notification[]>(
        isAuthenticated ? '/notifications' : null,
        getNotifications,
        {
            refreshInterval: 15000, // 15 seconds
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
        }
    );

    return {
        notifications: data || [],
        isLoading: isAuthenticated && !error && !data,
        error,
        mutate,
    };
}

