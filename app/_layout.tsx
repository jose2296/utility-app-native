import Loader from '@/components/loader';
import { ModalContainer } from '@/components/modal/modal.container';
import { ModalProvider } from '@/components/modal/modal.context';
import Text from '@/components/Text';
import { ThemeProvider } from '@/components/ThemeProvider';
import { SessionProvider, useSession } from '@/hooks/useSession';
import '@/i18n';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, } from 'expo-router';
import { Protected } from 'expo-router/build/views/Protected';
import * as SplashScreen from 'expo-splash-screen';
import { Component, useEffect } from 'react';
import { Button, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Toaster } from 'sonner-native';
import "../global.css";
import { Header } from './(app)/_layout';

export {
    // Catch any errors thrown by the Layout component.
    ErrorBoundary
} from 'expo-router';

export const unstable_settings = {
    // Ensure that reloading on `/modal` keeps a back button present.
    initialRouteName: '(app)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [loaded, error] = useFonts({
        SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
        ...FontAwesome.font,
    });

    // Expo Router uses Error Boundaries to catch errors in the navigation tree.
    useEffect(() => {
        if (error) throw error;
    }, [error]);

    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync();
        }
    }, [loaded]);

    if (!loaded) {
        return null;
    }

    return (
        // <ClerkProvider tokenCache={tokenCache}>
        <SessionProvider>
            <ErrorBoundary>
                <RootLayoutNav />
            </ErrorBoundary>
        </SessionProvider>
        // </ClerkProvider>
    );
}

// ✅ Tipado de Props y Estado
interface ErrorBoundaryProps {
    children: React.ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<
    ErrorBoundaryProps,
    ErrorBoundaryState
> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("🧱 Error capturado por ErrorBoundary:", error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <View className="flex-1 items-center justify-center bg-red-100 p-6">
                    <Text className="text-red-700 text-xl font-bold mb-2" text="Ups, algo salió mal 😢" />
                    <Text className="text-red-600 mb-4" text={this.state.error?.message || "Error desconocido"} />

                    <Button
                        title="Reintentar"
                        onPress={this.handleReset}
                    />
                </View>
            );
        }

        return this.props.children;
    }
}


function RootLayoutNav() {
    const { session, isLoading, signOut } = useSession();
    // const { isSignedIn, isLoaded } = useAuth()

    if (isLoading) {
        return (
            <View className='flex flex-1 items-center justify-center bg-base-100'>
                <Loader />
            </View>
        );
    }

    return (
        <ModalProvider>
            <GestureHandlerRootView className='flex flex-1 bg-base-100'>
                <SafeAreaProvider>
                    <ThemeProvider>
                        <NavigationThemeProvider value={{
                            ...DefaultTheme,
                            colors: {
                                ...DefaultTheme.colors,
                                background: 'var(--color-base-100)',
                            }
                        }} >
                            <Stack screenOptions={{
                                header(props) {
                                    return <Header {...props} />
                                },
                            }}>
                                <Protected guard={!!session}>
                                    <Stack.Screen name="(app)" options={{ headerShown: false }} />
                                </Protected>
                                <Protected guard={!session}>
                                    <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                                </Protected>
                                <Stack.Screen name="+not-found" options={{ headerShown: true, title: 'not Found', animation: 'simple_push' }} />
                            </Stack>
                        </NavigationThemeProvider>

                        <ModalContainer />

                        <Toaster position='bottom-center' styles={{
                            toastContainer: {
                                justifyContent: 'center',
                                alignItems: 'center',
                                width: '90%',
                                maxWidth: '90%',
                            },
                            toast: {
                                backgroundColor: 'blue'
                            },
                            toastContent: {
                                backgroundColor: 'green',
                            }
                        }} />
                    </ThemeProvider>
                </SafeAreaProvider>
            </GestureHandlerRootView>
        </ModalProvider>
    );
}
