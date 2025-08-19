import Loader from '@/components/loader';
import Text from '@/components/Text';
import { useApi } from '@/hooks/use-api';
import { useSession } from '@/hooks/useSession';
import { Folder } from '@/models/folder';
import { useUserStore } from '@/store';
import { DrawerContentScrollView, DrawerHeaderProps } from '@react-navigation/drawer';
import { DrawerActions } from '@react-navigation/native';
import { NativeStackHeaderProps } from '@react-navigation/native-stack';
import { Href, useNavigation, usePathname, useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { ArrowLeft, LogOut, Menu, X } from 'lucide-react-native';
import { cssInterop } from 'nativewind';
import React, { JSX, useEffect } from 'react';
import { Pressable, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AppLayout() {
    const { data, loading } = useApi('me', 'GET');
    const { setData, data: userData } = useUserStore();

    useEffect(() => {
        if (data) {
            setData(data);
        }
    }, [data]);

    if (loading || !userData) {
        return <View className='flex flex-1 items-center justify-center'>
            <Loader size={50} />
        </View>;
    }

    return (
        <GestureHandlerRootView className='flex flex-1 bg-base-100'>
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
            </Drawer>
        </GestureHandlerRootView>
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
const DrawerContent = (props: any) => {
    const { data, logout } = useUserStore();
    const router = useRouter();
    const pathname = usePathname();
    const { signOut } = useSession();

    const handleLogout = async () => {
        await logout();
        signOut();
    }


    return (
        <View className="flex-1 flex flex-col bg-base-100 px-4">
            <DrawerContentScrollView {...props} scrollEnabled={false} contentContainerStyle={{ justifyContent: 'space-between', flex: 1, gap: 20 }}>
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
                <View className='flex flex-col flex-1'>
                    <DrawerItem
                        route='/'
                        active={pathname === "/"}
                        name='dashboard.title'
                        onPress={() => {
                            router.replace('/')
                            props.navigation.dispatch(DrawerActions.toggleDrawer());
                        }}
                    />
                    <DrawerItem
                        route='/workspaces'
                        active={pathname === "/workspaces"}
                        name='workspaces.title'
                        onPress={() => {
                            router.replace('/workspaces')
                            props.navigation.dispatch(DrawerActions.toggleDrawer());
                        }}
                    />
                    {data?.workspaces?.map((workspace: Folder) => (
                        <DrawerItem
                            key={workspace.id}
                            route={`/${workspace.id}`}
                            active={pathname.split('/')[1] === `${workspace.id}`}
                            color={workspace.color}
                            name={workspace.name}
                            onPress={() => {
                                router.replace(`/${workspace.id}`)
                                props.navigation.dispatch(DrawerActions.toggleDrawer());
                            }}
                        />
                    )) || []}
                </View>
                <View className='h-0.5 bg-base-content/40' />
                <View>
                    <TouchableOpacity onPress={handleLogout} className='text-base-content text-3xl font-bold flex flex-row items-center gap-4'>
                        <Text text='logout' className='text-base-content text-xl font-bold pb-1' />
                        <LogOut className='text-base-content' size={25} />
                    </TouchableOpacity>
                </View>
            </DrawerContentScrollView>
        </View>
    );
}

const DrawerItem = ({ route, active, color, icon, name, onPress }: { route: Href, active: boolean, color?: string, icon?: JSX.Element, name: string, onPress?: () => void }) => {
    const router = useRouter();
    const navigation = useNavigation();

    return (
        <Pressable
            onPress={onPress}
            className={`p-4 flex-row items-center gap-4 rounded-xl  ${active ? "bg-neutral/40 text-neutral-content" : ""}`}
        >
            {icon}
            {color && <View className='size-6 rounded-full' style={{ backgroundColor: color }} />}
            <Text text={name} className='text-base-content text-2xl' />
        </Pressable>
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
                className='px-4 pl-0 pb-2 pt-0 flex-row gap-0 items-center border-b border-base-content'
            >
                <TouchableOpacity onPress={handlePress} className='pl-4 px-6 py-4'>
                    {back ? (
                        <ArrowLeft size={24} className='text-base-content' />
                    ) : (
                        <Menu size={24} className='text-base-content' />
                    )}
                </TouchableOpacity>
                <View className='flex flex-row items-center gap-4'>
                    {options.headerTintColor && <View className='size-7 rounded-full' style={{ backgroundColor: options.headerTintColor }} />}
                    <Text text={title} className='text-base-content text-3xl font-bold' />
                </View>
            </View>
        </SafeAreaView>
    );
}
