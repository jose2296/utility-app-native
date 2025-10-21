import BottomSheet from '@/components/BottomSheet';
import FixedButton, { FixedButtonSizeMap } from '@/components/FixedButton';
import Checkbox from '@/components/checkbox';
import DropDownModal from '@/components/dropdown/DropdownModal';
import ArrowDownWideNarrow from '@/components/svgs/ArrowDownWideNarrow';
import { sortByTasksListOptions } from '@/constants/list';
import { useLazyApi } from '@/hooks/use-api';
import { sortTasksListItemsBy } from '@/services/lists';
import { useAudioPlayer } from 'expo-audio';
import React, { useEffect, useState } from 'react';
import { Keyboard, TouchableOpacity, View } from "react-native";
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
    const [items, setItems] = useState<any[]>([]);
    // const [itemsNotCompleted, setItemsNotCompleted] = useState<any[]>([]);
    const { request: saveListItem, loading: savingListItem } = useLazyApi<any>(`list-items`, 'POST');
    const { request: deleteListItem, loading: deletingListItem } = useLazyApi<any>(`list-items`, 'DELETE');
    const playerCompleted = useAudioPlayer(audioSourceCompleted);
    const playerTrash = useAudioPlayer(audioSourceTrash);
    const [saveBottomModalMode, setSaveBottomModalMode] = useState<'edit' | 'create'>('create');
    const [saveItemModalOpen, setSaveItemModalOpen] = useState(false);
    const [deleteBottomModalOpen, setDeleteBottomModalOpen] = useState(false);
    const insets = useSafeAreaInsets();
    const [sortByModalOpen, setSortByModalOpen] = useState(false);
    const [sortByOption, setSortByOption] = useState<any>(sortByTasksListOptions[0]);

    // const { openModal: openSaveItemModal, updateModalProps: updateSaveItemModalProps, closeModal: closeSaveItemModal } = useModal();

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

    useEffect(() => {
        const listItemsNotCompleted = sortTasksListItemsBy(listData.itemsNotCompleted, sortByOption.value);
        const listItemsCompleted = sortTasksListItemsBy(listData.itemsCompleted, sortByOption.value);

        const emptyItem = (listItemsNotCompleted.length && listItemsCompleted.length
            ? [{ id: 'empty' }]
            : []);

        setItems([
            ...listItemsNotCompleted,
            ...emptyItem,
            ...listItemsCompleted
        ]);
    }, [sortByOption, listData]);

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
        // openSaveItemModal(
        //     'bottomSheet',
        //     (props) => (
        //         <ItemModal
        //             {...props}
        //             listData={listData}
        //             item={listItem}
        //             sheetHeight={400}
        //             mode='edit'
        //             defaultValue={listItem.content}
        //             toggleMatchItem={(itemId, completed) => handleToggleCompletedItem(itemId, completed)}

        //         />
        //     ),
        //     {
        //         sheetHeight: 400
        //     }
        // );

        setSaveBottomModalMode('edit');
        setSaveItemModalOpen(true);
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
            <PageLayout onRefresh={getList} breadcrumbData={listData?.breadcrumb}>
                {!listData.itemsNotCompleted.length && !listData.itemsCompleted.length &&
                    <View className='flex-1 items-center justify-center'>
                        <Text text='list.no_items_found' className="mt-4 text-2xl text-base-content" />
                    </View>
                }

                <AnimatedList<any>
                    data={items}
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
                {/*
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
                )} */}
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

            <FixedButton
                offsetTop={80}
                offsetRight={24}
                size='sm'
                type='secondary'
                icon={<ArrowDownWideNarrow size={FixedButtonSizeMap.sm - 20} />}
                onPress={() => {
                    setSortByModalOpen(true);
                }}
            />

            <FixedButton
                onPress={() => {
                    setSaveBottomModalMode('create');
                    setSaveItemModalOpen(true);
                }}
            />

            <DropDownModal
                isOpen={sortByModalOpen}
                onClose={() => setSortByModalOpen(false)}
                options={sortByTasksListOptions}
                value={sortByOption.value}
                onPress={(value) => {
                    setSortByOption(value);
                    setSortByModalOpen(false);
                }}
                text='sort_by'
            />

            <SaveItemModal
                isOpen={saveItemModalOpen}
                mode={saveBottomModalMode}
                item={listItemSelected}
                listData={listData}
                toggleMatchItem={handleToggleCompletedItem}
                onClose={() => { setSaveItemModalOpen(false); setListItemSelected(null); Keyboard.dismiss(); }}
                onGetList={async () => await getList()}
            />

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

interface ItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'create' | 'edit',
    item?: any,
    listData: any;
    toggleMatchItem: (item: number, completed: boolean) => void;
    onGetList: () => void
}
const SaveItemModal = ({ isOpen, mode, item, listData, toggleMatchItem, onClose, onGetList }: ItemModalProps) => {
    const [inputValue, setNewListItemContent] = useState(item?.content || '');
    const { request: saveListItem, loading: savingListItem } = useLazyApi<any>(`list-items`, 'POST');
    const playerWrite = useAudioPlayer(audioSourceWrite);

    useEffect(() => {
        setNewListItemContent(item?.content || '');
    }, [item]);

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
        setNewListItemContent('');
        onClose();
        onGetList();
    };

    const handleToggleMatchItem = async (item: any) => {
        await toggleMatchItem(item.id, !item.completed);
        onClose();
    };
    const matchItemsInList = listData.listItems.filter((_item: any) => _item.id !== item?.id && _item.content.trim().toLowerCase().includes(inputValue.trim().toLowerCase()));

    return (
        <BottomSheet
            isOpen={isOpen}
            onClose={onClose}
        // sheetHeight={sheetHeight}
        >
            <View className='flex flex-col relative'>
                <Text
                    text={mode === 'create' ? 'list.tasks.create_item' : 'list.tasks.edit_item'}
                    className='text-base-content text-2xl font-bold'
                />
                <View className='h-0.5 bg-base-content/50 my-2' />

                <View className='flex flex-col gap-y-4'>
                    <View className='flex flex-col gap-y-2'>
                        <Input
                            label={mode === 'create' ? 'list.tasks.new_item_content' : 'list.tasks.item_content'}
                            value={inputValue}
                            onSubmitEditing={handleSave}
                            onChangeText={setNewListItemContent}
                            multiline
                        />
                        {!!inputValue && matchItemsInList.length > 0 && (
                            <View className='gap-2 pb-2 '>
                                <Text text='list.tasks.match_items_in_list' className='text-base-content text-md font-bold' />
                                <ScrollView className='max-h-32'>
                                    <AnimatedList
                                        data={matchItemsInList}
                                        renderItem={(_item: any, index: number) => (
                                            <TouchableOpacity onPress={() => handleToggleMatchItem(_item)} className={`flex flex-row gap-4 py-3 items-center border-b border-base-content/40 ${index === matchItemsInList.length - 1 ? 'border-b-0' : ''}`}>
                                                <Checkbox
                                                    size={24}
                                                    onChange={() => handleToggleMatchItem(_item)}
                                                    checked={_item.completed}
                                                    className='flex-row gap-4 items-center'
                                                />
                                                <Text className='text-base-content text-lg' avoidTranslation text={_item.content} />
                                            </TouchableOpacity>
                                        )}
                                        getKey={(_item: any) => _item.id}
                                    />
                                </ScrollView>
                            </View>
                        )}
                    </View>
                    <Button
                        size='xl'
                        name={mode === 'create' ? 'create' : 'save'}
                        onPress={handleSave}
                        disabled={savingListItem || !inputValue.trim()}
                        isLoading={savingListItem}
                    />
                </View>
            </View>
        </BottomSheet>
    )
}
