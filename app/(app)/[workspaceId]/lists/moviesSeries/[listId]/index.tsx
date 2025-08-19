import Breadcrumb from '@/components/breadcrumb';
import MovieSeriesList from '@/components/lists/movieSeries';
import Loader from '@/components/loader';
import { useLazyApi } from '@/hooks/use-api';
import useRealtimeGetData from '@/hooks/use-realtime';
import { useUserStore } from '@/store';
import { parseListCommon } from '@/utils/lists';
import { useFocusEffect, useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useCallback, useEffect } from 'react';
import { View } from 'react-native';

export const parseList = (list: any) => {
    list = parseListCommon(list);

    const fixedListItemsParsed = list.fixedListItems.reduce((acc: any, item: any) => {
        if (item.data.checked) {
            return {
                ...acc,
                seen: [
                    ...acc.seen,
                    item
                ],
            };
        }

        return {
            ...acc,
            notSeen: [
                ...acc.notSeen,
                item
            ]
        };
    }, { seen: [], notSeen: [] });

    return {
        ...list,
        fixedListItemsParsed
    };

};

const ListScreen = () => {
    const { listId, workspaceId } = useLocalSearchParams();
    const { data: listData, loading, error, request: getList } = useLazyApi<any>(`lists/${listId}`, 'GET', null, parseList);
    const workspace = useUserStore((state) => state.data?.workspaces.find((workspace) => workspace.id === Number(workspaceId)));
    const navigation = useNavigation();

    useRealtimeGetData(getList, `list-${listId}`, 'update-list');

    useFocusEffect(
        useCallback(() => {
            getList();
        }, []
    ));

    useEffect(() => {
        const hideHeader = (loading && !listData) || !listData;
        navigation.setOptions({ title: workspace?.name, headerShown: !hideHeader, headerTintColor: workspace?.color });
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
            <MovieSeriesList workspaceId={workspaceId as string} listData={listData} getList={getList} />
        </View>
    );
}

export default ListScreen;
