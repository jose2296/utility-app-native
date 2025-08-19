import Breadcrumb from '@/components/breadcrumb';
import Loader from '@/components/loader';
import { useLazyApi } from '@/hooks/use-api';
import useRealtimeGetData from '@/hooks/use-realtime';
import { useUserStore } from '@/store';
import { parseListCommon } from '@/utils/lists';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useEffect } from 'react';
import { Text, View } from 'react-native';

export const parseList = (list: any) => {
    list = parseListCommon(list);

    const fixedListItemsParsed = list.fixedListItems.reduce((acc: any, item: any) => {
        if (item.data.checked) {
            return {
                ...acc,
                read: [
                    ...acc.read,
                    item
                ],
            };
        }

        return {
            ...acc,
            notRead: [
                ...acc.notRead,
                item
            ]
        };
    }, { read: [], notRead: [] });

    return {
        ...list,
        fixedListItemsParsed
    };
};

const BooksScreen = () => {
    const { listId, type } = useLocalSearchParams();
    const { data: listData, loading, error, request: getList } = useLazyApi<any>(`lists/${listId}`, 'GET', null, parseList);
    const { workspaceId } = useLocalSearchParams();
    const workspace = useUserStore((state) => state.data?.workspaces.find((workspace) => workspace.id === Number(workspaceId)));
    const navigation = useNavigation();

    useRealtimeGetData(getList, `list-${listId}`, 'update-list');

    useEffect(() => {
        const hideHeader = (loading && !listData) || !listData;
        navigation.setOptions({ title: listData?.name, headerShown: !hideHeader, headerTintColor: workspace?.color });

    }, [navigation, listData, workspace]);

    if ((loading && !listData) || !listData) {
        return (
            <View className='flex flex-1 items-center justify-center'>
                <Loader size={60} />
            </View>
        );
    }

    return (
        <View className='flex flex-1 px-4'>
            <Breadcrumb breadcrumb={listData?.breadcrumb} />
            <Text>books</Text>
        </View>
    );
}

export default BooksScreen;
