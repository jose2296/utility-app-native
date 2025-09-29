import { getAnalogous } from '@/services/utils';
import { useUserStore } from '@/store';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeOutRight, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Text from './Text';

const FixedButton = ({ onPress, options }: { onPress: (value?: string) => void, options?: { text: string, value: string }[] }) => {
    const [showOptions, setShowOptions] = useState(false);
    const insets = useSafeAreaInsets();
    const storeColors = useUserStore(state => state.colors);
    const colors = [...getAnalogous(storeColors!['primary-hex']!)] as any;

    const styleAnimated = useAnimatedStyle(() => {

        const rotate = withTiming(showOptions ? '45deg' : '0deg');
        return {
            transform: [{ rotate: rotate }]
        };
    });

    return (
        <>
            <TouchableOpacity
                onPress={!!options?.length ? () => setShowOptions(!showOptions) : () => onPress()}
                className='absolute right-4 p-4 overflow-hidden rounded-full shadow-lg z-40'
                style={{ bottom: insets.bottom + 10 }}
            >
                <LinearGradient
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
                <Animated.View style={[styleAnimated]}>
                    <Plus size={35} className='text-primary-content' />
                </Animated.View>
                {/* {showOptions ? <X size={35} className='text-primary-content' /> : <Plus size={35} className='text-primary-content' />} */}
            </TouchableOpacity>

            {options?.length && showOptions &&
                <>

                    <Pressable
                        onPress={() => setShowOptions(false)}
                        className='absolute top-0 left-0 bg-black/40 w-full h-full z-30'
                    />
                </>
            }
            {options?.length &&
                <View className='absolute right-4 z-40'
                    style={{ bottom: insets.bottom + 85 }}
                >
                    {showOptions && options?.map((option, index) => (
                        <Animated.View
                            // entering={SlideInDown.delay(index * 50).duration(500)}
                            // exiting={SlideOutDown.duration(500)}
                            entering={FadeInDown.delay(index * 50).duration(500)}
                            exiting={FadeOutRight.duration(200)}
                            key={index}
                            className='absolute right-4 overflow-hidden rounded-xl shadow-lg z-50'
                            style={{ bottom: (index * 62) }}
                        >
                            <LinearGradient
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
                            <TouchableOpacity
                                className='p-4'
                                activeOpacity={0.5}
                                onPress={() => {
                                    onPress(option.value);
                                    setShowOptions(false);
                                }}
                            >
                                <Text text={option.text} className='text-secondary-content text-lg' />
                            </TouchableOpacity>
                        </Animated.View>
                    ))}
                </View>
            }
        </>
    );
}

export default FixedButton;
