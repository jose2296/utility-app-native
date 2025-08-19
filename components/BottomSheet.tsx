// import React, { useEffect } from 'react';
// import { Dimensions, View } from 'react-native';
// import {
//     Gesture,
//     GestureDetector,
// } from 'react-native-gesture-handler';
// import Animated, {
//     runOnJS,
//     useAnimatedStyle,
//     useSharedValue,
//     withTiming,
// } from 'react-native-reanimated';

// const SCREEN_HEIGHT = Dimensions.get('window').height;
// const SHEET_HEIGHT = SCREEN_HEIGHT * 0.4;

// type BottomSheetProps = {
//     isOpen: boolean;
//     onClose: () => void;
//     children: React.ReactNode;
// };

// const BottomSheet = ({ isOpen, onClose, children }: BottomSheetProps) => {
//     const translateY = useSharedValue(SHEET_HEIGHT);
//     const startY = useSharedValue(0);

//     useEffect(() => {
//         if (isOpen) {
//             translateY.value = withTiming(0, { duration: 250 }); // no rebote, solo timing
//         } else {
//             translateY.value = withTiming(SHEET_HEIGHT, { duration: 250 });
//         }
//     }, [isOpen]);

//     const panGesture = Gesture.Pan()
//         .onStart(() => {
//             startY.value = translateY.value;
//         })
//         .onUpdate((event) => {
//             const newY = startY.value + event.translationY;
//             if (newY >= 0 && newY <= SHEET_HEIGHT) {
//                 translateY.value = newY;
//             }
//         })
//         .onEnd(() => {
//             if (translateY.value > SHEET_HEIGHT * 0.4) {
//                 translateY.value = withTiming(SHEET_HEIGHT, { duration: 200 });
//                 runOnJS(onClose)();
//             } else {
//                 translateY.value = withTiming(0, { duration: 200 });
//             }
//         });

//     const animatedStyle = useAnimatedStyle(() => ({
//         transform: [{ translateY: translateY.value }],
//     }));

//     return (
//         <Animated.View
//             className="absolute left-0 right-0 bottom-0 bg-neutral rounded-t-2xl"
//             style={[
//                 {
//                     height: SHEET_HEIGHT,
//                     zIndex: 50,
//                 },
//                 animatedStyle,
//             ]}
//         >
//             {/* Solo el handler activa el gesto */}
//             <GestureDetector gesture={panGesture}>
//                 <View className="w-full items-center justify-center py-6">
//                     <View className="w-10 h-1.5 bg-neutral-content rounded-full" />
//                 </View>
//             </GestureDetector>

//             <View className="flex-1 mt-2 px-4">
//                 {children}
//             </View>
//         </Animated.View>
//     );
// };

// export default BottomSheet;



import React, { useEffect } from 'react';
import { Dimensions, Keyboard, KeyboardEvent, Pressable, View } from 'react-native';
import {
    Gesture,
    GestureDetector,
} from 'react-native-gesture-handler';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.4;

type BottomSheetProps = {
    isOpen: boolean;
    onClose: () => void;
    sheetHeight?: number;
    children: React.ReactNode;
};

const BottomSheet = ({ isOpen, onClose, children, sheetHeight = SHEET_HEIGHT }: BottomSheetProps) => {
    const translateY = useSharedValue(sheetHeight);
    const height = useSharedValue(sheetHeight);
    const backdropOpacity = useSharedValue(0);
    const startY = useSharedValue(0);
    const insets = useSafeAreaInsets();

    useEffect(() => {
        if (!isOpen) return;
        const showSubscription = Keyboard.addListener('keyboardDidShow', handleKeyboardShow);
        const hideSubscription = Keyboard.addListener('keyboardDidHide', handleKeyboardHide);

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, [isOpen]);

    const handleKeyboardShow = (event: KeyboardEvent) => {
        height.value = withTiming(sheetHeight + event.endCoordinates?.height || 0, { duration: 250 });
    };

    const handleKeyboardHide = (event: KeyboardEvent) => {
        height.value = withTiming(sheetHeight, { duration: 250 });
    };

    useEffect(() => {
        if (isOpen) {
            translateY.value = withTiming(0, { duration: 250 });
            backdropOpacity.value = withTiming(1, { duration: 250 });
        } else {
            translateY.value = withTiming(sheetHeight, { duration: 250 });
            backdropOpacity.value = withTiming(0, { duration: 250 });
        }
    }, [isOpen]);

    const panGesture = Gesture.Pan()
        .onStart(() => {
            startY.value = translateY.value;
        })
        .onUpdate((event) => {
            const newY = startY.value + event.translationY;
            if (newY >= 0 && newY <= sheetHeight) {
                translateY.value = newY;
            }
        })
        .onEnd(() => {
            if (translateY.value > sheetHeight * 0.4) {
                translateY.value = withTiming(sheetHeight, { duration: 200 });
                backdropOpacity.value = withTiming(0, { duration: 200 });
                runOnJS(onClose)();
            } else {
                translateY.value = withTiming(0, { duration: 200 });
            }
        });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
        height: height.value,
    }));

    const animatedBackdropStyle = useAnimatedStyle(() => ({
        opacity: backdropOpacity.value,
        zIndex: backdropOpacity.value === 0 ? -1 : 10,
    }));

    return (
        <>
            {/* Backdrop */}
            <Animated.View
                className="absolute top-0 left-0 right-0 bottom-0 bg-black/40"
                style={animatedBackdropStyle}
            >
                <Pressable onPress={() => {
                    onClose()
                    Keyboard.dismiss()
                }} className="flex-1" />
            </Animated.View>

            {/* Sheet */}
            <Animated.View
                className="absolute left-0 right-0 bottom-0 rounded-t-2xl pt-1 bg-base-content/80"
                style={[
                    {
                        // height: sheetHeight + keyboardHeight,
                        zIndex: 50,
                    },
                    animatedStyle,
                ]}
            >
                <View className='bg-base-100 flex-1 rounded-t-2xl'>
                    {/* Solo el handler activa el gesto */}
                    <GestureDetector gesture={panGesture}>
                        <View className="w-full items-center justify-center pt-6 pb-3">
                            <View className="w-10 h-1.5 bg-neutral-content rounded-full" />
                        </View>
                    </GestureDetector>

                    <View className="flex-1 mt-2 px-4" style={{ paddingBottom: insets.bottom }} onLayout={(e) => {
                        // console.log(e.nativeEvent.layout.height);
                        // height.value = e.nativeEvent.layout.height;
                    }}>
                        {children}
                    </View>
                </View>
            </Animated.View>
        </>
    );
};

export default BottomSheet;
