import { X } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { Pressable, TouchableOpacity, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';
import Text from './Text';
import Button from './button';

type InformationModalProps = {
    isOpen: boolean;
    title: string;
    message: string;
    avoidTranslation?: boolean;
    messageTranslateData?: Record<string, string>;
    onClose: () => void;
    onSubmit: () => void;
    isLoading: boolean;
};

const InformationModal = ({ isOpen, title, message, avoidTranslation = false, messageTranslateData, onClose, onSubmit, isLoading }: InformationModalProps) => {
    const backdropOpacity = useSharedValue(0);

    useEffect(() => {
        if (isOpen) {
            backdropOpacity.value = withTiming(1, { duration: 250 });
        } else {
            backdropOpacity.value = withTiming(0, { duration: 250 });
        }
    }, [isOpen]);

    const animatedSheetStyle = useAnimatedStyle(() => ({
        opacity: backdropOpacity.value,
    }));

    const animatedBackdropStyle = useAnimatedStyle(() => ({
        opacity: backdropOpacity.value,
        zIndex: backdropOpacity.value === 0 ? -1 : 10,
    }));

    return (
        isOpen && (
            <View className='absolute left-0 right-0 bottom-0 top-0 w-full h-full flex flex-1 items-center justify-center'>
                {/* Backdrop */}
                <Animated.View
                    className="absolute top-0 left-0 right-0 bottom-0 bg-black/40"
                    style={animatedBackdropStyle}
                >
                    <Pressable onPress={() => onClose()} className="flex-1" />
                </Animated.View>

                {/* Sheet */}
                <Animated.View
                    className="bg-neutral rounded-xl p-4 gap-4 z-50 max-w-[90%] w-full"
                    style={animatedSheetStyle}
                >
                    <View className='flex flex-row gap-6 items-center justify-between'>
                        <Text text={title} className='text-base-content text-2xl font-bold' />
                        <TouchableOpacity onPress={onClose}>
                            <X size={24} className='text-base-content' />
                        </TouchableOpacity>
                    </View>
                    <View className='h-0.5 bg-base-content/50 my-2' />
                    <View>
                        <Text text={message} avoidTranslation={avoidTranslation} translateData={messageTranslateData} className='text-base-content text-xl text-center px-4 text' />
                    </View>
                    <View className='flex flex-row justify-end w-fit gap-2 mt-4'>
                        {/* <Button name="close" onPress={onClose} /> */}
                        <Button name="delete" onPress={onSubmit} isLoading={isLoading} />
                    </View>
                </Animated.View>
            </View>
        )
    );
};

export default InformationModal;
