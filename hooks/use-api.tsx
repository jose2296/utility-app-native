// hooks/useApi.ts
'use client';

// import { useRouter } from '@i18n/navigation';
import { useUserStore } from '@/store';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useSession } from './useSession';
type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

type CommonApiResponse<T> = {
    data: T | null;
    loading: boolean;
    error: ApiError | null;
};
type FetchOptions<T> = (endpoint?: string, body?: any) => Promise<T | null>;
type ApiResponse<T> = CommonApiResponse<T> & {
    refetch: FetchOptions<T>;
};
type LazyApiResponse<T> = CommonApiResponse<T> & {
    request: FetchOptions<T>;
};
export type ApiError = {
    message: string;
    status?: number;
};

type Mapper<T = any, R = any> = (data: T) => R;

export function useLazyApi<T = any, R = T>(endpoint: string, method: Method = 'GET', body?: any, transform?: Mapper<T, R>): LazyApiResponse<R> {
    const [data, setData] = useState<R | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<ApiError | null>(null);
    const { session, signOut, refreshToken, signIn } = useSession();
    const { logout } = useUserStore();
    const router = useRouter();

    const request = useCallback(
        async (_endpoint?: string, _body?: any): Promise<R | null> => {
            setLoading(true);
            setError(null);

            try {
                const url = `${process.env.EXPO_PUBLIC_API_URL}/api/${_endpoint || endpoint}`;
                const headers = new Headers();
                headers.set('Content-Type', 'application/json');
                headers.set('Authorization', `Bearer ${session?.access_token!}`);
                headers.set('refresh_token', session?.refresh_token!);

                const res = await fetch(url, {
                    method: method,
                    headers,
                    body: method === 'GET' || method === 'DELETE' ? null : JSON.stringify(_body ?? body ?? null)
                });

                if (res.status === 401) {
                    // router.push('/auth/login')
                    const json = await res.json().catch(() => null);
                    const message = json?.error || res.statusText || 'Unknown error';
                    const error = { message, status: res.status };

                    if (message === 'expired') {
                        const newSession = await refreshToken();
                        signIn(newSession!)
                        // request(_endpoint, _body);
                        // return null;

                        router.push('/');
                        return null;
                    }

                    setError(error);
                    await logout();
                    signOut();
                    throw error;
                }

                if (!res.ok) {
                    const json = await res.json().catch(() => null);
                    const message = json?.error || res.statusText || 'Unknown error';
                    const error = { message, status: res.status };
                    setError(error);

                    throw error;
                }

                const json: T = await res.json();
                const mappedData = transform ? transform(json) : (json as unknown as R);
                setData(mappedData);
                return mappedData;
            } catch (err) {
                const error = err as ApiError;

                if (error.message == "Network request failed") {
                    setError(error);
                    await logout();
                    signOut();
                    alert("Network please contact with support team: \n\n orbithublabs@gmail.com")
                }

                setError(error);
                throw error;
            } finally {
                setLoading(false);
            }
        },
        [endpoint, method, transform]
    );

    return { request, data, loading, error };
}


export function useApi<T = any>(endpoint: string, method: Method = 'GET', body?: any, transformFunction?: Mapper<T, T>): ApiResponse<T> {
    const { request, ...api } = useLazyApi<T>(endpoint, method, body, transformFunction);

    useEffect(() => {
        request(endpoint, body);
    }, [request]);

    return { ...api, refetch: request };
}
