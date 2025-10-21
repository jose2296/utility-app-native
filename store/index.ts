import { ThemeColors } from '@/components/ThemeProvider';
import { Me } from '@/models/me';
import { parseDashboardItem } from '@/utils/dashboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface UserState {
    data?: Me;
    drawerWorkspacesOpened: boolean;
    colors?: Record<ThemeColors, string>;
    setColors: (colors: Record<ThemeColors, string>) => void;
    updateProfile: (data: {
        name?: string;
        language?: string;
        email?: string;
    }) => void;
    setData: (data: Me) => void;
    setDrawerWorkspacesOpened: (drawerWorkspacesOpened: boolean) => void;
    logout: () => Promise<void>;
}

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            data: undefined,
            colors: undefined,
            drawerWorkspacesOpened: true,
            updateProfile: (data) => set((currentData: any) => {
                return {
                    ...currentData,
                    data: {
                        ...currentData.data,
                        ...data,
                    }
                };
            }),
            setData: (data) => set(() => {
                return {
                    data: {
                        ...data,
                        dashboardItems: parseDashboardItem(data?.dashboardItems as any || []),
                    }
                };
            }),
            setColors: (colors) => set(() => {
                return {
                    colors
                };
            }),
            setDrawerWorkspacesOpened: (drawerWorkspacesOpened) => set(() => {
                return {
                    drawerWorkspacesOpened
                };
            }),
            logout: async () => {
                set({ data: undefined });
                await AsyncStorage.removeItem('user-data');
            },
        }),
        {
            name: 'user-data',
            storage: createJSONStorage(() => AsyncStorage),
        },
    )
);
