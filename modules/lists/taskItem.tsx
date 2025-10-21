import { getAnalogous } from '@/services/utils';
import { useUserStore } from '@/store';
import { LinearGradient } from 'expo-linear-gradient';
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

interface TaskItemProps {
    item: any;
    handleEditItem: (listItem: any) => void;
    handleDeleteItem: (listItem: any) => void;
}

const RightActions = ({ handleEditItem, handleDeleteItem, item }: TaskItemProps) => {
    const storeColors = useUserStore(state => state.colors);
    const colorsEdit = [...getAnalogous(storeColors!['secondary-hex']!)] as any;
    const colorsDelete = [...getAnalogous(storeColors!['error-hex']!)] as any;

    return (
        <View className='flex flex-row items-center'>
            <TouchableOpacity
                onPress={() => { handleEditItem(item); }}
                className='h-full rounded-l-xl overflow-hidden flex items-center justify-center p-4 px-6'
            >
                <LinearGradient
                    colors={colorsEdit}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0
                    }}
                />
                <Pencil size={20} className='text-secondary-content' />
            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => { handleDeleteItem(item); }}
                className='h-full rounded-r-xl overflow-hidden flex items-center justify-center p-4 px-6'
            >
                <LinearGradient
                    colors={colorsDelete}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0
                    }}
                />
                <Trash2 size={20} className='text-error-content' />
            </TouchableOpacity>
        </View>
    );
};

interface LeftActionsProps {
    savingListItem: boolean;
    handleToggleCompletedItem: (listItemId: number, completed: boolean) => void;
    item: any;
}
const LeftActions = ({ savingListItem, handleToggleCompletedItem, item }: LeftActionsProps) => {
    const storeColors = useUserStore(state => state.colors);
    const colors = [...getAnalogous(item.completed ? storeColors!['warning-hex']! : storeColors!['success-hex']!)] as any;

    return (
        <View className='flex flex-row flex-1 items-center'>
            <TouchableOpacity
                onPress={() => { handleToggleCompletedItem(item.id, !item.completed); }}
                className={`h-full flex-1 rounded-xl relative overflow-hidden flex items-center justify-center p-4 px-6`}
            >
                <LinearGradient
                    colors={colors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0
                    }}
                />
                {savingListItem ? <Loader size={30} /> : item.completed ? <Undo size={30} className='text-warning-content' /> : <Check size={35} className='text-success-content' />}
            </TouchableOpacity>
        </View>
    );
};

const TaskItem = ({ item, savingListItem, handleToggleCompletedItem, handleEditItem, handleDeleteItem }: { item: any, savingListItem: boolean, handleToggleCompletedItem: (listItemId: number, completed: boolean) => Promise<any>, handleEditItem: (listItem: any) => void, handleDeleteItem: (listItem: any) => void }) => {
    const { ref: swipeableRef, closeRightActions, reset } = useSwipeableControl();

    if (item.id === 'empty') {
        return (
            <View className='px-4 flex-row gap-4 h-0.5 bg-base-content/50 my-1' />
        );
    }

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
                    handleEditItem={() => { handleEditItem(item); reset(); }}
                    handleDeleteItem={() => { handleDeleteItem(item); reset(); }}
                    item={item}
                />
            }
            onSwipeLeftComplete={() => { handleToggleCompletedItem(item.id, !item.completed).then(() => { reset(); }) }}
        >
            <View className='px-4 flex-row gap-4 items-center border-0 bg-base-100 border-base-content rounded-xl' key={item.id}>
                <Checkbox
                    size={24}
                    onChange={(checked) => handleToggleCompletedItem(item.id, checked)}
                    checked={item.completed}
                    className='flex-row gap-4 py-4 items-center'
                />
                <TouchableOpacity className='flex-1 h-full justify-center' onPress={() => { handleEditItem(item); reset(); }}>
                    <Text text={item.content} numberOfLines={1} avoidTranslation className={`text-base-content text-xl ${item.completed ? 'line-through' : ''}`} />
                </TouchableOpacity>
            </View>
        </CustomSwipeable>
    );
}

export default TaskItem;
