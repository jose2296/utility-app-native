
import React, { Ref, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { TextInput, TextInputProps, View } from "react-native";
import Animated, {
    interpolate,
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";

interface FloatingLabelInputProps extends TextInputProps {
    label: string;
    value: string;
    suffixIcon?: React.ReactNode;
    onChangeText: (text: string) => void;
    ref?: Ref<TextInput> | undefined
}

export const Input = ({
    label,
    value,
    onChangeText,
    placeholder,
    secureTextEntry,
    suffixIcon,
    ref,
    ...props
}: FloatingLabelInputProps) => {
    const [isFocused, setIsFocused] = useState(false);
    const {t} = useTranslation();
    const progress = useSharedValue(value ? 1 : 0);

    useEffect(() => {
        progress.value = withTiming((isFocused || value) ? 1 : 0, {
            duration: 200,
        });
    }, [isFocused, value]);

    const animatedLabelStyle = useAnimatedStyle(() => {
        // Ahora interpolamos directamente
        const top = interpolate(progress.value, [0, 1], [20, 0]);
        const fontSize = interpolate(progress.value, [0, 1], [16, 12]);
        const color = interpolateColor(
            progress.value,
            [0, 1],
            ["#9ca3af", "#6366f1"] // gris → indigo
        );

        return {
            position: "absolute",
            left: 0,
            top,
            fontSize,
            // color,
        };
    });

    return (
        <View className="relative pt-4 my-2 w-full">
            <Animated.Text
                style={animatedLabelStyle}
                className={`${isFocused || value ? "text-base-content" : "text-base-content/40"}`}
            >
                {t(label)}
            </Animated.Text>

            <TextInput
                {...props}
                ref={ref}
                placeholder={t(placeholder || '')}
                secureTextEntry={secureTextEntry}
                className={`pl-0 pr-10 border-b py-2 w-full text-base-content ${isFocused ? "border-base-content" : "border-base-content/40"}`}
                value={value}
                onChangeText={onChangeText}
                onFocus={(e) => {setIsFocused(true); props.onFocus?.(e)}}
                onBlur={(e) => {setIsFocused(false); props.onBlur?.(e)}}
            />
            {!!suffixIcon &&
                <View className='absolute right-2 bottom-3'>
                    {suffixIcon}
                </View>
            }
        </View>
    );
}
