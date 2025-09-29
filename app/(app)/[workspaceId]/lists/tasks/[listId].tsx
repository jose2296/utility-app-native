import Loader from '@/components/loader';
import BottomSheetOptions from '@/components/modal/bottom-sheet-options';
import CollaboratorsModal from '@/components/modal/collaborators-modal';
import { useLazyApi } from '@/hooks/use-api';
import useRealtimeGetData from '@/hooks/use-realtime';
import TasksList from '@/modules/lists/tasks';
import { useUserStore } from '@/store';
import { parseListCommon } from '@/utils/lists';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { Ellipsis } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { listOptions } from '../..';

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
    const [isListOptionsOpen, setIsListOptionsOpen] = useState(false);
    const [seeCollaboratorsModalOpen, setSeeCollaboratorsModalOpen] = useState(false);
    const [_listOptionsOpen, setListOptionsOpen] = useState(listOptions);

    useRealtimeGetData(getList, `list-${listId}`, 'update-list');

    useEffect(() => {
        getList();
    }, [getList]);

    useEffect(() => {
        const hideHeader = (loading && !listData) || !listData;
        navigation.setOptions({
            title: listData?.name,
            headerShown: !hideHeader, headerTintColor: workspace?.color,
            headerRight: () => (
                <TouchableOpacity onPress={() => setIsListOptionsOpen(true)} className={`p-4`} hitSlop={10}>
                    <Ellipsis size={20} className='text-base-content' />
                </TouchableOpacity>
            )
        });
        // if (!listData?.collaborators.length) {
        //     setListOptionsOpen(listOptions.filter((option) => option.value !== 'see_collaborators'));
        // } else {
        //     setListOptionsOpen(listOptions);
        // }
    }, [navigation, listData, workspace]);

    if ((loading && !listData) || !listData) {
        return (
            <View className='flex flex-1 items-center justify-center'>
                <Loader size={60} />
            </View>
        );
    }

    return (
        <>
            <TasksList listData={listData} loading={loading} getList={getList} />

            <BottomSheetOptions
                isOpen={isListOptionsOpen}
                onClose={() => setIsListOptionsOpen(false)}
                options={_listOptionsOpen}
                title='list.options'
                handleItemOptionSelected={(value) => {
                    switch (value) {
                        case 'edit_list':
                            // navigation.navigate(`/(app)/${workspaceId}/lists/tasks/${listId}/edit`);
                            break;
                        case 'add_list_to_dashboard':
                            // handlePinItem(listData);
                            break;
                        case 'share_list':
                            // handleShareItem(listData);
                            break;
                        case 'see_collaborators':
                            setIsListOptionsOpen(false);
                            setSeeCollaboratorsModalOpen(true);
                            break;
                        case 'remove_list':
                            // setDeleteListModalOpen(true);
                            break;
                    }
                }}
            />

            <CollaboratorsModal
                isOpen={seeCollaboratorsModalOpen}
                onClose={() => setSeeCollaboratorsModalOpen(false)}
                collaborators={listData?.collaborators || []}
            />
        </>
    );
}

export default TaskListScreen;
