import Loader from '@/components/loader';
import { ThemeProvider } from '@/components/ThemeProvider';
import { SessionProvider, useSession } from '@/hooks/useSession';
import '@/i18n';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, } from 'expo-router';
import { Protected } from 'expo-router/build/views/Protected';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
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
        <SessionProvider>
            <RootLayoutNav />
        </SessionProvider>
    );
}

function RootLayoutNav() {
    const { session, isLoading } = useSession();

    if (isLoading) {
        return <Loader />;
    }

    return (
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
            </ThemeProvider>
        </SafeAreaProvider>
    );
}
