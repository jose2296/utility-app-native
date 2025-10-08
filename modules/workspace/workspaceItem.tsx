import { GradientBall } from '@/app/(app)/_layout';
import { useRouter } from 'expo-router';
import { Pencil, Pin, Trash2 } from 'lucide-react-native';
import { cssInterop } from 'nativewind';
import React from 'react';
import { TouchableOpacity, View } from "react-native";
import Text from '../../components/Text';
import { CustomSwipeable, useSwipeableControl } from '../../components/swipeable';

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

const RightActions = ({ handleDeleteItem, handleEditItem, item }: { handleDeleteItem: (listItem: any) => void, handleEditItem: (listItem: any) => void, item: any }) => (
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

const WorkspaceItem = ({ item, handleDeleteItem, handleEditItem }: { item: any, handleDeleteItem: (listItem: any) => void, handleEditItem: (listItem: any) => void }) => {
    const { ref: swipeableRef, reset } = useSwipeableControl();
    const router = useRouter();

    return (
        <CustomSwipeable
            ref={swipeableRef}
            rightActions={
                <RightActions
                    handleEditItem={() => { handleEditItem(item); reset(); }}
                    handleDeleteItem={() => { handleDeleteItem(item); reset(); }}
                    item={item}
                />
            }
        >
            <TouchableOpacity
                activeOpacity={0.8}
                key={item.id}
                className='flex flex-row items-center gap-4 p-4 py-6 bg-base-100  border-neutral-content rounded-2xl'
                onPress={() => router.push(item.href)}
                // TODO: Tooltip on long press
                onLongPress={() => null}
            >
                <GradientBall color={item.color} className='size-8 ' />
                <Text avoidTranslation text={item.name} numberOfLines={1} className='text-base-content text-2xl flex-1 font-bold' />
            </TouchableOpacity>
        </CustomSwipeable>
    );
}

export default WorkspaceItem;
