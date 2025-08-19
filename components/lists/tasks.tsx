import { useLazyApi } from '@/hooks/use-api';
import { useAudioPlayer } from 'expo-audio';
import { Plus } from 'lucide-react-native';
import React, { useState } from 'react';
import { TouchableOpacity, View } from "react-native";
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomSheet from '../BottomSheet';
import InformationModal from '../InformationModal';
import Text from '../Text';
import AnimatedList from '../animatedList';
import Button from '../button';
import { Input } from '../input';
import CustomPullToRefreshOnRelease from '../pullToRefresh';
import TaskItem from './taskItem';

const audioSourceCompleted = require('../../assets/sounds/completed.mp3');
const audioSourceWrite = require('../../assets/sounds/pencil-write.mp3');
const audioSourceTrash = require('../../assets/sounds/trash.mp3');


// cssInterop(Modal, {
//     className: {
//         target: "style", // map className->style
//     },
// });


const TasksList = ({ listData, loading, getList }: { listData: any, loading: boolean, getList: () => Promise<void> }) => {
    const [newListItemContent, setNewListItemContent] = useState('');
    const [listItemSelected, setListItemSelected] = useState<any>(null);
    // const [itemsCompleted, setItemCompleted] = useState<any[]>([]);
    // const [itemsNotCompleted, setItemsNotCompleted] = useState<any[]>([]);
    const { request: saveListItem, loading: savingListItem } = useLazyApi<any>(`list-items`, 'POST');
    const { request: deleteListItem, loading: deletingListItem } = useLazyApi<any>(`list-items`, 'DELETE');
    const playerWrite = useAudioPlayer(audioSourceWrite);
    const playerCompleted = useAudioPlayer(audioSourceCompleted);
    const playerTrash = useAudioPlayer(audioSourceTrash);
    const [editBottomModalOpen, setEditBottomModalOpen] = useState(false);
    const [saveBottomModalMode, setSaveBottomModalMode] = useState<'edit' | 'create' | null>(null);
    const [deleteBottomModalOpen, setDeleteBottomModalOpen] = useState(false);
    const insets = useSafeAreaInsets();

    // useEffect(() => {
    //     const listItemsNotCompleted = listData.listItems.filter((item: any) => !item.completed);
    //     const listItemsCompleted = listData.listItems.filter((item: any) => item.completed);
    //     setItemCompleted(listItemsCompleted);
    //     setItemsNotCompleted(listItemsNotCompleted);
    // }, [listData]);

    const handleSaveListItem = async () => {
        await saveListItem(`list-items/${listItemSelected.id}`, { content: listItemSelected.content });
        setEditBottomModalOpen(false);
        setListItemSelected(null);
        await getList();
    }

    const handleSaveNewListItem = async () => {
        if (!newListItemContent.trim()) {
            return;
        }

        const newListItem = {
            content: newListItemContent,
            completed: false,
            order: listData.listItems.at(-1)?.order + 1 || 0,
            list_id: listData.id
        };

        try {
            const response = await saveListItem(`list-items`, newListItem);
            playerWrite.seekTo(0);
            playerWrite.play();
            setNewListItemContent('');
            setSaveBottomModalMode(null);
            setEditBottomModalOpen(false);
            await getList();
        } catch (error) {
            console.error('Error saving new list item:', error);
        }
    }

    const handleToggleCompletedItem = async (listItemId: number, completed: boolean): Promise<any> => {
        const updatedData = await saveListItem(`list-items/${listItemId}`, { completed });
        if (completed) {
            playerCompleted.seekTo(0);
            playerCompleted.volume = 0.5;
            playerCompleted.play();
        }
        await getList();

        return updatedData;
    };

    const handleEditItem = async (listItem: any) => {
        setListItemSelected(listItem);
        setSaveBottomModalMode('edit');
        setEditBottomModalOpen(true);
    };

    const handleOpenDeleteItemModal = async (listItem: any) => {
        setListItemSelected(listItem);
        setDeleteBottomModalOpen(true);
    };

    const handleDeleteItem = async () => {
        await deleteListItem(`list-items/${listItemSelected.id}`, null);
        playerTrash.seekTo(0);
        playerTrash.volume = 0.5;
        playerTrash.play();
        setDeleteBottomModalOpen(false);
        setListItemSelected(null);
        await getList();
    };

    return (
        <>
            <View className='flex-1 '>
                <CustomPullToRefreshOnRelease onRefresh={getList}>
                    <View className='flex flex-1 gap-x-4 pb-10 pt-4'>
                        {!listData.itemsNotCompleted.length && !listData.itemsCompleted.length &&
                            <Text text='list.no_items_found' className="mt-4 text-base-content text-center flex items-center justify-center flex-1" />
                        }
                        {listData.itemsNotCompleted.length > 0 && (
                            <AnimatedList<any>
                                data={listData.itemsNotCompleted}
                                getKey={(item) => item.id}
                                renderItem={(item) => (
                                    <TaskItem
                                        item={item}
                                        savingListItem={savingListItem || loading}
                                        handleToggleCompletedItem={handleToggleCompletedItem}
                                        handleEditItem={handleEditItem}
                                        handleDeleteItem={handleOpenDeleteItemModal}
                                    />
                                )} />
                        )}
                        {listData.itemsCompleted.length > 0 && (
                            <>
                                <View className='my-10 h-0.5 bg-base-content' />
                                <AnimatedList<any>
                                    data={listData.itemsCompleted}
                                    getKey={(item) => item.id}
                                    renderItem={(item) => (
                                        <TaskItem
                                            item={item}
                                            savingListItem={savingListItem || loading}
                                            handleToggleCompletedItem={handleToggleCompletedItem}
                                            handleEditItem={handleEditItem}
                                            handleDeleteItem={handleOpenDeleteItemModal}
                                        />
                                    )}
                                />
                            </>
                        )}
                    </View>
                </CustomPullToRefreshOnRelease>

            </View>

            <TouchableOpacity
                onPress={() => { setSaveBottomModalMode('create'); setEditBottomModalOpen(true) }}
                className='absolute right-4 p-4 bg-primary rounded-full shadow-lg'
                style={{ bottom: insets.bottom + 10 }}
            >
                <Plus size={35} className='text-primary-content' />
            </TouchableOpacity>

            <BottomSheet
                isOpen={editBottomModalOpen}
                onClose={() => { setEditBottomModalOpen(false); setListItemSelected(null); }}
                sheetHeight={280}
            >
                <ScrollView className='flex flex-1 flex-col'>
                    <Text text={saveBottomModalMode === 'create' ? 'list.tasks.create_item' : 'list.tasks.edit_item'} className='text-base-content text-2xl font-bold' />
                    <View className='h-0.5 bg-base-content/50 my-2' />
                    <View className='flex flex-col gap-y-6'>
                        <Input
                            label={saveBottomModalMode === 'create' ? 'list.tasks.new_item_content' : 'list.tasks.item_content'}
                            value={saveBottomModalMode === 'create' ? newListItemContent : listItemSelected?.content || ''}
                            onSubmitEditing={saveBottomModalMode === 'create' ? handleSaveNewListItem : handleSaveListItem}
                            onChangeText={(value) => {
                                if (saveBottomModalMode === 'create') {
                                    setNewListItemContent(value);
                                } else {
                                    setListItemSelected({ ...listItemSelected, content: value });
                                }
                            }}
                        />
                        <Button name={saveBottomModalMode === 'create' ? 'create' : 'save'} onPress={saveBottomModalMode === 'create' ? handleSaveNewListItem : handleSaveListItem} isLoading={savingListItem} />
                    </View>
                </ScrollView>
            </BottomSheet>

            <InformationModal
                isOpen={deleteBottomModalOpen}
                title="list.tasks.delete_item"
                message="list.tasks.delete_item_confirmation"
                messageTranslateData={{ name: listItemSelected?.content || '' }}
                onClose={() => setDeleteBottomModalOpen(false)}
                onSubmit={handleDeleteItem}
                isLoading={deletingListItem}
            />
        </>
    );
};

export default TasksList;
