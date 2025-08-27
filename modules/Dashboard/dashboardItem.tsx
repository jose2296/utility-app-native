import { DashboardItem as DashboardItemType } from '@/models/me';
import { ItemIcon } from '@/utils/dashboard';
import { useRouter } from 'expo-router';
import { Trash2 } from 'lucide-react-native';
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

const RightActions = ({ handleDeleteItem, item }: { handleDeleteItem: (listItem: any) => void, item: any }) => (
    <View className='flex flex-row items-center pl-4'>
        <TouchableOpacity
            onPress={() => { handleDeleteItem(item); }}
            className='h-full rounded-xl bg-error flex items-center justify-center p-4 px-6'
        >
            <Trash2 size={24} className='text-error-content' />
        </TouchableOpacity>
    </View>
);

const DashboardItem = ({ item, handleDeleteItem }: { item: DashboardItemType, handleDeleteItem?: (listItem: DashboardItemType) => void }) => {
    const { ref: swipeableRef, closeRightActions, reset } = useSwipeableControl();
    const router = useRouter();

    return (
        <CustomSwipeable
            ref={swipeableRef}
            rightActions={
                <RightActions
                    handleDeleteItem={() => { handleDeleteItem?.(item); reset(); }}
                    item={item}
                />
            }

        >
            <View
                key={item.id}
                className='flex flex-row gap-4 p-4 py-6 bg-base-100 border border-neutral-content rounded-2xl h-full'
                style={{
                    borderColor: item.entity.workspace.color
                }}
                // onPress={() => router.push(item.href)}

            >
                <ItemIcon icon={item.icon} stroke={item.entity.workspace.color} />
                {/* <View className='flex flex-col gap-2 size-6 rounded-full' style={{ backgroundColor: item.entity.workspace.color }}></View> */}
                <Text avoidTranslation text={item.size?.width.toString() + ' x ' + item.size?.height.toString()} style={{ color: item.entity.workspace.color }} className='text-base-content text-xl font-bold' />
            </View>
        </CustomSwipeable>
    );
}

export default DashboardItem;
