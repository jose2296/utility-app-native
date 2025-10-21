import React, { useRef, useState } from 'react';
import Swipeable, { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import { SharedValue } from 'react-native-reanimated';

export interface SwActionProps {
    progress: SharedValue<number>;
    translation: SharedValue<number>;
    swipeableMethods: SwipeableMethods;
}
interface SwipeableProps {
    children: React.ReactNode;
    friction?: number;
    overshootRight?: boolean;
    overshootLeft?: boolean;
    onSwipeableOpen?: (direction: 'left' | 'right', swipeableRef: SwipeableMethods) => void;
    renderLeftActions?: (props: SwActionProps) => React.ReactNode;
    renderRightActions?: (props: SwActionProps) => React.ReactNode;
}
const SwipeableItem = ({ renderLeftActions, renderRightActions, children, friction = 2, overshootRight = false, overshootLeft = false, onSwipeableOpen }: SwipeableProps) => {
    const swipeableRef = useRef<SwipeableMethods>(null);

    return (
        <Swipeable
            ref={swipeableRef}
            renderLeftActions={(progress, translation, swipeableMethods) => renderLeftActions?.({ progress, translation, swipeableMethods })}
            renderRightActions={(progress, translation, swipeableMethods) => renderRightActions?.({ progress, translation, swipeableMethods })}
            onSwipeableOpen={(direction) => onSwipeableOpen?.(direction, swipeableRef.current!)}
            // leftThreshold={1}
            overshootRight={overshootRight}
            overshootLeft={overshootLeft}
            friction={friction}
        >
            {children}
        </Swipeable>
    );
}

export default SwipeableItem;




// import { Dimensions, View } from 'react-native';
// import { Gesture, GestureDetector } from 'react-native-gesture-handler';
// import Animated, {
//     runOnJS,
//     useAnimatedStyle,
//     useSharedValue,
//     withTiming
// } from 'react-native-reanimated';

// const SCREEN_WIDTH = Dimensions.get('window').width;
// const SWIPE_THRESHOLD = 80;
// const MAX_LEFT = 81;
// const MAX_RIGHT = -220;

// type Props = {
//     children: React.ReactNode;
//     leftAction?: React.ReactNode;
//     rightActions?: React.ReactNode;
//     onSwipeLeftComplete?: () => void;
// };

// export const CustomSwipeable: React.FC<Props> = ({
//     children,
//     leftAction,
//     rightActions,
//     onSwipeLeftComplete = () => { },
// }) => {
//     const translateX = useSharedValue(0);
//     const offsetX = useSharedValue(0);
//     const leftActionWidth = useSharedValue(0);
//     const contentOpacity = useSharedValue(1);

//     const pan = Gesture.Pan()
//         .onBegin(() => {
//             offsetX.value = translateX.value; // Guarda la posición actual
//         })
//         .onUpdate((event) => {
//             const nextX = offsetX.value + event.translationX;

//             if (nextX > 0 && !leftAction) return; // No permitir gesto a derecha si no hay acción izquierda
//             if (nextX < 0 && !rightActions) return; // No permitir gesto a izquierda si no hay acción derecha

//             // Limitar valores
//             translateX.value = Math.min(Math.max(nextX, MAX_RIGHT), MAX_LEFT);
//         })
//         .onEnd(() => {
//             if (translateX.value > SWIPE_THRESHOLD && leftAction) {
//                 // Acción completada a la derecha
//                 translateX.value = withTiming(SCREEN_WIDTH);
//                 leftActionWidth.value = withTiming(SCREEN_WIDTH);
//                 contentOpacity.value = withTiming(0);
//                 runOnJS(onSwipeLeftComplete)();
//             } else if (translateX.value < -SWIPE_THRESHOLD && rightActions) {
//                 // Mantener derecha abierta
//                 translateX.value = withTiming(MAX_RIGHT);
//             } else {
//                 // Volver a posición inicial
//                 translateX.value = withTiming(0);
//             }
//         });

//     const animatedContentStyle = useAnimatedStyle(() => ({
//         transform: [{ translateX: translateX.value }],
//         opacity: contentOpacity.value,
//         zIndex: 10,
//     }));

//     const leftActionStyle = useAnimatedStyle(() => ({
//         width: leftActionWidth.value > 0 ? leftActionWidth.value : translateX.value,
//         opacity: translateX.value > 0 ? 1 : 0,
//         zIndex: 0,
//     }));

//     const rightActionStyle = useAnimatedStyle(() => ({
//         opacity: translateX.value < 0 ? 1 : 0,
//         zIndex: 0,
//     }));

//     return (
//         <GestureDetector gesture={pan}>
//             <View style={{ width: '100%', overflow: 'hidden' }}>
//                 {leftAction && (
//                     <Animated.View
//                         style={[
//                             {
//                                 position: 'absolute',
//                                 left: 0,
//                                 top: 0,
//                                 bottom: 0,
//                                 justifyContent: 'center',
//                             },
//                             leftActionStyle,
//                         ]}
//                     >
//                         {leftAction}
//                     </Animated.View>
//                 )}

//                 {rightActions && (
//                     <Animated.View
//                         style={[
//                             {
//                                 position: 'absolute',
//                                 right: 0,
//                                 top: 0,
//                                 bottom: 0,
//                                 flexDirection: 'row',
//                                 alignItems: 'center',
//                             },
//                             rightActionStyle,
//                         ]}
//                     >
//                         {rightActions}
//                     </Animated.View>
//                 )}

//                 <Animated.View style={animatedContentStyle}>{children}</Animated.View>
//             </View>
//         </GestureDetector>
//     );
// };
import { forwardRef, useImperativeHandle } from 'react';
import { Dimensions, LayoutChangeEvent, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';

const SCREEN_WIDTH = Dimensions.get('window').width;

type SwipeableRef = {
    closeRightActions: () => void;
    reset: () => void;
    isRightRevealed: () => boolean;
    isLeftCompleted: () => boolean;
};

type Props = {
    children: React.ReactNode;
    leftAction?: React.ReactNode;
    rightActions?: React.ReactNode;
    onSwipeLeftComplete?: () => void;
    onSwipeRightReveal?: () => void;
};

export const CustomSwipeable = forwardRef<SwipeableRef, Props>(({
    children,
    leftAction,
    rightActions,
    onSwipeLeftComplete = () => { },
    onSwipeRightReveal = () => { },
}, ref) => {
    const translateX = useSharedValue(0);
    const offsetX = useSharedValue(0);
    const leftCompleted = useSharedValue(false);
    const rightRevealed = useSharedValue(false);
    const contentOpacity = useSharedValue(1);

    const leftActionWidth = useSharedValue(0);
    const rightActionWidth = useSharedValue(0);

    const [leftWidth, setLeftWidth] = useState(0);
    const [rightWidth, setRightWidth] = useState(0);
    const [containerWidth, setContainerWidth] = useState(0);

    // Umbrales dinámicos basados en el ancho de las acciones
    const LEFT_THRESHOLD = leftWidth * 0.7;
    const RIGHT_THRESHOLD = rightWidth * 0.3;

    const pan = Gesture.Pan()
        .onBegin(() => {
            offsetX.value = translateX.value;
        })
        .onUpdate((event) => {
            // No permitir gestos si ya se completó la acción izquierda
            if (leftCompleted.value) return;

            const nextX = offsetX.value + event.translationX;

            // Limitar movimiento según las acciones disponibles
            if (nextX > 0 && !leftAction) return;
            if (nextX < 0 && !rightActions) return;

            // Limitar el rango de movimiento
            const maxLeft = leftWidth || 0;
            const maxRight = rightWidth ? -rightWidth : 0;

            translateX.value = Math.min(Math.max(nextX, maxRight), maxLeft);
        })
        .onEnd(() => {
            // No procesar gestos si ya se completó la acción izquierda
            if (leftCompleted.value) return;

            // Lógica para la acción izquierda (expandir y completar)
            if (translateX.value > LEFT_THRESHOLD && leftAction) {
                leftCompleted.value = true;
                translateX.value = withTiming(containerWidth || SCREEN_WIDTH, { duration: 300 });
                contentOpacity.value = withTiming(0, { duration: 300 });
                runOnJS(onSwipeLeftComplete)();
            }
            // Lógica para las acciones derechas (mantener fijas)
            else if (translateX.value < -RIGHT_THRESHOLD && rightActions) {
                rightRevealed.value = true;
                translateX.value = withTiming(-rightWidth);
                contentOpacity.value = withTiming(0, { duration: 300 });

                runOnJS(onSwipeRightReveal)();
            }
            // Volver a la posición inicial
            else {
                translateX.value = withTiming(0);
                rightRevealed.value = false;
            }
        })
        // CLAVE: Configurar el gesto para que solo responda a movimientos horizontales
        .activeOffsetX([-15, 15])  // Solo activar con movimiento horizontal de al menos 15px
        .failOffsetY([-15, 15])    // Fallar si hay movimiento vertical de más de 15px
        .minDistance(15)           // Distancia mínima antes de activar
        // .simultaneousWithExternalGesture(true); // Permitir gestos simultáneos

    // Métodos expuestos al componente padre
    useImperativeHandle(ref, () => ({
        closeRightActions: () => {
            rightRevealed.value = false;
            translateX.value = withTiming(0);
        },
        reset: () => {
            leftCompleted.value = false;
            rightRevealed.value = false;
            translateX.value = withTiming(0);
            contentOpacity.value = withTiming(1);
        },
        isRightRevealed: () => rightRevealed.value,
        isLeftCompleted: () => leftCompleted.value,
    }));

    const animatedContentStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
        // opacity: contentOpacity.value,
        zIndex: 10,
    }));

    const leftActionStyle = useAnimatedStyle(() => {
        let width;

        if (leftCompleted.value && leftAction) {
            width = containerWidth || SCREEN_WIDTH;
        } else {
            width = leftWidth || 100;
        }

        const translateXAction = leftCompleted.value ? 0 : Math.min(translateX.value - width, 0);

        return {
            width: withTiming(width),
            opacity: translateX.value > 0 || leftCompleted.value ? 1 : 0,
            transform: [{ translateX: translateXAction }],
            zIndex: leftCompleted.value ? 15 : 5,
        };
    });

    const rightActionStyle = useAnimatedStyle(() => ({
        opacity: translateX.value < 0 ? 1 : 0,
        zIndex: 5,
    }));

    const onContainerLayout = (event: LayoutChangeEvent) => {
        const w = event.nativeEvent.layout.width;
        setContainerWidth(w);
    };

    const onLeftLayout = (event: LayoutChangeEvent) => {
        const w = event.nativeEvent.layout.width;
        setLeftWidth(w);
        leftActionWidth.value = w;
    };

    const onRightLayout = (event: LayoutChangeEvent) => {
        const w = event.nativeEvent.layout.width;
        setRightWidth(w);
        rightActionWidth.value = w;
    };

    return (
        <GestureDetector gesture={pan}>
            <View
                style={{ width: '100%', overflow: 'hidden' }}
                className='bg-base-300 rounded-xl'
                onLayout={onContainerLayout}
            >
                {/* Acciones derechas */}
                {rightActions && (
                    <Animated.View
                        onLayout={onRightLayout}
                        style={[
                            {
                                position: 'absolute',
                                right: 0,
                                top: 0,
                                bottom: 0,
                                flexDirection: 'row',
                                alignItems: 'stretch',
                            },
                            rightActionStyle,
                        ]}
                    >
                        {rightActions}
                    </Animated.View>
                )}

                {/* Acción izquierda */}
                {leftAction && (
                    <Animated.View
                        onLayout={onLeftLayout}
                        style={[
                            {
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                bottom: 0,
                                justifyContent: 'center',
                                alignItems: 'stretch',
                                overflow: 'hidden',
                            },
                            leftActionStyle,
                        ]}
                    >
                        {React.isValidElement(leftAction)
                            ? React.cloneElement(leftAction as React.ReactElement<any>, {
                                animatedWidth: translateX,
                                isCompleting: leftCompleted,
                                containerWidth: containerWidth || SCREEN_WIDTH
                            })
                            : leftAction
                        }
                    </Animated.View>
                )}

                {/* Contenido principal */}
                <Animated.View style={animatedContentStyle}>
                    {children}
                </Animated.View>
            </View>
        </GestureDetector>
    );
});

// Hook personalizado para usar con el ref
export const useSwipeableControl = () => {
    const ref = React.useRef<SwipeableRef>(null);

    const closeRightActions = () => {
        ref.current?.closeRightActions();
    };

    const reset = () => {
        ref.current?.reset();
    };

    const isRightRevealed = () => {
        return ref.current?.isRightRevealed() || false;
    };

    const isLeftCompleted = () => {
        return ref.current?.isLeftCompleted() || false;
    };

    return {
        ref,
        closeRightActions,
        reset,
        isRightRevealed,
        isLeftCompleted
    };
};
