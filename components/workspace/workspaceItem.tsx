import { useRouter } from 'expo-router';
import { Pin, Trash2 } from 'lucide-react-native';
import { cssInterop } from 'nativewind';
import React from 'react';
import { Pressable, TouchableOpacity, View } from "react-native";
import Text from '../Text';
import { CustomSwipeable, useSwipeableControl } from '../swipeable';

cssInterop(Trash2, {
    className: {
        target: "style", // map className->style
        nativeStyleToProp: {
            color: true
        },
    },
});
cssInterop(Pin, {
    className: {
        target: "style", // map className->style
        nativeStyleToProp: {
            color: true
        },
    },
});

const RightActions = ({ handleDeleteItem, handlePinItem, item }: { handleDeleteItem: (listItem: any) => void, handlePinItem: (listItem: any) => void, item: any }) => (
    <View className='flex flex-row items-center pl-4'>
        <TouchableOpacity
            onPress={() => { handlePinItem(item); }}
            className='h-full rounded-l-xl bg-info flex items-center justify-center p-4 px-6'
        >
            <Pin size={24} className='text-info-content' />
        </TouchableOpacity>
        <TouchableOpacity
            onPress={() => { handleDeleteItem(item); }}
            className='h-full rounded-r-xl bg-error flex items-center justify-center p-4 px-6'
        >
            <Trash2 size={24} className='text-error-content' />
        </TouchableOpacity>
    </View>
);

const WorkspaceItem = ({ item, handleDeleteItem, handlePinItem }: { item: any, handleDeleteItem: (listItem: any) => void, handlePinItem: (listItem: any) => void }) => {
    const { ref: swipeableRef, reset } = useSwipeableControl();
    const router = useRouter();

    return (
        <CustomSwipeable
            ref={swipeableRef}
            rightActions={
                <RightActions
                    handleDeleteItem={() => { handleDeleteItem(item); reset(); }}
                    handlePinItem={() => { handlePinItem(item); reset(); }}
                    item={item}
                />
            }
        >
            <Pressable
                key={item.id}
                className='flex flex-row items-center gap-4 p-4 py-6 bg-base-100 border border-neutral-content rounded-2xl'
                onPress={() => router.push(item.href)}
            >
                <View className='min-w-fit text-base-content size-8 rounded-full' style={{ backgroundColor: item.color }} />
                <Text avoidTranslation text={item.name} className='text-base-content text-2xl font-bold' />
            </Pressable>
        </CustomSwipeable>
    );
}

export default WorkspaceItem;
