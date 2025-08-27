import Loader from '@/components/loader';
import { useLazyApi } from '@/hooks/use-api';
import useRealtimeGetData from '@/hooks/use-realtime';
import TasksList from '@/modules/lists/tasks';
import { useUserStore } from '@/store';
import { parseListCommon } from '@/utils/lists';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useEffect } from 'react';
import { View } from 'react-native';

export const parseList = (list: any) => {
    list = parseListCommon(list);

    const itemsNotCompleted = list.listItems.filter((item: any) => !item.completed);
    const itemsCompleted = list.listItems.filter((item: any) => item.completed);

    return {
        ...list,
        itemsNotCompleted,
        itemsCompleted
    };
};

const TaskListScreen = () => {
    const { listId, workspaceId } = useLocalSearchParams();
    const { data: listData, loading, error, request: getList } = useLazyApi<any>(`lists/${listId}`, 'GET', null, parseList);
    const workspace = useUserStore((state) => state.data?.workspaces?.find((workspace) => workspace.id === Number(workspaceId)));
    const navigation = useNavigation();

    useRealtimeGetData(getList, `list-${listId}`, 'update-list');

    useEffect(() => {
        getList();
    }, [getList]);

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
        // <View className='flex flex-1 px-4 relative'>
        <TasksList listData={listData} loading={loading} getList={getList} />
        // </View>
    );
}

export default TaskListScreen;
