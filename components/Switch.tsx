import { useUserStore } from '@/store';
import React from 'react';
import {
    Pressable,
    StyleProp,
    StyleSheet,
    ViewStyle,
} from 'react-native';
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';
import Text from './Text';
interface SwitchProps {
    value: boolean;
    label?: string;
    avoidLabelTranslation?: boolean;
    onPress: () => void;
    style?: StyleProp<ViewStyle>;
    duration?: number;
}
const Switch = ({
    value,
    label,
    avoidLabelTranslation,
    onPress,
    style,
    duration = 400
}: SwitchProps) => {
    const height = useSharedValue(0);
    const width = useSharedValue(0);
    const { colors } = useUserStore();

    const trackAnimatedStyle = useAnimatedStyle(() => {
        // const color = interpolateColor(
        //     Number(value),
        //     [0, 1],
        //     [colors?.['base-300'], colors?.['base-200']]
        // );
        // const colorValue = withTiming(color, { duration });

        return {
            borderRadius: height.value / 2,
            borderColor: value ? colors?.['base-content'] : colors?.['neutral'],
            borderWidth: 2,
            backgroundColor: value ? colors?.['base-300'] : colors?.['base-200'],
        };
    });

    const thumbAnimatedStyle = useAnimatedStyle(() => {
        const moveValue = interpolate(
            Number(value),
            [0, 1],
            [0, width.value - height.value]
        );
        const translateValue = withTiming(moveValue, { duration });

        return {
            transform: [{ translateX: translateValue }],
            borderRadius: height.value / 2,
            backgroundColor: value ? colors?.['base-content'] : colors?.['neutral'],
        };
    });

    return (
        <Pressable onPress={onPress} className="flex flex-row items-center gap-4" >
            {label && <Text avoidTranslation={avoidLabelTranslation} text={label} className='text-base-content text-xl' />}
            <Animated.View
                onLayout={(e) => {
                    height.value = e.nativeEvent.layout.height;
                    width.value = e.nativeEvent.layout.width;
                }}
                style={[switchStyles.track, style, trackAnimatedStyle, { backgroundColor: 'var(--color-secondary)' }]}
            >
                <Animated.View
                    style={[switchStyles.thumb, thumbAnimatedStyle]}></Animated.View>
            </Animated.View>
        </Pressable>
    );
};

const switchStyles = StyleSheet.create({
    track: {
        alignItems: 'flex-start',
        width: 80,
        height: 40,
        padding: 5,
    },
    thumb: {
        height: '100%',
        aspectRatio: 1,
        backgroundColor: 'white',
    },
});

export default Switch;
