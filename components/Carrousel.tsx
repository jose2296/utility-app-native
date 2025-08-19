
import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import Animated, {
    Extrapolation,
    interpolate,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue
} from 'react-native-reanimated';

const Carousel = ({ data, itemWidthOffset = 0.9, renderItem, keyExtractor }: { data: any[], itemWidthOffset?: number, renderItem: (item: any, width: number) => React.ReactNode, keyExtractor: (item: any) => string }) => {
    const scrollX = useSharedValue(0);
    const [containerWidth, setContainerWidth] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    const ITEM_WIDTH = containerWidth * itemWidthOffset;  // Ancho del item (80% del ancho pantalla)
    const SPACER = (containerWidth * 0.1); // Para centrar el item en pantalla

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollX.value = event.contentOffset.x;
        },
    });

    // Agregar espaciadores para centrar el primer y último elemento
    const extendedData = [{ id: 'left-spacer' }, ...data, { id: 'right-spacer' }];

    useEffect(() => {
        // scrollX.value = 0;
        flatListRef.current?.scrollToOffset({ animated: true, offset: 0 });
    }, [data]);

    return (
        <Animated.FlatList
            ref={flatListRef}
            data={data}
            keyExtractor={keyExtractor}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={ITEM_WIDTH + SPACER}
            decelerationRate="normal"
            bounces={false}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            renderItem={({ item, index }) => (
                <RenderItem
                    item={item}
                    index={index}
                    scrollX={scrollX}
                    ITEM_WIDTH={ITEM_WIDTH}
                    SPACER={SPACER}
                    renderItem={renderItem}
                />
            )}
            onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
            contentContainerStyle={{ gap: SPACER, paddingHorizontal: SPACER / 2 }}
        />
    );
}

const RenderItem = ({ item, index, scrollX, ITEM_WIDTH, SPACER, renderItem }: { item: any, index: number, scrollX: any, ITEM_WIDTH: number, SPACER: number, renderItem: (item: any, width: number) => React.ReactNode }) => {
    if (!item) {
        // Espaciadores invisibles para centrar
        return <View style={{ width: SPACER }} />;
    }

    // Animación de escala
    const animatedStyle = useAnimatedStyle(() => {
        const position = index * ITEM_WIDTH;
        const diff = scrollX.value - position;
        const scale = interpolate(
            diff,
            [-ITEM_WIDTH, 0, ITEM_WIDTH],
            [0.8, 1, 0.8],
            Extrapolation.CLAMP
        );
        return {
            transform: [{ scale: 1 }]
        };
    });

    return (
        <Animated.View
            className="rounded-lg justify-start items-start"
            style={[
                {
                    width: ITEM_WIDTH,
                    height: '100%'
                },
                animatedStyle,
            ]}
        >
            {renderItem(item, ITEM_WIDTH)}
        </Animated.View>
    );
};

export default Carousel;
