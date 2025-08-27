import { Check, Pencil, Trash2, Undo } from 'lucide-react-native';
import { cssInterop } from 'nativewind';
import React from 'react';
import { TouchableOpacity, View } from "react-native";
import Text from '../../components/Text';
import Checkbox from '../../components/checkbox';
import Loader from '../../components/loader';
import { CustomSwipeable, useSwipeableControl } from '../../components/swipeable';

cssInterop(Pencil, {
    className: {
        target: "style", // map className->style
        nativeStyleToProp: {
            color: true
        },
    },
});
cssInterop(Trash2, {
    className: {
        target: "style", // map className->style
        nativeStyleToProp: {
            color: true
        },
    },
});

const RightActions = ({ handleEditItem, handleDeleteItem, item }: { handleEditItem: (listItem: any) => void, handleDeleteItem: (listItem: any) => void, item: any }) => (
    <View className='flex flex-row items-center pl-4'>
        <TouchableOpacity
            onPress={() => { handleEditItem(item); }}
            className='h-full rounded-l-xl bg-secondary flex items-center justify-center p-4 px-6'
        >
            <Pencil size={24} className='text-secondary-content' />
        </TouchableOpacity>
        <TouchableOpacity
            onPress={() => { handleDeleteItem(item); }}
            className='h-full rounded-r-xl bg-error flex items-center justify-center p-4 px-6'
        >
            <Trash2 size={24} className='text-error-content' />
        </TouchableOpacity>
    </View>
);

const LeftActions = ({ savingListItem, handleToggleCompletedItem, item }: { savingListItem: boolean, handleToggleCompletedItem: (listItemId: number, completed: boolean) => void, item: any }) => {
    return (
        <View className='flex flex-row flex-1 items-center pr-4'>
            <TouchableOpacity
                onPress={() => { handleToggleCompletedItem(item.id, !item.completed); }}
                className={`h-full flex-1 rounded-xl flex ${item.completed ? 'bg-warning' : 'bg-success'} items-center justify-center p-4 px-6`}
            >
                {savingListItem ? <Loader size={35} /> : item.completed ? <Undo size={35} className='text-warning-content' /> : <Check size={35} className='text-success-content' />}
            </TouchableOpacity>
        </View>
    );
};

const TaskItem = ({ item, savingListItem, handleToggleCompletedItem, handleEditItem, handleDeleteItem }: { item: any, savingListItem: boolean, handleToggleCompletedItem: (listItemId: number, completed: boolean) => Promise<any>, handleEditItem: (listItem: any) => void, handleDeleteItem: (listItem: any) => void }) => {
    const { ref: swipeableRef, closeRightActions, reset } = useSwipeableControl();

    return (
        <CustomSwipeable
            ref={swipeableRef}
            leftAction={
                <LeftActions
                    savingListItem={savingListItem}
                    handleToggleCompletedItem={handleToggleCompletedItem}
                    item={item}
                />}
            rightActions={
                <RightActions
                    handleEditItem={() => {handleEditItem(item); reset(); }}
                    handleDeleteItem={() => {handleDeleteItem(item); reset(); }}
                    item={item}
                />
            }
            onSwipeLeftComplete={() => { handleToggleCompletedItem(item.id, !item.completed).then(() => { reset(); })}}
        >
            <View className='px-4 flex-row gap-4 items-center border bg-base-100 border-base-content rounded-xl' key={item.id}>
                <Checkbox
                    size={24}
                    onChange={(checked) => handleToggleCompletedItem(item.id, checked)}
                    checked={item.completed}
                    className='flex-row gap-4 py-6 items-center'
                />
                <TouchableOpacity className='flex-1 justify-center' onPress={() => { handleEditItem(item); reset(); }}>
                    <Text text={item.content} numberOfLines={1} avoidTranslation className={`text-base-content text-xl ${item.completed ? 'line-through' : ''}`} />
                </TouchableOpacity>
            </View>
        </CustomSwipeable>
    );
}

export default TaskItem;
