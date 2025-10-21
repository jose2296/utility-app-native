import { ChevronDown } from 'lucide-react-native';
import { ReactNode, useEffect, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import Animated, {
    Extrapolate,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

interface AccordionItemProps {
    title: ReactNode;
    children: ReactNode;
    isExpanded: boolean;
    onToggle?: () => void;
}
const Accordion = ({ title, children, isExpanded, onToggle }: AccordionItemProps) => {
    const [expanded, setExpanded] = useState(isExpanded);
    const animation = useSharedValue(isExpanded ? 1 : 0);
    const [contentHeight, setContentHeight] = useState(0);

    useEffect(() => {
        animation.value = withTiming(expanded ? 1 : 0, {
            duration: 300,
        });
    }, [expanded]);

    useEffect(() => {
        setExpanded(isExpanded);
    }, [isExpanded]);

    const animatedStyle = useAnimatedStyle(() => {
        const height = interpolate(
            animation.value,
            [0, 1],
            [0, contentHeight],
            Extrapolate.CLAMP
        );

        return {
            height,
            opacity: animation.value,
        };
    });

    const arrowStyle = useAnimatedStyle(() => {
        const rotation = interpolate(animation.value, [0, 1], [0, 180]);

        return {
            transform: [{ rotate: `${rotation}deg` }],
        };
    });

    const handleToggle = () => {
        setExpanded(!expanded);
        onToggle?.();
    }

    return (
        <View className="overflow-hidden">
            {/* <TouchableOpacity
                className="flex-row justify-between items-center p-4"
                activeOpacity={0.7}
            > */}
            <View className="flex-row justify-between items-center">
                <View className='flex-1'>
                    {title}
                </View>
                <Animated.View style={arrowStyle} className='absolute right-4'>
                    <TouchableOpacity onPress={handleToggle} hitSlop={10}>
                        <ChevronDown size={24} className={`text-base-content`} />
                    </TouchableOpacity>
                </Animated.View>
            </View>
            {/* </TouchableOpacity> */}

            <Animated.View style={animatedStyle} className="overflow-hidden">
                <View
                    onLayout={(event) => {
                        const { height } = event.nativeEvent.layout;
                        setContentHeight(height);
                    }}
                    className="absolute w-full px-4 pb-4"
                >
                    {children}
                </View>
            </Animated.View>
        </View>
    );
};

// const Accordion = () => {
//   const [expandedIndex, setExpandedIndex] = useState(null);

//   const toggleItem = (index) => {
//     setExpandedIndex(expandedIndex === index ? null : index);
//   };

//   return (
//     <View className="flex-1 bg-gray-100 p-4">
//       <Text className="text-2xl font-bold mb-5 text-gray-800">
//         Accordion Demo
//       </Text>

//       <AccordionItem
//         title="¿Qué es React Native?"
//         isExpanded={expandedIndex === 0}
//         onToggle={() => toggleItem(0)}
//       >
//         <Text className="text-sm text-gray-600 leading-5">
//           React Native es un framework de desarrollo móvil que te permite crear
//           aplicaciones nativas usando React. Puedes desarrollar para iOS y
//           Android con una única base de código.
//         </Text>
//       </AccordionItem>

//       <AccordionItem
//         title="¿Qué es Reanimated?"
//         isExpanded={expandedIndex === 1}
//         onToggle={() => toggleItem(1)}
//       >
//         <Text className="text-sm text-gray-600 leading-5">
//           React Native Reanimated es una librería de animaciones potente que
//           permite crear animaciones fluidas y performantes ejecutándose en el
//           hilo nativo.
//         </Text>
//       </AccordionItem>

//       <AccordionItem
//         title="Ventajas del Accordion"
//         isExpanded={expandedIndex === 2}
//         onToggle={() => toggleItem(2)}
//       >
//         <Text className="text-sm text-gray-600 leading-5">
//           • Ahorra espacio en la pantalla{'\n'}
//           • Organiza el contenido de forma jerárquica{'\n'}
//           • Mejora la experiencia del usuario{'\n'}
//           • Facilita la navegación por información compleja
//         </Text>
//       </AccordionItem>
//     </View>
//   );
// };

export default Accordion;
