import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Keyboard, KeyboardEvent, Pressable, View } from 'react-native';
import {
    Gesture,
    GestureDetector
} from 'react-native-gesture-handler';
import Animated, {
    runOnJS,
    SlideOutDown,
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const MAX_SHEET_HEIGHT = SCREEN_HEIGHT * 0.9;
const HANDLER_HEIGHT = 40;
const DEFAULT_HEIGHT = SCREEN_HEIGHT * 0.4;

type BottomSheetProps = {
    isOpen: boolean;
    onClose: () => void;
    sheetHeight?: number;
    children: React.ReactNode;
};

const BottomSheet = ({ isOpen, onClose, children, sheetHeight }: BottomSheetProps) => {
    const insets = useSafeAreaInsets();

    // Estado para controlar si el sheet se ha abierto alguna vez
    const [hasBeenOpened, setHasBeenOpened] = useState(isOpen);

    const measuredContentHeight = useRef(sheetHeight || DEFAULT_HEIGHT);
    const isFixedHeight = useRef(!!sheetHeight);

    const initialHeight = sheetHeight || DEFAULT_HEIGHT;

    const contentHeight = useSharedValue(initialHeight);
    const keyboardHeight = useSharedValue(0);
    const translateY = useSharedValue(SCREEN_HEIGHT);
    const backdropOpacity = useSharedValue(0);
    const startY = useSharedValue(0);

    useEffect(() => {
        if (sheetHeight) {
            isFixedHeight.current = true;
            measuredContentHeight.current = sheetHeight;
            contentHeight.value = withTiming(sheetHeight, { duration: 200 });
        } else {
            // Si se remueve sheetHeight, volver a modo dinámico
            isFixedHeight.current = false;
        }
    }, [sheetHeight]);

    useEffect(() => {
        if (!isOpen) return;

        const showSubscription = Keyboard.addListener('keyboardDidShow', (event: KeyboardEvent) => {
            keyboardHeight.value = withTiming(event.endCoordinates?.height || 0, { duration: 250 });
        });

        const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
            keyboardHeight.value = withTiming(0, { duration: 250 });
        });

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            setHasBeenOpened(true);
            translateY.value = withTiming(0, { duration: 250 });
            backdropOpacity.value = withTiming(1, { duration: 250 });
        } else {
            const currentHeight = contentHeight.value + HANDLER_HEIGHT + insets.bottom;
            translateY.value = withTiming(currentHeight, { duration: 250 });
            backdropOpacity.value = withTiming(0, { duration: 250 });
            keyboardHeight.value = 0;
        }
    }, [isOpen]);

    const handleContentLayout = (height: number) => {
        if (!isFixedHeight.current && height > 0) {
            const heightDiff = Math.abs(height - measuredContentHeight.current);

            // Actualizar si hay un cambio significativo (>5px)
            if (heightDiff > 5) {
                measuredContentHeight.current = height;
                // Animar solo si el sheet está abierto
                if (translateY.value === 0) {
                    contentHeight.value = withTiming(height, { duration: 200 });
                } else {
                    contentHeight.value = height;
                }
            }
        }
    };

    const panGesture = Gesture.Pan()
        .onStart(() => {
            startY.value = translateY.value;
        })
        .onUpdate((event) => {
            const totalHeight = contentHeight.value + HANDLER_HEIGHT + insets.bottom + keyboardHeight.value;
            const newY = startY.value + event.translationY;
            if (newY >= 0 && newY <= totalHeight) {
                translateY.value = newY;
            }
        })
        .onEnd(() => {
            const totalHeight = contentHeight.value + HANDLER_HEIGHT + insets.bottom + keyboardHeight.value;
            if (translateY.value > totalHeight * 0.4) {
                translateY.value = withTiming(totalHeight, { duration: 200 });
                backdropOpacity.value = withTiming(0, { duration: 200 });
                runOnJS(onClose)();
            } else {
                translateY.value = withTiming(0, { duration: 200 });
            }
        });

    const animatedStyle = useAnimatedStyle(() => {
        const totalHeight = Math.min(
            contentHeight.value + HANDLER_HEIGHT + insets.bottom + keyboardHeight.value,
            MAX_SHEET_HEIGHT
        );

        return {
            transform: [{ translateY: translateY.value }],
            height: totalHeight,
        };
    });

    const animatedBackdropStyle = useAnimatedStyle(() => ({
        opacity: backdropOpacity.value,
    }));

    // No renderizar nada hasta que se abra por primera vez
    if (!hasBeenOpened) {
        return null;
    }

    return (
        <>
            {/* Backdrop */}
            <Animated.View
                pointerEvents={isOpen ? 'auto' : 'none'}
                className="absolute top-0 left-0 right-0 bottom-0 bg-black/40 z-50"
                style={animatedBackdropStyle}
            >
                <Pressable
                    onPress={() => {
                        onClose();
                        Keyboard.dismiss();
                    }}
                    className="flex-1"
                />
            </Animated.View>

            {/* Sheet */}
            <Animated.View
                className="absolute left-0 right-0 bottom-0 rounded-t-2xl pt-1 z-50"
                style={[
                    {
                        zIndex: 50,
                    },
                    animatedStyle,
                ]}
                exiting={SlideOutDown}
            >
                <View className='bg-base-100 flex-1 rounded-t-2xl'>
                    {/* Handler de arrastre */}
                    <GestureDetector gesture={panGesture}>
                        <View className="w-full items-center justify-center pt-6 pb-3">
                            <View className="w-10 h-1.5 bg-neutral-content/20 rounded-full" />
                        </View>
                    </GestureDetector>

                    {/* Contenido */}
                    <View
                        className="mt-2 px-4 pt-2"
                        style={{ paddingBottom: insets.bottom }}
                        onLayout={(e) => {
                            runOnJS(handleContentLayout)(e.nativeEvent.layout.height);
                        }}
                    >
                        {children}
                    </View>
                </View>
            </Animated.View>
        </>
    );
};

export default BottomSheet;
