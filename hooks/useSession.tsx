import { createContext, use, type PropsWithChildren } from 'react';
import { useLazyApi } from './use-api';
import { useStorageState } from './useStorage';

const AuthContext = createContext<{
    signIn: ({ access_token, refresh_token }: { access_token: string; refresh_token: string }) => void;
    signOut: () => void;
    refreshToken: () => void;
    session?: { access_token: string; refresh_token: string } | null;
    isLoading: boolean;
}>({
    signIn: ({ access_token, refresh_token }: { access_token: string; refresh_token: string }) => null,
    signOut: () => null,
    refreshToken: () => null,
    session: null,
    isLoading: false,
});

// This hook can be used to access the user info.
export function useSession() {
    const value = use(AuthContext);
    if (!value) {
        throw new Error('useSession must be wrapped in a <SessionProvider />');
    }

    return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
    const [[isLoading, session], setSession] = useStorageState('session');


    return (
        <AuthContext
            value={{
                signIn: ({ access_token, refresh_token }: { access_token: string; refresh_token: string }) => {
                    // Perform sign-in logic here
                    setSession({ access_token, refresh_token });
                },
                signOut: () => {
                    setSession(null);
                },
                refreshToken: async () => {
                    console.log('Refreshing token...');

                    const url = `${process.env.EXPO_PUBLIC_API_URL}/auth/refresh-token`;
                    const headers = new Headers();
                    headers.set('Content-Type', 'application/json');
                    headers.set('refresh_token', session?.refresh_token!);

                    const res = await fetch(url, {
                        method: 'POST',
                        headers,
                        body: null
                    });

                    const newSession = await res.json();
                    setSession({
                        access_token: newSession.access_token,
                        refresh_token: newSession.refresh_token
                    });
                },
                session,
                isLoading,
            }}>
            {children}
        </AuthContext>
    );
}
