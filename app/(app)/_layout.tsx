import Accordion from '@/components/accordion';
import Loader from '@/components/loader';
import Text from '@/components/Text';
import { useApi, useLazyApi } from '@/hooks/use-api';
import { useSession } from '@/hooks/useSession';
import { Me } from '@/models/me';
import { registerForPushNotificationsAsync, setupNotificationListeners } from '@/services/notifications';
import { cn, getAnalogous } from '@/services/utils';
import { useUserStore } from '@/store';
import { DrawerContentComponentProps, DrawerContentScrollView, DrawerHeaderProps } from '@react-navigation/drawer';
import { DrawerActions } from '@react-navigation/native';
import { NativeStackHeaderProps } from '@react-navigation/native-stack';
import dayjs from 'dayjs';
import 'dayjs/locale/en';
import 'dayjs/locale/es';
import { LinearGradient } from 'expo-linear-gradient';
import { Href, usePathname, useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { ArrowLeft, LogOut, Menu, X } from 'lucide-react-native';
import { cssInterop } from 'nativewind';
import React, { JSX, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Animated, { FadeIn, FadeOut, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AppLayout() {
    const { data, loading } = useApi<Me>('me', 'GET');
    const { setData, data: userData } = useUserStore();
    const [isNotificationListener, setIsNotificationListener] = useState(false);
    const { request: updateDeviceToken } = useLazyApi('user/update-user', 'POST');
    const { i18n } = useTranslation()

    useEffect(() => {
        if (data) {
            setData(data);
            i18n.changeLanguage(data.language);
            dayjs.locale(data.language);
            if (!isNotificationListener) {
                registerDeviceNotificationToken();
            }
        }
    }, [data]);

    const registerDeviceNotificationToken = async () => {
        const token = await registerForPushNotificationsAsync();

        if (token && !data?.device_tokens?.includes(token)) {
            await updateDeviceToken('users/add-device-token', {
                device_token: token
            })
        }

        setupNotificationListeners();
        setIsNotificationListener(true);
    };

    if (loading || !userData) {
        return (
            <View className='flex flex-1 items-center justify-center bg-base-100'>
                <Loader size={50} />
            </View>
        );
    }

    return (
        <Drawer
            screenOptions={{
                swipeEdgeWidth: 70,
                swipeEnabled: false,
                drawerType: 'front',
                // drawerStyle: {
                //     backgroundColor: 'red', // lo maneja Tailwind
                // },
                headerStyle: {
                    // backgroundColor: 'var(--color-base-100)',
                },
                headerShown: false,
                header: (props) => <Header {...props} />
            }}
            drawerContent={props => <DrawerContent {...props} />}
        >
            <Drawer.Screen
                name="index"
                options={{
                    title: 'dashboard.title',
                    headerShown: true
                }}
            />
            <Drawer.Screen
                name="workspaces"
                options={{
                    title: 'workspaces.title',
                    headerShown: true
                }}
            />
            <Drawer.Screen
                name="profile"
                options={{
                    title: 'profile.title',
                    headerShown: true
                }}
            />
            <Drawer.Screen
                name="calendar"
                options={{
                    title: 'events.title',
                    headerShown: true
                }}
            />
        </Drawer>
    );
}

cssInterop(LogOut, {
    className: {
        target: "style", // map className->style
        nativeStyleToProp: {
            color: true
        },
    },
});
const DrawerContent = (props: DrawerContentComponentProps) => {
    const { data, drawerWorkspacesOpened, setDrawerWorkspacesOpened, logout } = useUserStore();
    const { request: logoutRequest } = useLazyApi('auth/logout', 'POST');
    const router = useRouter();
    const pathname = usePathname();
    const { signOut } = useSession();

    const handleLogout = async () => {
        try {
            await logoutRequest('auth/logout', {});

            await logout();
            signOut();
        } catch (error) {
        }
    };

    useEffect(() => {
        if (data?.workspaces?.map((workspace) => workspace.id).includes(parseInt(pathname.split('/')[1])) || pathname === "/workspaces") {
            setDrawerWorkspacesOpened(true)
        }
    }, [pathname]);

    return (
        <View className="flex-1 flex flex-col bg-base-100 px-4">
            <DrawerContentScrollView {...props} scrollEnabled={false} contentContainerStyle={{ justifyContent: 'space-between', flex: 1, gap: 20 }}>
                {/* <View className='flex-1 gap-5 justify-between'> */}
                <View className='flex flex-row items-start justify-between'>
                    <View className='flex flex-col gap-2'>
                        <Text avoidTranslation text={data?.name || ""} className='text-base-content text-3xl font-bold' />
                        <Text avoidTranslation text={data?.email || ""} className='text-base-content/60 text-sm font-bold' />
                    </View>
                    <TouchableOpacity className='py-2 px-4' onPress={() => props.navigation.dispatch(DrawerActions.toggleDrawer())}>
                        <X size={25} className='text-base-content' />
                    </TouchableOpacity>
                </View>
                <View className='h-0.5 bg-base-content/40' />
                <ScrollView className='flex flex-col flex-1'>
                    <DrawerItem
                        route='/'
                        active={pathname === "/"}
                        name='dashboard.title'
                        onPress={() => {
                            router.replace('/')
                            props.navigation.dispatch(DrawerActions.toggleDrawer());
                        }}
                    />
                    <Accordion
                        isExpanded={drawerWorkspacesOpened}
                        onToggle={() => setDrawerWorkspacesOpened(!drawerWorkspacesOpened)}
                        title={
                            <DrawerItem
                                route='/workspaces'
                                active={pathname === "/workspaces"}
                                name='workspaces.title'
                                onPress={() => {
                                    router.replace('/workspaces');
                                    setDrawerWorkspacesOpened(true);
                                    props.navigation.dispatch(DrawerActions.toggleDrawer());
                                }}
                            />
                        }
                    >
                        <View className='pl-2'>
                            {data?.workspaces?.map((workspace) => (
                                <DrawerItem
                                    key={workspace.id}
                                    route={`/${workspace.id}`}
                                    active={pathname.split('/')[1] === `${workspace.id}`}
                                    color={workspace.color}
                                    name={workspace.name}
                                    onPress={() => {
                                        router.replace(`/${workspace.id}`);
                                        setDrawerWorkspacesOpened(true);
                                        props.navigation.dispatch(DrawerActions.toggleDrawer());
                                    }}
                                />
                            )) || []}
                        </View>
                    </Accordion>

                    <DrawerItem
                        route='/calendar'
                        active={pathname === "/calendar"}
                        name='events.title'
                        onPress={() => {
                            router.replace('/calendar')
                            props.navigation.dispatch(DrawerActions.toggleDrawer());
                        }}
                    />
                </ScrollView>

                <DrawerItem
                    route='/profile'
                    active={pathname === "/profile"}
                    name='profile.title'
                    onPress={() => {
                        router.replace('/profile')
                        props.navigation.dispatch(DrawerActions.toggleDrawer());
                    }}
                />
                <View className='h-0.5 bg-base-content/40' />
                <View>
                    <TouchableOpacity onPress={handleLogout} className='text-base-content text-3xl font-bold flex flex-row items-center gap-4'>
                        <Text text='logout' className='text-base-content text-xl font-bold pb-1' />
                        <LogOut className='text-base-content' size={25} />
                    </TouchableOpacity>
                </View>
                {/* </View> */}
            </DrawerContentScrollView>
        </View>
    );
}

const DrawerItem = ({ route, active, color, icon, name, onPress }: { route: Href, active: boolean, color?: string, icon?: JSX.Element, name: string, onPress?: () => void }) => {
    const [showToolTip, setShowToolTip] = useState(false);
    const [toolTipHeight, setToolTipHeight] = useState(0);
    // TODO: Add component for tooltip
    const transitionStyle = useAnimatedStyle(() => {
        return {
            opacity: withTiming(showToolTip ? 1 : 0),
            transform: [
                {
                    translateY: withTiming(showToolTip ? -toolTipHeight : 0)
                }
            ]
        }
    });

    return (
        <View className='relative'>
            <TouchableOpacity
                onPress={onPress}
                onLongPress={() => {
                    setShowToolTip(true);
                    setTimeout(() => {
                        setShowToolTip(false);
                    }, 2000);
                }}
                className={`p-4 flex-row items-center gap-4 rounded-xl  ${active ? "bg-neutral/40 text-neutral-content" : ""}`}
            >
                {icon}
                {color && <GradientBall color={color} className='size-6' />}
                <Text text={name} numberOfLines={1} className='text-base-content text-2xl flex-1' />
            </TouchableOpacity>

            {showToolTip && (
                <Animated.View
                    // style={transitionStyle}
                    // TODO: Add animation to slide in but not from bottom (is from bottom os screen no parent element)
                    entering={FadeIn}
                    exiting={FadeOut}
                    onLayout={(e) => setToolTipHeight(e.nativeEvent.layout.height)}
                    className='absolute -top-16 left-0 bg-base-300 rounded-xl p-4'
                >
                    <View className='absolute -bottom-3 transform rotate-45 left-1/2 size-6 bg-base-300'
                    />
                    <Text text={name} className='text-base-content text-lg flex-1' />
                </Animated.View>
            )}
        </View>
    );
}

export const Header = (props: DrawerHeaderProps | NativeStackHeaderProps) => {
    const { navigation, options, back } = props as NativeStackHeaderProps;
    const title = options.title ?? props.route.name;
    const router = useRouter();

    const handlePress = () => {
        if (back) {
            router.back();
        } else {
            navigation.dispatch(DrawerActions.toggleDrawer());
        }
    };

    return (
        <SafeAreaView edges={['top']} style={{ backgroundColor: 'var(--color-base-300)' }}>
            <View
                className='px-4 pb-2 pt-0 flex-row gap-0 items-center border-b border-base-content'
            >
                <TouchableOpacity onPress={handlePress} className='pl-0 px-6 py-4' hitSlop={10}>
                    {back ? (
                        <ArrowLeft size={24} className='text-base-content' />
                    ) : (
                        <Menu size={24} className='text-base-content' />
                    )}
                </TouchableOpacity>
                <View className='flex flex-1 flex-row items-center gap-4'>
                    {options.headerTintColor && (
                        <GradientBall color={options.headerTintColor} />
                    )}
                    <Text text={title} className='text-base-content text-3xl font-bold flex-1' />
                    {options.headerRight?.({})}
                </View>
            </View>
        </SafeAreaView>
    );
}

export const GradientBall = ({ color, className }: { color: string, className?: string }) => {
    const colors = [...getAnalogous(color)] as any;
    return (
        <View className={cn(`size-7 rounded-full overflow-hidden`, className)} style={{ backgroundColor: color }}>
            <LinearGradient
                colors={colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0
                }}
            />
        </View>
    )
}
