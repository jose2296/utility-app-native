// import { RefreshCcw } from 'lucide-react-native';
// import React, { useCallback, useEffect, useRef, useState } from 'react';
// import {
//     View
// } from 'react-native';
// import { Gesture, GestureDetector, PanGesture, ScrollView } from 'react-native-gesture-handler';
// import Animated, {
//     Extrapolation,
//     interpolate,
//     runOnJS,
//     useAnimatedStyle,
//     useSharedValue,
//     withSpring
// } from 'react-native-reanimated';
// import Loader from './loader';

// const PULL_THRESHOLD = 30;
// const MAX_PULL_DISTANCE = 45;

// const CustomPullToRefreshOnRelease = ({
//     children,
//     onRefresh,
//     initialRefreshing
// }: {
//     children: React.ReactNode,
//     onRefresh: () => Promise<any>,
//     initialRefreshing?: boolean
// }) => {
//     const translateY = useSharedValue(0);
//     const isRefreshing = useSharedValue(false);
//     const [refreshing, setRefreshing] = useState(false);
//     const [isPulling, setIsPulling] = useState(false);
//     const [isReadyToRefresh, setIsReadyToRefresh] = useState(false);
//     const panRef = useRef<PanGesture>(null);
//     const scrollRef = useRef<ScrollView>(null);
//     const scrollY = useSharedValue(0);

//     useEffect(() => {
//         if (initialRefreshing) {
//             translateY.value = withSpring(PULL_THRESHOLD * 0.7, { damping: 15 });
//             runOnJS(setIsPulling)(true);
//             runOnJS(setIsReadyToRefresh)(true);
//             runOnJS(setRefreshing)(true);
//             isRefreshing.value = true;
//         } else {
//             translateY.value = withSpring(0, { damping: 15 });
//             runOnJS(setIsPulling)(false);
//             runOnJS(setIsReadyToRefresh)(false);
//             runOnJS(setRefreshing)(false);
//             isRefreshing.value = false;
//         }
//     }, [initialRefreshing]);

//     const handleRefresh = useCallback(async () => {
//         // console.log('🚀 Refresh activado al SOLTAR el dedo');
//         setRefreshing(true);
//         isRefreshing.value = true;

//         try {
//             await onRefresh();
//         } finally {
//             // console.log('🚀 Refresh finalizado');
//             setRefreshing(false);
//             isRefreshing.value = false;
//             setIsPulling(false);
//             setIsReadyToRefresh(false);
//             translateY.value = withSpring(0, { damping: 15 });
//         }
//     }, [onRefresh]);

//     const gesture = Gesture.Pan()
//         .withRef(panRef as any)
//         .simultaneousWithExternalGesture(scrollRef as any)
//         .shouldCancelWhenOutside(false)
//         .onBegin(() => {
//             // console.log('👆 Usuario comenzó a tocar');
//         })
//         .onUpdate((event) => {
//             if (refreshing || scrollY.value > 0) return; // 👈 solo hacer pull si está arriba del todo

//             if (event.translationY > 0) {
//                 const pullDistance = Math.min(event.translationY * 0.6, MAX_PULL_DISTANCE);
//                 translateY.value = pullDistance;

//                 const pulling = pullDistance > 10;
//                 const ready = pullDistance > PULL_THRESHOLD;

//                 if (pulling !== isPulling) {
//                     runOnJS(setIsPulling)(pulling);
//                 }
//                 if (ready !== isReadyToRefresh) {
//                     runOnJS(setIsReadyToRefresh)(ready);
//                 }

//                 // console.log(`📏 Pull distance: ${pullDistance.toFixed(0)}px, Ready: ${ready}`);
//             }
//         })
//         .onEnd(() => {
//             // console.log('🖐 Usuario SOLTÓ el dedo');

//             if (refreshing) return;

//             if (translateY.value > PULL_THRESHOLD) {
//                 // console.log('✅ Threshold alcanzado - Ejecutando refresh');
//                 translateY.value = withSpring(PULL_THRESHOLD * 0.7);
//                 runOnJS(handleRefresh)();
//             } else {
//                 // console.log('❌ Threshold NO alcanzado - Volviendo a posición normal');
//                 translateY.value = withSpring(0);
//                 runOnJS(setIsPulling)(false);
//                 runOnJS(setIsReadyToRefresh)(false);
//             }
//         })
//         .minDistance(15);

//     const loaderStyle = useAnimatedStyle(() => {
//         const opacity = interpolate(
//             translateY.value,
//             [0, PULL_THRESHOLD * 0.3, PULL_THRESHOLD],
//             [0, 1, 1],
//             Extrapolation.CLAMP
//         );

//         return {
//             opacity,
//             transform: [
//                 { translateY: translateY.value },
//                 { translateX: '-50%' }
//             ],
//         };
//     });
//     const rotateStyle = useAnimatedStyle(() => {
//         const rotation = interpolate(
//             translateY.value,
//             [0, PULL_THRESHOLD],
//             [0, 180],
//             Extrapolation.CLAMP
//         );

//         return {
//             transform: [
//                 { rotate: `${rotation}deg` }
//             ],
//         };
//     });

//     return (
//         <GestureDetector gesture={gesture}>
//             <Animated.View className='overflow-hidden flex-1'>
//                 <Animated.View style={[loaderStyle]} className='w-10 absolute top-0 left-1/2 z-50'>
//                     <View style={[
//                     ]}>
//                         <Animated.View style={rotateStyle} className='flex items-center justify-center bg-base-300 size-12  rounded-full'>
//                             {refreshing ? <Loader size={20} /> : <RefreshCcw className={`text-base-content ${isReadyToRefresh ? 'text-primary' : ''}`} size={20} />}
//                         </Animated.View>
//                     </View>
//                 </Animated.View>

//                 <ScrollView
//                     ref={scrollRef}
//                     onScroll={(event) => scrollY.value = event.nativeEvent.contentOffset.y}
//                     scrollEventThrottle={16}
//                     showsVerticalScrollIndicator={false}
//                     scrollEnabled={false}
//                     contentContainerStyle={{ paddingTop: 0 }}
//                     simultaneousHandlers={panRef}
//                     contentContainerClassName='flex-1'
//                 >
//                     {children}
//                 </ScrollView>
//             </Animated.View>
//         </GestureDetector>
//     );
// };

// export default CustomPullToRefreshOnRelease;


import { RefreshCcw } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    View
} from 'react-native';
import { Gesture, GestureDetector, PanGesture, ScrollView } from 'react-native-gesture-handler';
import Animated, {
    Extrapolation,
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated';
import Loader from './loader';

const PULL_THRESHOLD = 30;
const MAX_PULL_DISTANCE = 45;

interface CustomPullToRefreshOnReleaseProps {
    children: React.ReactNode;
    onRefresh: () => Promise<any>;
    initialRefreshing?: boolean;
    contentContainerStyle?: any;
    contentContainerClassName?: string;
    scrollViewProps?: any; // Props adicionales para el ScrollView
}

const CustomPullToRefreshOnRelease = ({
    children,
    onRefresh,
    initialRefreshing,
    contentContainerStyle,
    contentContainerClassName,
    scrollViewProps = {}
}: CustomPullToRefreshOnReleaseProps) => {
    const translateY = useSharedValue(0);
    const isRefreshing = useSharedValue(false);
    const [refreshing, setRefreshing] = useState(false);
    const [isPulling, setIsPulling] = useState(false);
    const [isReadyToRefresh, setIsReadyToRefresh] = useState(false);
    const panRef = useRef<PanGesture>(null);
    const scrollRef = useRef<ScrollView>(null);
    const scrollY = useSharedValue(0);

    useEffect(() => {
        if (initialRefreshing) {
            translateY.value = withSpring(PULL_THRESHOLD * 0.7, { damping: 15 });
            runOnJS(setIsPulling)(true);
            runOnJS(setIsReadyToRefresh)(true);
            runOnJS(setRefreshing)(true);
            isRefreshing.value = true;
        } else {
            translateY.value = withSpring(0, { damping: 15 });
            runOnJS(setIsPulling)(false);
            runOnJS(setIsReadyToRefresh)(false);
            runOnJS(setRefreshing)(false);
            isRefreshing.value = false;
        }
    }, [initialRefreshing]);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        isRefreshing.value = true;

        try {
            await onRefresh();
        } finally {
            setRefreshing(false);
            isRefreshing.value = false;
            setIsPulling(false);
            setIsReadyToRefresh(false);
            translateY.value = withSpring(0, { damping: 15 });
        }
    }, [onRefresh]);

    const gesture = Gesture.Pan()
        .withRef(panRef as any)
        .simultaneousWithExternalGesture(scrollRef as any)
        .shouldCancelWhenOutside(false)
        .onBegin(() => { })
        .onUpdate((event) => {
            if (refreshing || scrollY.value > 0) return;

            if (event.translationY > 0) {
                const pullDistance = Math.min(event.translationY * 0.6, MAX_PULL_DISTANCE);
                translateY.value = pullDistance;

                const pulling = pullDistance > 10;
                const ready = pullDistance > PULL_THRESHOLD;

                if (pulling !== isPulling) {
                    runOnJS(setIsPulling)(pulling);
                }
                if (ready !== isReadyToRefresh) {
                    runOnJS(setIsReadyToRefresh)(ready);
                }
            }
        })
        .onEnd(() => {
            if (refreshing) return;

            if (translateY.value > PULL_THRESHOLD) {
                translateY.value = withSpring(PULL_THRESHOLD * 0.7);
                runOnJS(handleRefresh)();
            } else {
                translateY.value = withSpring(0);
                runOnJS(setIsPulling)(false);
                runOnJS(setIsReadyToRefresh)(false);
            }
        })
        .minDistance(15);

    const loaderStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            translateY.value,
            [0, PULL_THRESHOLD * 0.3, PULL_THRESHOLD],
            [0, 1, 1],
            Extrapolation.CLAMP
        );

        return {
            opacity,
            transform: [
                { translateY: translateY.value },
                { translateX: '-50%' }
            ],
        };
    });

    const rotateStyle = useAnimatedStyle(() => {
        const rotation = interpolate(
            translateY.value,
            [0, PULL_THRESHOLD],
            [0, 180],
            Extrapolation.CLAMP
        );

        return {
            transform: [
                { rotate: `${rotation}deg` }
            ],
        };
    });

    return (
        <GestureDetector gesture={gesture}>
            <Animated.View className='overflow-hidden flex-1'>
                <Animated.View style={[loaderStyle]} className='w-10 absolute top-0 left-1/2 z-50'>
                    <View>
                        <Animated.View style={rotateStyle} className='flex items-center justify-center bg-base-300 size-12 rounded-full'>
                            {refreshing ? <Loader size={20} /> : <RefreshCcw className={`text-base-content ${isReadyToRefresh ? 'text-primary' : ''}`} size={20} />}
                        </Animated.View>
                    </View>
                </Animated.View>

                <ScrollView
                    ref={scrollRef}
                    onScroll={(event) => scrollY.value = event.nativeEvent.contentOffset.y}
                    scrollEventThrottle={16}
                    showsVerticalScrollIndicator={false}
                    scrollEnabled={true} // Habilitamos scroll por defecto
                    contentContainerStyle={{ paddingTop: 0, ...contentContainerStyle }}
                    contentContainerClassName={contentContainerClassName}
                    simultaneousHandlers={panRef}

                    {...scrollViewProps} // Props adicionales del ScrollView
                >
                    {children}
                </ScrollView>
            </Animated.View>
        </GestureDetector>
    );
};

export default CustomPullToRefreshOnRelease;
