import { useModal } from '@/components/modal/modal.context';
import { ModalProps } from '@/components/modal/modal.model';
import { useLazyApi } from '@/hooks/use-api';
import { useAudioPlayer } from 'expo-audio';
import { Plus } from 'lucide-react-native';
import React, { useState } from 'react';
import { TouchableOpacity, View } from "react-native";
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import InformationModal from '../../components/InformationModal';
import PageLayout from '../../components/PageLayout';
import Text from '../../components/Text';
import AnimatedList from '../../components/animatedList';
import Button from '../../components/button';
import { Input } from '../../components/input';
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
    const [listItemSelected, setListItemSelected] = useState<any>(null);
    // const [itemsCompleted, setItemCompleted] = useState<any[]>([]);
    // const [itemsNotCompleted, setItemsNotCompleted] = useState<any[]>([]);
    const { request: saveListItem, loading: savingListItem } = useLazyApi<any>(`list-items`, 'POST');
    const { request: deleteListItem, loading: deletingListItem } = useLazyApi<any>(`list-items`, 'DELETE');
    const playerCompleted = useAudioPlayer(audioSourceCompleted);
    const playerTrash = useAudioPlayer(audioSourceTrash);
    // const [saveBottomModalMode, setSaveBottomModalMode] = useState<'edit' | 'create' | null>(null);
    const [deleteBottomModalOpen, setDeleteBottomModalOpen] = useState(false);
    const insets = useSafeAreaInsets();

    const { openModal: openSaveItemModal, updateModalProps: updateSaveItemModalProps, closeModal: closeSaveItemModal } = useModal();

    // useEffect(() => {
    //     const listItemsNotCompleted = listData.listItems.filter((item: any) => !item.completed);
    //     const listItemsCompleted = listData.listItems.filter((item: any) => item.completed);
    //     setItemCompleted(listItemsCompleted);
    //     setItemsNotCompleted(listItemsNotCompleted);
    // }, [listData]);

    // const handleSaveListItem = async (value: string) => {
    //     console.log('1 handleSaveListItem', value);

    //     await saveListItem(`list-items/${listItemSelected.id}`, { content: value });
    //     console.log('2 handleSaveListItem', value);
    //     // setEditBottomModalOpen(false);
    //     setListItemSelected(null);
    //     console.log('3 handleSaveListItem', value);
    //     await getList();
    //     console.log('4 handleSaveListItem', value);
    // }

    // const handleSaveNewListItem = async (value: string) => {

    //     if (!value.trim()) {
    //         return;
    //     }

    //     const newListItem = {
    //         content: value,
    //         completed: false,
    //         order: listData.listItems.at(-1)?.order + 1 || 0,
    //         list_id: listData.id
    //     };

    //     try {
    //         const response = await saveListItem(`list-items`, newListItem);
    //         playerWrite.seekTo(0);
    //         playerWrite.play();
    //         // setSaveBottomModalMode(null);
    //         // setEditBottomModalOpen(false);
    //         await getList();
    //     } catch (error) {
    //         console.error('Error saving new list item:', error);
    //     }
    // }

    const handleToggleCompletedItem = async (listItemId: number, completed: boolean): Promise<any> => {
        const updatedData = await saveListItem(`list-items/${listItemId}`, { completed });
        if (completed) {
            playerCompleted.seekTo(0);
            playerCompleted.volume = 0.5;
            playerCompleted.play();
        }
        // await getList();

        return updatedData;
    };

    const handleEditItem = async (listItem: any) => {
        setListItemSelected(listItem);
        openSaveItemModal(
            'bottomSheet',
            (props) => (
                <ItemModal
                    {...props}
                    listData={listData}
                    item={listItem}
                    sheetHeight={280}
                    mode='edit'
                    defaultValue={listItem.content}
                />
            ),
            {
                sheetHeight: 280
            }
        );
        // setSaveBottomModalMode('edit');
        // setEditBottomModalOpen(true);
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
        // await getList();
    };

    return (
        <>
            <PageLayout onRefresh={getList} breadcrumbData={listData?.breadcrumb}>
                {!listData.itemsNotCompleted.length && !listData.itemsCompleted.length &&
                    <View className='flex-1 items-center justify-center'>
                        <Text text='list.no_items_found' className="mt-4 text-2xl text-base-content" />
                    </View>
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
                        )}
                    />
                )}
                {listData.itemsCompleted.length > 0 && (
                    <>
                        <View className='my-2 h-0.5 bg-base-content' />
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
            </PageLayout>
            {/* <View className='flex-1 px-4 gap-2'>
                <Breadcrumb breadcrumb={listData?.breadcrumb} />
                <CustomPullToRefreshOnRelease onRefresh={getList}>
                    <ScrollView contentContainerClassName='gap-4' contentContainerStyle={{ paddingBottom: insets.bottom + 10 }}>
                        {!listData.itemsNotCompleted.length && !listData.itemsCompleted.length &&
                            <View className='flex-1 items-center justify-center'>
                                <Text text='list.no_items_found' className="mt-4 text-2xl text-base-content" />
                            </View>
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
                                )}
                            />
                        )}
                        {listData.itemsCompleted.length > 0 && (
                            <>
                                <View className='my-2 h-0.5 bg-base-content' />
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
                    </ScrollView>
                </CustomPullToRefreshOnRelease>
            </View> */}

            <TouchableOpacity
                onPress={() => {
                    // setSaveBottomModalMode('create');
                    // setEditBottomModalOpen(true);
                    openSaveItemModal(
                        'bottomSheet',
                        (props) => (
                            <ItemModal
                                {...props}
                                listData={listData}
                                sheetHeight={280}
                                mode='create'
                                defaultValue=''
                            />
                        ),
                        {
                            sheetHeight: 280
                        }
                        //     isLoading: savingListItem,
                        //     onSave: async (value) => {
                        //         await handleSaveNewListItem(value);
                        //         closeSaveItemModal(id);
                        //     }
                        // }
                    );
                }}
                className='absolute right-4 p-4 bg-primary rounded-full shadow-lg'
                style={{ bottom: insets.bottom + 10 }}
            >
                <Plus size={35} className='text-primary-content' />
            </TouchableOpacity>

            {/* <BottomSheet
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
            </BottomSheet> */}

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

interface ItemModalProps extends ModalProps {
    mode: 'create' | 'edit',
    defaultValue: string,
    item?: any,
    listData: any
}
const ItemModal = ({ mode, defaultValue, item, listData, onClose }: ItemModalProps) => {
    const [inputValue, setNewListItemContent] = useState(defaultValue);
    const { request: saveListItem, loading: savingListItem } = useLazyApi<any>(`list-items`, 'POST');
    const playerWrite = useAudioPlayer(audioSourceWrite);

    const handleSaveListItem = async () => {
        await saveListItem(`list-items/${item.id}`, { content: inputValue });
    }

    const handleSaveNewListItem = async () => {

        if (!inputValue.trim()) {
            return;
        }

        const newListItem = {
            content: inputValue,
            completed: false,
            order: listData.listItems.at(-1)?.order + 1 || 0,
            list_id: listData.id
        };

        try {
            const response = await saveListItem(`list-items`, newListItem);
            playerWrite.seekTo(0);
            playerWrite.play();
        } catch (error) {
            console.error('Error saving new list item:', error);
        }
    }

    const handleSave = async () => {
        if (mode === 'create') {
            await handleSaveNewListItem();
        } else {
            await handleSaveListItem();
        }
        onClose();
    };

    return (
        <ScrollView className='flex flex-1 flex-col'>
            <Text
                text={mode === 'create' ? 'list.tasks.create_item' : 'list.tasks.edit_item'}
                className='text-base-content text-2xl font-bold'
            />
            <View className='h-0.5 bg-base-content/50 my-2' />
            <View className='flex flex-col gap-y-6'>
                <Input
                    label={mode === 'create' ? 'list.tasks.new_item_content' : 'list.tasks.item_content'}
                    value={inputValue}
                    onSubmitEditing={handleSave}
                    onChangeText={setNewListItemContent}
                />
                <Button
                    size='xl'
                    name={mode === 'create' ? 'create' : 'save'}
                    onPress={handleSave}
                    disabled={savingListItem || !inputValue.trim()}
                    isLoading={savingListItem}
                />
            </View>
        </ScrollView>
    )
}
