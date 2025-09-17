import GridDomComponent from '@/components/gridDomComponent';
import { PositionedItem } from '@/components/MasonryGrid';
import Text from '@/components/Text';
import { ParsedDashboardItem } from '@/models/me';
import { getAnalogous, getContrastColor } from '@/services/utils';
import { ItemIcon } from '@/utils/dashboard';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { LayoutChangeEvent, View } from 'react-native';

export default function DashboardScreen() {

    const [itemWidth, setItemWidth] = useState(0);
    const [itemHeight, setItemHeight] = useState(0);
    const [containerWidth, setContainerWidth] = useState(0);
    const [containerHeight, setContainerHeight] = useState(0);

    const calculateWidth = (event: LayoutChangeEvent) => {
        const containerWidth = event.nativeEvent.layout.width;
        const containerHeight = event.nativeEvent.layout.height;
        const itemWidth = containerWidth / 3;
        const itemHeight = containerHeight / 8;
        setContainerWidth(containerWidth);
        setContainerHeight(containerHeight);
        setItemWidth(itemWidth);
        setItemHeight(itemHeight);
    }

    return (
        <View className='flex flex-1 bg-red-50' onLayout={calculateWidth}>
            <GridDomComponent
                itemHeight={itemHeight}
                containerHeight={containerHeight}
                containerWidth={containerWidth}

                dom={{
                    scrollEnabled: true
                }}
            />
        </View>
    );
}


const DashboardItem = ({ item }: { item: PositionedItem<ParsedDashboardItem> }) => {
    const textColor = getContrastColor(item.entity?.workspace?.color!);
    const colors = [...getAnalogous(item.entity?.workspace?.color!)] as any;
    return (
        <View
            key={item.id}
            className={`relative overflow-hidden flex flex-1 flex-row gap-4 p-4 py-6 rounded-2xl h-full items-center justify-center`}
            style={{
                // backgroundColor: item.entity?.workspace?.color
            }}
        // onPress={() => router.push(item.href)}
        >
            <LinearGradient
                // colors={[item.entity?.workspace?.color!, item.entity?.workspace?.color! + 'aa', item.entity?.workspace?.color! + 'ff']}
                // colors={[item.entity?.workspace?.color!, item.entity?.workspace?.color!]}
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
            <View className={`flex-row gap-4 flex-1 items-center justify-center ${item.size.width === 1 ? 'flex-col items-center justify-center' : ''}`}>

                {item.icon &&
                    <ItemIcon icon={item.icon} stroke={textColor.color} className='flex-0 ' />
                }
                {/* <View className='flex flex-col gap-2 size-6 rounded-full' style={{ backgroundColor: item.entity.workspace.color }}></View> */}
                {/* <Text avoidTranslation text={item.size?.width.toString() + ' x ' + item.size?.height.toString()} style={{ color: textColor }} className='text-base-content text-xl font-bold' /> */}
                <View className='flex flex-initial justify-center '>
                    <Text
                        numberOfLines={item.size.height === 1 ? 1 : 4}
                        avoidTranslation
                        text={item.entity?.name || item.entity.title || ''}
                        className={`${textColor.className} font-bold ${item.size.width === 1 ? 'text-center text-xl' : 'text-2xl items-center justify-center '}`}
                    />
                </View>

            </View>
        </View>
    )
}
