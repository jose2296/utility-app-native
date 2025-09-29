import InformationModal from '@/components/InformationModal';
import Loader from '@/components/loader';
import MasonryGrid, { PositionedItem } from '@/components/MasonryGrid';
import CustomPullToRefreshOnRelease from '@/components/pullToRefresh';
import Text from '@/components/Text';
import { useLazyApi } from '@/hooks/use-api';
import { ParsedDashboardItem } from '@/models/me';
import { getAnalogous, getContrastColor } from '@/services/utils';
import { useUserStore } from '@/store';
import { ItemIcon, parseDashboardItem } from '@/utils/dashboard';
import { useAudioPlayer } from 'expo-audio';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useNavigation, useRouter } from 'expo-router';
import { Pencil, Save, Trash2 } from 'lucide-react-native';
import { cssInterop } from 'nativewind';
import React, { useCallback, useEffect, useState } from 'react';
import { Platform, Pressable, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const audioSourceTrash = require('../../assets/sounds/trash.mp3');

cssInterop(Pencil, {
    className: {
        target: "style", // map className->style
        nativeStyleToProp: {
            color: true
        },
    },
});
cssInterop(Trash2, {
    className: {
        target: "style", // map className->style
        nativeStyleToProp: {
            color: true
        },
    },
});
export default function DashboardScreen() {
    const { data, setData, colors } = useUserStore();
    const [deleteBottomModalOpen, setDeleteBottomModalOpen] = useState(false);
    const [enableEditingGrid, setEnableEditingGrid] = useState(false);
    const [dashboardItems, setDashboardItems] = useState<ParsedDashboardItem[]>([]);
    const [contentWidth, setContentWidth] = useState(0);
    const [contentHeight, setContentHeight] = useState(0);
    const [listItemSelected, setListItemSelected] = useState<any>(null);
    const playerTrash = useAudioPlayer(audioSourceTrash);
    const { request: deleteDashboardListItem, loading: deletingDashboardListItem } = useLazyApi<any>(`dashboard`, 'DELETE');
    const { request: updateDashboardListItem, loading: updatingDashboardListItem } = useLazyApi<any>(`dashboard`, 'PUT');
    const { data: meData, request: getMeData, loading: loadingMeData } = useLazyApi('me');
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const saveGridButtonColors = [...getAnalogous(colors?.['primary-hex']!)] as any;

    useFocusEffect(
        useCallback(() => {
            getMeData();

            // TESTAPI();
        }, [])
    );

    useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                dashboardItems?.length ?
                    !enableEditingGrid ?
                        <TouchableOpacity onPress={() => setEnableEditingGrid(true)} className={`p-4`}>
                            <Pencil size={20} className='text-base-content' />
                        </TouchableOpacity>
                        :
                        <TouchableOpacity onPress={() => handleSaveGrid()} className={`p-4`}>
                            <Save size={20} className='text-base-content' />
                        </TouchableOpacity>
                    : null
            )
        });
    }, [enableEditingGrid]);

    useEffect(() => {
        setData(meData);
    }, [meData]);

    useEffect(() => {
        setDashboardItems(data?.dashboardItems || []);
    }, [data]);

    const handleDeleteItem = async () => {
        await deleteDashboardListItem(`dashboard/${listItemSelected.id}`);
        playerTrash.seekTo(0);
        playerTrash.volume = 0.5;
        playerTrash.play();
        setDeleteBottomModalOpen(false);
        setListItemSelected(null);
        await getMeData();
    };

    const handleOpenDeleteItemModal = async (item: any) => {
        setListItemSelected(item);
        setDeleteBottomModalOpen(true);
    };

    useEffect(() => {
        // TODO: check if dropdown not fits on the screen
        if (listItemSelected?.style.top + listItemSelected?.style.height > contentHeight - contentHeight / 6 - 2) {

            y.value = listItemSelected?.style.top || 0;

            y.value = withTiming(listItemSelected?.style.top - contentHeight / 6 - 2, { duration: 400 });
        } else {
            y.value = listItemSelected?.style.top || 0;
        }
        x.value = listItemSelected?.style.left || 0;
        width.value = listItemSelected?.style.width || 0;
        height.value = listItemSelected?.style.height || 0;
    }, [listItemSelected])


    const x = useSharedValue(0);
    const y = useSharedValue(0);
    const width = useSharedValue(0);
    const height = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            left: x.value,
            top: y.value,
            width: width.value,
            height: height.value
        }
    });
    const animatedStyle2 = useAnimatedStyle(() => {
        return {
            opacity: withDelay(200, withTiming(listItemSelected ? 1 : 0)),
            left: x.value,
            top: y.value + height.value,
            maxWidth: width.value,
        }
    });
    const animatedSaveButtonStyle = useAnimatedStyle(() => {
        return {

            transform: [
                { translateX: '-50%' },
                { translateY: withTiming(enableEditingGrid ? 0 : 200) }
            ],
        }
    });

    const handleSaveGrid = async () => {
        const data = dashboardItems.map((item, index) => ({
            id: item.id,
            order: index,
            size: item.size,
        }))
        await updateDashboardListItem(`dashboard`, data);
        setEnableEditingGrid(false);
    }

    if (loadingMeData && !dashboardItems) {
        return (
            <View className='flex flex-1 items-center justify-center bg-base-100'>
                <Loader size={50} />
            </View>
        );
    }

    return (
        <>
            <View className='p-4 flex flex-1'>
                <CustomPullToRefreshOnRelease
                    onRefresh={getMeData}
                    initialRefreshing={loadingMeData}
                    contentContainerStyle={{ flex: 1 }}
                >
                    <View
                        className='flex flex-1'
                        onLayout={(e) => {
                            setContentWidth(e.nativeEvent.layout.width)
                            setContentHeight(e.nativeEvent.layout.height)
                        }}
                    >
                        {!!dashboardItems?.length && (
                            <TouchableOpacity activeOpacity={0.85} className='flex-1' onLongPress={() => { setEnableEditingGrid(true) }}>
                                <MasonryGrid
                                    data={dashboardItems}
                                    contentWidth={contentWidth}
                                    isDragEnabled={enableEditingGrid}
                                    isResizeEnabled={enableEditingGrid}
                                    // showDebugGrid
                                    contentHeight={contentHeight}
                                    spacing={10}
                                    onItemPress={(item) => { !enableEditingGrid && router.push(item.href) }}
                                    resizeColor={(item) => getContrastColor(item.entity?.workspace?.color!).color}
                                    onItemLongPress={(item) => {
                                        if (!enableEditingGrid) {
                                            setListItemSelected(item);
                                            setEnableEditingGrid(false);
                                        }
                                    }}
                                    numColumns={3}
                                    numRows={6}
                                    renderItem={(item) => <DashboardItem item={item} />}
                                    keyExtractor={(item) => item.id.toString()}
                                    onItemsReorder={async (newData) => {
                                        setDashboardItems(parseDashboardItem(newData));
                                    }}
                                    onItemResize={async (itemId, newSize, newOrder) => {
                                        setDashboardItems(prev =>
                                            prev.map(item =>
                                                item.id == itemId as any
                                                    ? { ...item, size: newSize }
                                                    : item
                                            )
                                        );
                                    }}
                                />
                            </TouchableOpacity>
                        )}

                        {!dashboardItems.length && (
                            <View className='flex-1 items-center justify-center'>
                                <Text text="no_items" className='text-base-content text-2xl' />
                            </View>
                        )}
                    </View>
                </CustomPullToRefreshOnRelease>
            </View>

            {/* Save grid button */}
            <Animated.View
                className={`absolute left-1/2 -translate-x-1/2 z-50`}
                style={[{ bottom: insets.bottom + (Platform.OS === 'ios' ? 0 : 10) }, animatedSaveButtonStyle]}
                pointerEvents={enableEditingGrid ? 'auto' : 'none'}
            >
                <TouchableOpacity
                    className='px-8 py-4 overflow-hidden rounded-full flex-1 items-center justify-center gap-4 flex-row'
                    onPress={handleSaveGrid}
                >
                    <LinearGradient
                        colors={saveGridButtonColors}
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
                    {!updatingDashboardListItem &&
                        <>
                            <Save size={20} className='text-primary-content' />
                            <Text text="save" className='text-primary-content text-xl font-bold' />
                        </>
                    }
                    {updatingDashboardListItem && <Loader className='fill-primary-content' size={20} />}
                </TouchableOpacity>
            </Animated.View>

            {/* Modal item selected with dropdown */}
            {listItemSelected &&
                <View
                    className='absolute left-0 right-0 top-0 w-full h-full z-50'
                >
                    <Pressable
                        onPress={() => setListItemSelected(null)}
                        className='relative left-0 top-0 w-full h-full '
                    >
                        <View className='w-full h-full bg-black/50 z-40' />
                    </Pressable>
                    <Animated.View className='absolute z-50 m-4 p-1 overflow-hidden' style={[animatedStyle]}>
                        <DashboardItem item={listItemSelected} />
                    </Animated.View>
                    <Animated.View
                        className='absolute bg-base-100 p-2 rounded-2xl mx-4 my-6 overflow-hidden'
                        style={[animatedStyle2]}
                    >
                        <View className='flex flex-row gap-4 pl-4 pr-10 py-4'>
                            <Pencil size={20} className='stroke-base-content' />
                            <Text avoidTranslation text="Edit" className='text-base-content' />
                        </View>
                        <TouchableOpacity onPress={() => handleOpenDeleteItemModal(listItemSelected)} className='flex flex-row gap-4 pl-4 pr-10 py-4'>
                            <Trash2 size={20} className='stroke-error' />
                            <Text avoidTranslation text="Delete" className='text-error' />
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            }

            <InformationModal
                isOpen={deleteBottomModalOpen}
                title="dashboard.delete_item"
                message="dashboard.delete_item_confirmation"
                messageTranslateData={{ name: listItemSelected?.entity?.name || '' }}
                onClose={() => setDeleteBottomModalOpen(false)}
                onSubmit={handleDeleteItem}
                isLoading={deletingDashboardListItem}
            />
        </>
    );
}


const DashboardItem = ({ item }: { item: PositionedItem<ParsedDashboardItem> }) => {
    const textColor = getContrastColor(item.entity?.workspace?.color!);
    const colors = [...getAnalogous(item.entity?.workspace?.color!)] as any;

    return (
        <View
            key={item.id}
            className={`relative overflow-hidden flex flex-1 flex-row gap-4 p-4 py-6 rounded-2xl h-full items-center justify-center`}
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
            <View className={`flex-row gap-4 flex-1 items-center justify-center ${item.size.width === 1 ? 'flex-col items-center justify-center' : ''}`}>

                {item.icon &&
                    <ItemIcon icon={item.icon} stroke={textColor.color} className='flex-0 ' />
                }
                {/* <View className='flex flex-col gap-2 size-6 rounded-full' style={{ backgroundColor: item.entity.workspace.color }}></View> */}
                {/* <Text avoidTranslation text={item.size?.width.toString() + ' x ' + item.size?.height.toString()} style={{ color: textColor }} className='text-base-content text-xl font-bold' /> */}
                <View className='flex flex-initial justify-center '>
                    <Text
                        numberOfLines={item.size.height === 1 ? 1 : 4}
                        avoidTranslation
                        text={item.entity?.name || item.entity.title || ''}
                        className={`${textColor.className} font-bold ${item.size.width === 1 ? 'text-center text-xl' : 'text-2xl items-center justify-center '}`}
                    />
                </View>
            </View>
        </View>
    )
}


// import { Dimensions } from "react-native";

// const SCREEN_WIDTH = Dimensions.get("window").width;
// const NUM_COLUMNS = 3;
// const SPACING = 10;

// // Helper para calcular layout estilo masonry con sizes variables
// function calculatePositions(items: any[]) {
//     // arreglo para guardar la altura acumulada de cada columna
//     const columnHeights = new Array(NUM_COLUMNS).fill(0);
//     const positions = items.map((item) => {
//         // Elegir la columna más baja para ubicar este item (masonry)
//         const minCol = columnHeights.indexOf(Math.min(...columnHeights));
//         const x = minCol * (SCREEN_WIDTH / NUM_COLUMNS);
//         const y = columnHeights[minCol];
//         // Asumimos item.size.width y height están en proporción, calculamos ancho base de columna
//         const width = SCREEN_WIDTH / NUM_COLUMNS - SPACING * 2;
//         const height = width * (item.size.height / item.size.width); // manteniendo ratio
//         columnHeights[minCol] += height + SPACING;
//         return { x, y, width, height, col: minCol };
//     });
//     return positions;
// }

// const Example = () => {
//     const { data } = useUserStore();

//     // Orden real de items (confirmado)
//     const [itemsOrder, setItemsOrder] = useState(data?.dashboardItems || []);

//     // Preview del orden mientras dragueas (empieza igual que itemsOrder)
//     const [previewOrder, setPreviewOrder] = useState(itemsOrder);

//     // Posiciones calculadas para el previewOrder actual
//     const positions = calculatePositions(previewOrder);

//     // Actualizamos previewOrder si cambia itemsOrder desde afuera
//     useEffect(() => {
//         setPreviewOrder(itemsOrder);
//     }, [itemsOrder]);

//     // Función para mover un item en previewOrder haciendo shift
//     const moveItem = (fromIndex: number, toIndex: number) => {
//         if (fromIndex === toIndex) return;
//         const newOrder = [...previewOrder];
//         const [moved] = newOrder.splice(fromIndex, 1);
//         newOrder.splice(toIndex, 0, moved);
//         setPreviewOrder(newOrder);
//     };

//     // Al soltar confirmamos la orden real
//     const onDragEnd = () => {
//         setItemsOrder(previewOrder);
//     };

//     const renderItem = ({ item }: any) => {
//         return (
//             <DraggableItem
//                 key={item.id}
//                 item={item}
//                 previewOrder={previewOrder}
//                 positions={positions}
//                 moveItem={moveItem}
//                 onDragEnd={onDragEnd}
//             />
//         );
//     };

//     return (
//         <View style={{ flex: 1, }}>
//             <FlashList
//                 data={previewOrder}
//                 keyExtractor={(item) => item.id.toString()}
//                 renderItem={renderItem}
//                 // estimatedItemSize={150}
//                 numColumns={1} // FlashList solo con 1 columna para posicionamiento absoluto en DraggableItem
//                 scrollEnabled={false} // Controla scroll manualmente si quieres
//             />
//         </View>
//     );
// }

// function DraggableItem({
//     item,
//     previewOrder,
//     positions,
//     moveItem,
//     onDragEnd,
// }: any) {
//     const index = previewOrder.findIndex((i: any) => i.id === item.id);
//     const pos = positions[index];

//     // Posiciones absolutas animadas
//     const transX = useSharedValue(pos.x);
//     const transY = useSharedValue(pos.y);

//     // Estado drag activo
//     const isDragging = useSharedValue(false);

//     // Offset al empezar drag (para no "saltar" el item)
//     const offsetX = useSharedValue(0);
//     const offsetY = useSharedValue(0);

//     // Update animación posición cuando cambia pos (solo si no está arrastrando)
//     useEffect(() => {
//         if (!isDragging.value) {
//             transX.value = withSpring(pos.x);
//             transY.value = withSpring(pos.y);
//         }
//     }, [pos.x, pos.y]);

//     // Nuevo índice potencial durante drag
//     const dragIndex = useSharedValue(index);

//     // Detectar cuál índice corresponde a una posición Y (vertical) para reordenar
//     const findIndexAtPosition = (x: number, y: number) => {
//         // Recorremos todas posiciones para ver cuál contiene ese punto
//         for (let i = 0; i < positions.length; i++) {
//             const p = positions[i];
//             if (
//                 x >= p.x &&
//                 x <= p.x + p.width &&
//                 y >= p.y &&
//                 y <= p.y + p.height
//             ) {
//                 return i;
//             }
//         }
//         return null;
//     };

//     // Gesture
//     const pan = Gesture.Pan()
//         .onStart((event) => {
//             isDragging.value = true;
//             offsetX.value = event.x - transX.value;
//             offsetY.value = event.y - transY.value;
//             dragIndex.value = index;
//         })
//         .onUpdate((event) => {
//             // Nueva posición absoluta del drag
//             const newX = event.x - offsetX.value;
//             const newY = event.y - offsetY.value;

//             transX.value = newX;
//             transY.value = newY;

//             // Chequeamos si tocamos otra posición para mover el item en previewOrder
//             const overIndex = findIndexAtPosition(newX + pos.width / 2, newY + pos.height / 2);
//             if (overIndex !== null && overIndex !== dragIndex.value) {
//                 runOnJS(moveItem)(dragIndex.value, overIndex);
//                 dragIndex.value = overIndex;
//             }
//         })
//         .onEnd(() => {
//             // Animamos a la posición final
//             transX.value = withSpring(positions[dragIndex.value].x);
//             transY.value = withSpring(positions[dragIndex.value].y);
//             isDragging.value = false;
//             runOnJS(onDragEnd)();
//         });

//     // Animación del item
//     const animatedStyle = useAnimatedStyle(() => ({
//         position: "absolute",
//         width: pos.width,
//         height: pos.height,
//         top: 0,
//         left: 0,
//         zIndex: isDragging.value ? 100 : 0,
//         shadowColor: "#000",
//         shadowOpacity: isDragging.value ? 0.25 : 0,
//         shadowRadius: 10,
//         shadowOffset: { width: 0, height: 5 },
//         transform: [
//             { translateX: transX.value },
//             { translateY: transY.value },
//             {
//                 scale: withSpring(isDragging.value ? 1.05 : 1),
//             },
//         ],
//     }));

//     return (
//         <GestureDetector gesture={pan}>
//             <Animated.View >
//                 <View style={[styles.card, { borderColor: item.entity.workspace.color }]}>
//                     <Text
//                         avoidTranslation
//                         className="text-3xl font-bold"
//                         style={{ color: item.entity.workspace.color }}
//                         text={`${item.size.width} x ${item.size.height}`}
//                     />
//                     <Pressable style={styles.deleteBtn}>
//                         <RNText style={{ color: "#fff" }}>X</RNText>
//                     </Pressable>
//                 </View>
//             </Animated.View>
//         </GestureDetector>
//     );
// }

// const styles = StyleSheet.create({
//     card: {
//         flex: 1,
//         borderWidth: 1,
//         borderRadius: 12,
//         justifyContent: "center",
//         alignItems: "center",
//     },
//     deleteBtn: {
//         position: "absolute",
//         top: 5,
//         right: 5,
//         backgroundColor: "red",
//         borderRadius: 12,
//         paddingHorizontal: 6,
//     },
// });
