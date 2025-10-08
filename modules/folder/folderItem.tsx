import { FolderDetailsData } from '@/models/folder';
import { ItemIcon } from '@/utils/dashboard';
import { useRouter } from 'expo-router';
import { Pencil, Pin, Trash2, UsersRound } from 'lucide-react-native';
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

const RightActions = ({ handleDeleteItem, handleEditItem, handlePinItem, item }: { handleDeleteItem: (listItem: FolderDetailsData['items'][number]) => void, handleEditItem: (listItem: FolderDetailsData['items'][number]) => void, handlePinItem: (listItem: FolderDetailsData['items'][number]) => void, item: FolderDetailsData['items'][number] }) => (
    <View className='flex flex-row items-center pl-4'>
        {item.isOwner &&
            <TouchableOpacity
                onPress={() => { handleEditItem(item); }}
                className='h-full rounded-l-xl bg-secondary flex items-center justify-center p-4 px-6'
            >
                <Pencil size={24} className='text-secondary-content' />
            </TouchableOpacity>
        }
        <TouchableOpacity
            onPress={() => { handlePinItem(item); }}
            className={`h-full bg-info flex items-center justify-center p-4 px-6 ${item.isOwner ? '' : 'rounded-xl'}`}
        >
            <Pin size={24} className='text-info-content' />
        </TouchableOpacity>
        {item.isOwner &&
            <TouchableOpacity
                onPress={() => { handleDeleteItem(item); }}
                className='h-full rounded-r-xl bg-error flex items-center justify-center p-4 px-6'
            >
                <Trash2 size={24} className='text-error-content' />
            </TouchableOpacity>
        }
    </View>
);

const FolderItem = ({ item, handleDeleteItem, handleEditItem, handlePinItem, handleSeeCollaborators, onLongPress }: { item: FolderDetailsData['items'][number], handleDeleteItem: (listItem: any) => void, handleEditItem: (listItem: any) => void, handlePinItem: (listItem: any) => void, handleSeeCollaborators: (listItem: any) => void, onLongPress: () => void }) => {
    const { ref: swipeableRef, reset } = useSwipeableControl();
    const router = useRouter();

    return (
        <CustomSwipeable
            ref={swipeableRef}
            rightActions={
                <RightActions
                    handleEditItem={() => { handleEditItem?.(item); reset(); }}
                    handleDeleteItem={() => { handleDeleteItem?.(item); reset(); }}
                    handlePinItem={() => { handlePinItem?.(item); reset(); }}
                    item={item}
                />
            }
        >
            <TouchableOpacity
                key={item.id}
                activeOpacity={0.8}
                className='flex flex-row items-center gap-4 p-4 py-6 bg-base-100  border-neutral-content rounded-2xl'
                onPress={() => router.push(item.href)}
                onLongPress={onLongPress}
            >
                <View className='min-w-fit text-base-content'>
                    <ItemIcon icon={item.icon} />
                </View>
                <View className='flex flex-row flex-1 items-center justify-between gap-2 pr-2'>
                    <Text avoidTranslation text={item.name} className='text-base-content text-2xl font-bold' />
                    {!item.isOwner && <TouchableOpacity hitSlop={20} onPress={() => { handleSeeCollaborators?.(item); reset(); }}><UsersRound size={20} className='text-base-content' /></TouchableOpacity>}
                </View>
            </TouchableOpacity>
        </CustomSwipeable>
    );
}

export default FolderItem;
