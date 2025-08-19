import { FolderDetailsData } from '@/models/folder';
import { ItemIcon } from '@/utils/dashboard';
import { useRouter } from 'expo-router';
import { Pin, Trash2 } from 'lucide-react-native';
import { cssInterop } from 'nativewind';
import React from 'react';
import { TouchableOpacity, View } from "react-native";
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

const RightActions = ({ handleDeleteItem, handlePinItem, item }: { handleDeleteItem: (listItem: FolderDetailsData['items'][number]) => void, handlePinItem: (listItem: FolderDetailsData['items'][number]) => void, item: FolderDetailsData['items'][number] }) => (
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

const FolderItem = ({ item, handleDeleteItem, handlePinItem, onLongPress }: { item: FolderDetailsData['items'][number], handleDeleteItem: (listItem: any) => void, handlePinItem: (listItem: any) => void, onLongPress: () => void }) => {
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
            <TouchableOpacity
                key={item.id}
                activeOpacity={0.8}
                className='flex flex-row items-center gap-4 p-4 py-6 bg-base-100 border border-neutral-content rounded-2xl'
                onPress={() => router.push(item.href)}
                onLongPress={onLongPress}
            >
                <View className='min-w-fit text-base-content'>
                    <ItemIcon icon={item.icon} />
                </View>
                <Text avoidTranslation text={item.name} className='text-base-content text-2xl font-bold' />
            </TouchableOpacity>
        </CustomSwipeable>
    );
}

export default FolderItem;
