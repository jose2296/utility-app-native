import { Me } from '@/models/me';
import { parseDashboardItem } from '@/utils/dashboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface UserState {
    data?: Me;
    colors?: any;
    setColors: (colors: any) => void;
    setData: (data: Me) => void;
    logout: () => Promise<void>;
}

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            data: undefined,
            colors: undefined,
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
