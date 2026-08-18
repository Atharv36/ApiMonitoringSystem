import { useQuery } from '@tanstack/react-query';
import { authApi } from '../api/api';
import { QUERY_KEYS } from '../constants';

export function useProfileQuery(options = {}) {
    return useQuery({
        queryKey: QUERY_KEYS.PROFILE,
        queryFn: ({ signal }) => authApi.getProfile({ signal }),
        staleTime: Infinity,
        retry: false,
        ...options,
    });
}
