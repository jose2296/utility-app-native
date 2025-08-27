import { useState } from 'react';
import { LayoutChangeEvent } from "react-native";
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';

const AnimatedList = <T,>({ data, renderItem, getKey }: { data: T[], renderItem: (item: T, index: number) => React.ReactNode, getKey: (item: T) => string }) => {

    const [itemWidth, setItemWidth] = useState(0);
    const [itemHeight, setItemHeight] = useState(0);

    const calculateWidth = (event: LayoutChangeEvent) => {
        const containerWidth = event.nativeEvent.layout.width;
        const containerHeight = event.nativeEvent.layout.height;
        const itemWidth = containerWidth / 3;
        const itemHeight = containerHeight / 8;
        setItemWidth(itemWidth);
        setItemHeight(itemHeight);
    }

    return (
        // <View
        //     onLayout={(e) => calculateWidth(e)}
        //     className='flex'
        //     // style={{ flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'flex-start' }}
        // >
            <>
            {
                data.map((item, index) => (
                    <Animated.View
                        entering={FadeInDown.delay(index * 50).duration(500)}
                        exiting={FadeOutDown.duration(500)}
                        key={getKey(item)}
                        className={'flex'}
                        // style={{
                        //     width: itemWidth * item.size?.width,
                        //     height: itemHeight * item.size?.height
                        // }}
                    >
                        {renderItem(item, index)}
                    </Animated.View>
                ))
            }
            </>
        // </View>
    );
}

export default AnimatedList;
