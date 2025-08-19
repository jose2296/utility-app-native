import Breadcrumb from '@/components/breadcrumb';
import TasksList from '@/components/lists/tasks';
import Loader from '@/components/loader';
import { useLazyApi } from '@/hooks/use-api';
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
    const { listId } = useLocalSearchParams();
    const { data: listData, loading, error, request: getList } = useLazyApi<any>(`lists/${listId}`, 'GET', null, parseList);
    const { workspaceId } = useLocalSearchParams();
    const workspace = useUserStore((state) => state.data?.workspaces.find((workspace) => workspace.id === Number(workspaceId)));
    const navigation = useNavigation();

    // useRealtimeGetData(getList, `list-${listId}`, 'update-list');
    useEffect(() => {
        getList();
    }, [getList]);

    useEffect(() => {
        navigation.setOptions({ title: workspace?.name, headerTintColor: workspace?.color });

    }, [navigation, listData, workspace]);

    if ((loading && !listData) || !listData) {
        return (
            <View className='flex flex-1 items-center justify-center'>
                <Loader size={60} />
            </View>
        );
    }

    return (
        <View className='flex flex-1 px-4 relative'>
            <Breadcrumb breadcrumb={listData?.breadcrumb} />
            <TasksList listData={listData} loading={loading} getList={getList} />
        </View>
    );
}

export default TaskListScreen;
