import React, { useEffect, useState } from 'react';
import { Pressable } from "react-native";
import Animated, {
    useAnimatedProps,
    useAnimatedStyle, useSharedValue,
    withTiming
} from 'react-native-reanimated';
import { Path, Svg } from 'react-native-svg';

const AnimatedPath = Animated.createAnimatedComponent(Path);

type CheckboxProps = {
    size?: number;
    onChange?: (checked: boolean) => void;
    children?: React.ReactNode;
    className?: string;
    checked?: boolean;
};

const Checkbox = ({ size = 24, onChange, children, checked = false, className }: CheckboxProps) => {
    const [_checked, setChecked] = useState(checked);
    const scale = useSharedValue(1);
    const dashOffset = useSharedValue(24);

    useEffect(() => {
        scale.value = withTiming(0.9, { duration: 100 }, () => {
            scale.value = withTiming(1, { duration: 100 });
        });

        dashOffset.value = withTiming(_checked ? 0 : 24, { duration: 250 });
    }, [_checked]);

    const toggle = () => {
        const newValue = !_checked;
        setChecked(newValue);
        onChange?.(newValue);
    };

    const animatedBoxStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        width: size,
        height: size,
    }));

    const animatedProps = useAnimatedProps(() => ({
        strokeDashoffset: dashOffset.value,
    }));

    return (
        <Pressable onPress={toggle} className={`${className}`}>
            <Animated.View
                style={animatedBoxStyle}
                className={`border-2 rounded-md items-center justify-center ${_checked ? 'bg-primary border-primary' : 'bg-transparent border-base-content'}`}
            >
                <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                    <AnimatedPath
                        d="M5 13l4 4L19 7"
                        stroke="white"
                        strokeWidth={3}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray="24"
                        animatedProps={animatedProps}
                    />
                </Svg>
            </Animated.View>
            {children}
        </Pressable>
    );
}

export default Checkbox;
