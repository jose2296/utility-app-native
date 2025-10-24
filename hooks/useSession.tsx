import { useUserStore } from '@/store';
import { createContext, use, type PropsWithChildren } from 'react';
import { useStorageState } from './useStorage';

const AuthContext = createContext<{
    signIn: ({ access_token, refresh_token }: { access_token: string; refresh_token: string }) => void;
    signOut: () => void;
    refreshToken: () => Promise<{ access_token: string; refresh_token: string } | null> | null;
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
    const { logout } = useUserStore();

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

                    const url = `${process.env.EXPO_PUBLIC_API_URL}/api/auth/refresh`;
                    const headers = new Headers();
                    headers.set('Content-Type', 'application/json');

                    try {
                        const res = await fetch(url, {
                            method: 'POST',
                            headers,
                            body: JSON.stringify({
                                refreshToken: session?.refresh_token!
                            })
                        });

                        const newSession = await res.json();
                        const _session = {
                            access_token: newSession.access_token as string,
                            refresh_token: newSession.refresh_token as string
                        };
                        setSession(_session);

                        return _session;
                    } catch (error) {
                        await logout();
                        setSession(null);
                        return null;
                    }
                },
                session,
                isLoading,
            }}>
            {children}
        </AuthContext>
    );
}
