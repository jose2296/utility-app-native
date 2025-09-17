// MasonryGrid.resizable.tsx
// Versión extendida de tu MasonryGrid para soportar:
// - Drag (reordenamiento)
// - Resize (redimensionar widgets a múltiplos de la cuadricula)
// - Previews (placeholder) durante drag y resize
// - Snapping al grid, restricciones de columnas
// - Indicadores visuales y 'shifting' de items

import { cssInterop } from 'nativewind';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Pressable,
    ScrollView,
    StyleProp,
    Text,
    TouchableOpacity,
    View,
    ViewStyle
} from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
    cancelAnimation,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

/* ===========================
Tipos
=========================== */
type GridStyle = {
    position: string;
    left: number;
    top: number;
    width: number;
    height: number;
};

type GridPosition = { row: number; col: number; width: number; height: number; };

export type PositionedItem<T> = T & {
    id: string;
    gridPosition: GridPosition;
    style: GridStyle;
};

export type MasonryGridProps<T> = {
    data: T[];
    numColumns?: number;
    numRows?: number;
    spacing?: number;
    contentWidth: number;
    contentHeight: number;
    keyExtractor: (item: T, index: number) => string;
    renderItem: (item: PositionedItem<T>) => React.ReactNode;
    resizeColor?: (item: PositionedItem<any>) => string;
    onItemPress?: (item: PositionedItem<T>) => void;
    onItemLongPress?: (item: PositionedItem<T>) => void;
    style?: StyleProp<ViewStyle>;
    showDebugGrid?: boolean;
    isDragEnabled?: boolean;
    isResizeEnabled?: boolean; // NUEVO: permitir redimensionar
    onItemsReorder?: (newData: T[]) => void;
    onItemResize?: (id: string, newSize: { width: number; height: number }, newOrder?: T[]) => void; // NUEVO
};


cssInterop(Svg, {
    className: {
        target: "style", // map className->style
        nativeStyleToProp: {
            color: true
        },
    },
});

/* ===========================
Hook: layout masonry (sin estado interno)
=========================== */
function computeMasonryLayout({
    data,
    numColumns,
    numRows,
    spacing,
    contentWidth,
    contentHeight,
    keyExtractor
}: {
    data: any[];
    numColumns: number;
    numRows?: number;
    spacing: number;
    contentWidth: number;
    contentHeight: number;
    keyExtractor: (item: any, index: number) => string;
}) {
    const cellWidth = Math.floor((contentWidth - spacing * (numColumns - 1)) / numColumns);
    const cellHeight = numRows
        ? Math.floor((contentHeight - spacing * (numRows - 1)) / numRows)
        : cellWidth;

    const maxRows = numRows || Math.ceil(data.length * 1.5);
    const occupiedGrid = Array.from({ length: maxRows }, () => Array(numColumns).fill(false));

    const positioned: PositionedItem<any>[] = [];
    let currentMaxRow = 0;

    data.forEach((item, index) => {
        const size = item?.size || { width: 1, height: 1 };
        const w = Math.max(1, Math.floor(size.width || 1));
        const h = Math.max(1, Math.floor(size.height || 1));

        if (w > numColumns) {
            console.warn(`Item ${index} ancho ${w} excede columnas ${numColumns}`);
            return;
        }
        if (h > maxRows) {
            console.warn(`Item ${index} alto ${h} excede filas ${maxRows}`);
            return;
        }

        let placed = false;
        let row = 0;
        while (!placed && row <= maxRows - h) {
            for (let col = 0; col <= numColumns - w; col++) {
                let canPlace = true;
                for (let r = row; r < row + h && canPlace; r++) {
                    for (let c = col; c < col + w && canPlace; c++) {
                        if (occupiedGrid[r] && occupiedGrid[r][c]) {
                            canPlace = false;
                        }
                    }
                }
                if (canPlace) {
                    for (let r = row; r < row + h; r++) {
                        for (let c = col; c < col + w; c++) {
                            if (occupiedGrid[r]) occupiedGrid[r][c] = true;
                        }
                    }

                    const x = col * (cellWidth + spacing);
                    const y = row * (cellHeight + spacing);
                    const itemWidth = w * cellWidth + (w - 1) * spacing;
                    const itemHeight = h * cellHeight + (h - 1) * spacing;

                    const id = keyExtractor(item, index) || `item-${index}`;

                    positioned.push({
                        ...(item as any),
                        id,
                        gridPosition: { row, col, width: w, height: h },
                        style: {
                            position: 'absolute',
                            left: x,
                            top: y,
                            width: itemWidth,
                            height: itemHeight
                        }
                    } as PositionedItem<any>);

                    currentMaxRow = Math.max(currentMaxRow, row + h);
                    placed = true;
                    break;
                }
            }
            row++;
        }

        if (!placed) {
            console.warn(`No se pudo ubicar item ${index} tamaño ${w}x${h}`);
        }
    });

    const gridHeight = currentMaxRow * (cellHeight + spacing);
    return { positioned, gridHeight, cellWidth, cellHeight };
}

/* ===========================
GridItem visual - con handle de resize (ahora con resize en vivo usando shared values)
=========================== */
type GridItemProps<T> = {
    item: PositionedItem<any>;
    renderItem: (item: PositionedItem<T>) => React.ReactNode;
    onPress?: (item: PositionedItem<T>) => void;
    onLongPress?: (item: PositionedItem<T>) => void;
    isDragEnabled?: boolean;
    isResizeEnabled?: boolean;
    isDragging?: boolean;
    isResizing?: boolean;
    isShifting?: boolean; // indica si el item se está moviendo por el reordenamiento
    onGestureStart?: (id: string, itemStyle: GridStyle) => void;
    onGestureMove?: (id: string, dx: number, dy: number) => void;
    onGestureEnd?: (id: string, dx: number, dy: number) => void;
    onResizeStart?: (id: string, itemStyle: GridStyle) => void;
    onResizeMove?: (id: string, dx: number, dy: number) => void;
    onResizeEnd?: (id: string, dx: number, dy: number) => void;
    cellWidth: number;
    cellHeight: number;
    resizeColor?: (item: PositionedItem<any>) => string;
};

const GridItem = React.memo(<T,>({
    item,
    cellWidth,
    cellHeight,
    renderItem,
    onPress,
    onLongPress,
    isDragEnabled = false,
    isResizeEnabled = false,
    isDragging = false,
    isResizing = false,
    isShifting = false,
    onGestureStart,
    onGestureMove,
    onGestureEnd,
    onResizeStart,
    onResizeMove,
    onResizeEnd,
    resizeColor
}: GridItemProps<T>) => {
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const scale = useSharedValue(1);
    const elevation = useSharedValue(1);
    const opacity = useSharedValue(1);
    const rotation = useSharedValue(0);

    // Shared values para width/height para permitir resize en vivo
    const widthShared = useSharedValue(item.style.width);
    const heightShared = useSharedValue(item.style.height);
    const startW = useSharedValue(item.style.width);
    const startH = useSharedValue(item.style.height);

    // Sincronizar cuando el item cambia (pero evitar sobrescribir durante el gesto de resize activo)
    useEffect(() => {
        if (!isResizing) {
            widthShared.value = withSpring(item.style.width, { damping: 15 });
            heightShared.value = withSpring(item.style.height, { damping: 15 });
        }
    }, [item.style.width, item.style.height, isResizing]);

    useEffect(() => {
        if ((isDragEnabled && !isDragging) && (isResizeEnabled && !isResizing)) {
            const intensity = 1;
            const duration = 100;

            // Inicia la animación de shake con rotación
            rotation.value = withRepeat(
                withSequence(
                    withTiming(-intensity, { duration }),
                    withTiming(intensity, { duration }),
                    withTiming(-intensity * 0.8, { duration }),
                    withTiming(intensity * 0.8, { duration }),
                    withTiming(-intensity * 0.5, { duration }),
                    withTiming(intensity * 0.5, { duration }),
                    withTiming(0, { duration })
                ),
                -1, // Repetir infinitamente
                false // No reversar la secuencia
            );
        } else {
            // Detiene la animación y vuelve a la posición original
            cancelAnimation(rotation);
            rotation.value = withTiming(0, { duration: 200 });
        }

        // Cleanup function para cancelar animación al desmontar
        return () => {
            cancelAnimation(rotation);
        };
    }, [isDragEnabled, isResizeEnabled, isResizing, isDragging]);

    const pan = useMemo(() => {
        const g = Gesture.Pan()
            .minDistance(8)
            .onStart(() => {
                'worklet';
                if (!isDragEnabled) return;
                if (onGestureStart) runOnJS(onGestureStart)(item.id, item.style);
                scale.value = withSpring(1.05, { damping: 15 });
                elevation.value = withTiming(20);
                opacity.value = withTiming(0.95);
            })
            .onUpdate((ev) => {
                'worklet';
                if (!isDragEnabled) return;
                translateX.value = ev.translationX;
                translateY.value = ev.translationY;
                if (onGestureMove) runOnJS(onGestureMove)(item.id, ev.translationX, ev.translationY);
            })
            .onEnd((ev) => {
                'worklet';
                if (!isDragEnabled) return;
                if (onGestureEnd) runOnJS(onGestureEnd)(item.id, ev.translationX, ev.translationY);
                translateX.value = withSpring(0);
                translateY.value = withSpring(0);
                scale.value = withSpring(1);
                elevation.value = withTiming(1);
                opacity.value = withTiming(1);
            });

        if (!isDragEnabled) return g.enabled(false);
        return g;
    }, [isDragEnabled, item.id, onGestureStart, onGestureMove, onGestureEnd]);

    // Gesture para resize que actualiza shared values en UI thread (resize en vivo)
    const resizePan = useMemo(() => {
        const g = Gesture.Pan()
            .minDistance(2)
            .onStart(() => {
                'worklet';
                if (!isResizeEnabled) return;
                // guardar puntos iniciales
                startW.value = widthShared.value;
                startH.value = heightShared.value;
                if (onResizeStart) runOnJS(onResizeStart)(item.id, item.style);
            })
            .onUpdate((ev) => {
                'worklet';
                if (!isResizeEnabled) return;
                // actualizar tamaño en px en tiempo real

                // TODO: limit w and h for specific sizes (2x2, 2x1, 1x2...)
                const minW = cellWidth;
                const maxW = cellWidth * 3;
                const newW = Math.max(minW, Math.min(maxW, startW.value + ev.translationX));
                const minH = cellHeight;
                const maxH = cellHeight * 2;
                const newH = Math.max(minH, Math.min(maxH, startH.value + ev.translationY));
                widthShared.value = newW;
                heightShared.value = newH;
                if (onResizeMove) runOnJS(onResizeMove)(item.id, newW - startW.value, newH - startH.value);
            })
            .onEnd((ev) => {
                'worklet';
                if (!isResizeEnabled) return;
                if (onResizeEnd) runOnJS(onResizeEnd)(item.id, ev.translationX, ev.translationY);
            });

        if (!isResizeEnabled) return g.enabled(false);
        return g;
    }, [isResizeEnabled, item.id, onResizeStart, onResizeMove, onResizeEnd]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            position: 'absolute',
            left: withSpring(item.style.left, { damping: isShifting ? 12 : 20 }),
            top: withSpring(item.style.top, { damping: isShifting ? 12 : 20 }),
            width: widthShared.value,
            height: heightShared.value,
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value },
                { scale: scale.value },
                { rotate: `${rotation.value}deg` }
            ],
            zIndex: isDragging ? 1000 : (isShifting ? 10 : 1),
            // shadowColor: '#000',
            // shadowOffset: {
            //     width: 0,
            //     height: isDragging ? 8 : (isShifting ? 2 : 0)
            // },
            // shadowOpacity: isDragging ? 0.3 : (isShifting ? 0.1 : 0),
            // shadowRadius: isDragging ? 15 : (isShifting ? 4 : 0),
            // elevation: elevation.value,
            opacity: opacity.value
        } as any;
    }, [item.style.left, item.style.top, isDragging, isShifting]);

    const content = (
        <Animated.View style={animatedStyle} className='p-1'>
            <TouchableOpacity
                style={{ flex: 1 }}
                activeOpacity={0.7}
                onPress={() => !isDragging && onPress?.(item)}
                onLongPress={() => !isDragging && onLongPress?.(item)}
                disabled={isDragging || isShifting}
            >
                {renderItem(item)}

                {/* HANDLE de resize - esquina inferior derecha */}
                {isResizeEnabled && (
                    <GestureDetector gesture={resizePan}>
                        <Pressable className={`absolute bottom-0 right-0 w-12 h-12 items-end justify-end flex ${isResizing ? 'bg-base-content/20 rounded-2xl' : ''}`} >
                            <Svg className='w-10 h-10' stroke={resizeColor?.(item) || '#000'}>
                                <Path d="M21 15L15 21M21 8L8 21" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                            </Svg>
                        </Pressable>
                    </GestureDetector>
                )}
            </TouchableOpacity>
        </Animated.View>
    );

    return (
        <GestureDetector gesture={isDragEnabled ? pan : pan.enabled(false)}>
            {content}
        </GestureDetector>
    );
});

/* ===========================
Componente de indicador de inserción visual
=========================== */
const InsertionIndicator = React.memo(({
    position,
    isHorizontal = false,
    width,
    height
}: {
    position: { x: number, y: number },
    isHorizontal?: boolean,
    width: number,
    height: number
}) => {
    const animatedOpacity = useSharedValue(0);
    const animatedScale = useSharedValue(0.8);

    useEffect(() => {
        animatedOpacity.value = withSpring(1, { damping: 12 });
        animatedScale.value = withSpring(1, { damping: 12 });

        return () => {
            animatedOpacity.value = withTiming(0, { duration: 150 });
        };
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: animatedOpacity.value,
        transform: [{ scale: animatedScale.value }]
    }));

    return (
        <Animated.View
            style={[
                {
                    position: 'absolute',
                    left: position.x,
                    top: position.y,
                    width: width,
                    height: height,
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 500
                },
                animatedStyle
            ]}
        >
            <View
                style={{
                    width: isHorizontal ? width * 0.8 : 4,
                    height: isHorizontal ? 4 : height * 0.8,
                    backgroundColor: '#007AFF',
                    borderRadius: 2,
                    shadowColor: '#007AFF',
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.6,
                    shadowRadius: 8,
                    elevation: 8
                }}
            />

            <View
                style={{
                    position: 'absolute',
                    left: isHorizontal ? 0 : width / 2 - 6,
                    top: isHorizontal ? height / 2 - 6 : 0,
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: '#007AFF',
                    shadowColor: '#007AFF',
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.8,
                    shadowRadius: 4,
                    elevation: 8
                }}
            />

            <View
                style={{
                    position: 'absolute',
                    left: isHorizontal ? width * 0.8 - 6 : width / 2 - 6,
                    top: isHorizontal ? height / 2 - 6 : height * 0.8 - 6,
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: '#007AFF',
                    shadowColor: '#007AFF',
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.8,
                    shadowRadius: 4,
                    elevation: 8
                }}
            />
        </Animated.View>
    );
});

/* ===========================
MasonryGrid principal - con drag + resize
=========================== */
const MasonryGrid = <T,>({
    data,
    numColumns = 4,
    numRows,
    spacing = 8,
    contentWidth,
    contentHeight,
    keyExtractor,
    renderItem,
    onItemPress,
    onItemLongPress,
    style,
    showDebugGrid = false,
    isDragEnabled = false,
    isResizeEnabled = false,
    onItemsReorder,
    onItemResize,
    resizeColor
}: MasonryGridProps<T>) => {
    const [orderData, setOrderData] = useState<T[]>(() => data.slice());

    useEffect(() => {
        setOrderData(data.slice());
    }, [data]);

    const wrappers = useMemo(() => {
        return orderData.map((it, i) => {
            const id = keyExtractor(it, i) || `item-${i}`;
            return {
                ...it,
                __orig: it,
                __id: id,
                size: (it as any)?.size || { width: 1, height: 1 }
            };
        });
    }, [orderData, keyExtractor]);

    const { positioned: realLayout, gridHeight, cellWidth, cellHeight } = useMemo(() => {
        return computeMasonryLayout({
            data: wrappers,
            numColumns,
            numRows,
            spacing,
            contentWidth,
            contentHeight,
            keyExtractor: (item: any, idx: number) => item.__id
        });
    }, [wrappers, numColumns, numRows, spacing, contentWidth, contentHeight]);

    const realMap = useMemo(() => {
        const m = new Map<string, PositionedItem<any>>();
        realLayout.forEach(p => m.set(p.id, p));
        return m;
    }, [realLayout]);

    // Estados del drag / resize
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [resizingId, setResizingId] = useState<string | null>(null);
    const [insertionIndex, setInsertionIndex] = useState<number | null>(null);
    const [insertionPosition, setInsertionPosition] = useState<{ x: number, y: number, width: number, height: number } | null>(null);
    const [shiftingItems, setShiftingItems] = useState<Set<string>>(new Set());

    const draggedInitialStyleRef = useRef<GridStyle | null>(null);
    const resizeInitialStyleRef = useRef<GridStyle | null>(null);
    const draggedSizeRef = useRef<{ width: number; height: number } | null>(null);

    // Layout sin el item siendo arrastrado
    const orderWithoutDragged = useMemo(() => {
        if (!draggingId) return wrappers.slice();
        return wrappers.filter(w => w.__id !== draggingId);
    }, [wrappers, draggingId]);

    const { positioned: virtualLayout } = useMemo(() => {
        return computeMasonryLayout({
            data: orderWithoutDragged,
            numColumns,
            numRows,
            spacing,
            contentWidth,
            contentHeight,
            keyExtractor: (item: any, idx: number) => item.__id
        });
    }, [orderWithoutDragged, numColumns, numRows, spacing, contentWidth, contentHeight]);

    // PreviewWrappers ahora soporta 2 casos:
    // 1) Dragging -> placeholder insertado en orderWithoutDragged
    // 2) Resizing -> reemplaza el wrapper en su sitio con nuevo tamaño (en celdas)
    const [resizingSize, setResizingSize] = useState<{ width: number, height: number } | null>(null); // en CELDAS

    const previewWrappers = useMemo(() => {
        // Caso dragging
        if (draggingId && insertionIndex !== null) {
            const draggedWrapper = wrappers.find(w => w.__id === draggingId);
            if (!draggedWrapper) return orderWithoutDragged.slice();

            const placeholder = {
                __isPlaceholder: true,
                __id: `__ph_${draggingId}`,
                size: draggedSizeRef.current || { width: 1, height: 1 }
            };

            const result = [...orderWithoutDragged];
            const insertAt = Math.max(0, Math.min(result.length, insertionIndex));
            result.splice(insertAt, 0, placeholder as any);

            return result;
        }

        // Caso resizing
        if (resizingId && resizingSize) {
            return wrappers.map(w => {
                if (w.__id === resizingId) {
                    return { ...w, size: { width: resizingSize.width, height: resizingSize.height } };
                }
                return w;
            });
        }

        // Default: sin preview especial
        return wrappers.slice();

    }, [wrappers, orderWithoutDragged, draggingId, insertionIndex, resizingId, resizingSize]);

    const { positioned: previewLayout } = useMemo(() => {
        return computeMasonryLayout({
            data: previewWrappers,
            numColumns,
            numRows,
            spacing,
            contentWidth,
            contentHeight,
            keyExtractor: (item: any, idx: number) => item.__id
        });
    }, [previewWrappers, numColumns, numRows, spacing, contentWidth, contentHeight]);

    const previewMap = useMemo(() => {
        const m = new Map<string, PositionedItem<any>>();
        previewLayout.forEach(p => m.set(p.id, p));
        return m;
    }, [previewLayout]);

    // Efecto: detectar items que cambian de posición en preview (drag o resize) -> shifting
    useEffect(() => {
        if (!draggingId && !resizingId) return;

        const newShifting = new Set<string>();

        realLayout.forEach(realItem => {
            if (realItem.id === draggingId || realItem.id === resizingId) return;

            const previewItem = previewMap.get(realItem.id);
            if (previewItem) {
                const positionChanged =
                    Math.abs(realItem.style.left - previewItem.style.left) > 2 ||
                    Math.abs(realItem.style.top - previewItem.style.top) > 2 ||
                    Math.abs(realItem.style.width - previewItem.style.width) > 2 ||
                    Math.abs(realItem.style.height - previewItem.style.height) > 2;

                if (positionChanged) {
                    newShifting.add(realItem.id);
                }
            }
        });

        setShiftingItems(newShifting);
    }, [draggingId, resizingId, realLayout, previewMap]);

    // Algoritmo mejorado para encontrar posición de inserción (se mantiene igual)
    const findBestInsertionIndex = useCallback((centerX: number, centerY: number) => {
        if (virtualLayout.length === 0) return {
            index: 0,
            position: {
                x: spacing,
                y: spacing,
                width: contentWidth - spacing * 2,
                height: 4
            }
        };

        const sortedPositions = virtualLayout.map((item, arrayIndex) => ({
            item,
            arrayIndex,
            readingOrder: item.style.top * 1000 + item.style.left
        })).sort((a, b) => a.readingOrder - b.readingOrder);

        const insertionZones: Array<any> = [];

        const firstPos = sortedPositions[0];
        insertionZones.push({
            arrayIndex: 0,
            centerX: contentWidth / 2,
            centerY: Math.max(spacing, firstPos.item.style.top - spacing),
            width: contentWidth - spacing * 2,
            height: 4,
            distance: Math.hypot(centerX - contentWidth / 2, centerY - Math.max(spacing, firstPos.item.style.top - spacing)),
            type: 'start'
        });

        for (let i = 0; i < sortedPositions.length - 1; i++) {
            const currentPos = sortedPositions[i];
            const nextPos = sortedPositions[i + 1];

            const midX = (currentPos.item.style.left + currentPos.item.style.width + nextPos.item.style.left) / 2;
            const midY = (currentPos.item.style.top + currentPos.item.style.height + nextPos.item.style.top) / 2;

            insertionZones.push({
                arrayIndex: currentPos.arrayIndex + 1,
                centerX: midX,
                centerY: midY,
                width: Math.abs(nextPos.item.style.left - (currentPos.item.style.left + currentPos.item.style.width)) + spacing,
                height: Math.max(currentPos.item.style.height, nextPos.item.style.height),
                distance: Math.hypot(centerX - midX, centerY - midY),
                type: 'between'
            });
        }

        const lastPos = sortedPositions[sortedPositions.length - 1];
        const endY = lastPos.item.style.top + lastPos.item.style.height + spacing;
        insertionZones.push({
            arrayIndex: virtualLayout.length,
            centerX: contentWidth / 2,
            centerY: endY,
            width: contentWidth - spacing * 2,
            height: 4,
            distance: Math.hypot(centerX - contentWidth / 2, centerY - endY),
            type: 'end'
        });

        const bestZone = insertionZones.reduce((best, current) => current.distance < best.distance ? current : best);

        let indicatorPosition;

        if (bestZone.type === 'start') {
            indicatorPosition = {
                x: spacing,
                y: Math.max(spacing, firstPos.item.style.top - spacing / 2),
                width: contentWidth - spacing * 2,
                height: 4
            };
        } else if (bestZone.type === 'end') {
            indicatorPosition = {
                x: spacing,
                y: lastPos.item.style.top + lastPos.item.style.height + spacing / 2,
                width: contentWidth - spacing * 2,
                height: 4
            };
        } else {
            const beforeIndex = sortedPositions.findIndex(p => p.arrayIndex + 1 === bestZone.arrayIndex);
            if (beforeIndex >= 0 && beforeIndex < sortedPositions.length - 1) {
                const beforeItem = sortedPositions[beforeIndex].item;
                const afterItem = sortedPositions[beforeIndex + 1].item;

                const sameRow = Math.abs(beforeItem.style.top - afterItem.style.top) < cellHeight * 0.5;

                if (sameRow) {
                    const lineX = (beforeItem.style.left + beforeItem.style.width + afterItem.style.left) / 2;
                    indicatorPosition = {
                        x: lineX - 2,
                        y: Math.min(beforeItem.style.top, afterItem.style.top) - spacing / 2,
                        width: 4,
                        height: Math.max(beforeItem.style.height, afterItem.style.height) + spacing
                    };
                } else {
                    indicatorPosition = {
                        x: spacing,
                        y: beforeItem.style.top + beforeItem.style.height + spacing / 2,
                        width: contentWidth - spacing * 2,
                        height: 4
                    };
                }
            } else {
                indicatorPosition = {
                    x: bestZone.centerX - 50,
                    y: bestZone.centerY - 2,
                    width: 100,
                    height: 4
                };
            }
        }

        return {
            index: bestZone.arrayIndex,
            position: indicatorPosition
        };

    }, [virtualLayout, cellHeight, contentWidth, spacing]);

    // Callbacks de gestos
    const onGestureStartJS = useCallback((id: string, style: GridStyle) => {
        setDraggingId(id);
        draggedInitialStyleRef.current = style;

        const draggedItem = realMap.get(id);
        draggedSizeRef.current = draggedItem
            ? { width: draggedItem.gridPosition.width, height: draggedItem.gridPosition.height }
            : { width: 1, height: 1 };

        const currentIndexInOrder = wrappers.findIndex(w => w.__id === id);
        setShiftingItems(new Set());
        setInsertionIndex(Math.max(0, currentIndexInOrder));
        setInsertionPosition(null);
    }, [realMap, wrappers]);

    const onGestureMoveJS = useCallback((id: string, dx: number, dy: number) => {
        const init = draggedInitialStyleRef.current;
        if (!init) return;

        const centerX = init.left + dx + init.width / 2;
        const centerY = init.top + dy + init.height / 2;

        const result = findBestInsertionIndex(centerX, centerY);

        if (result.index !== insertionIndex) {
            setInsertionIndex(result.index);
            setInsertionPosition(result.position);
            setShiftingItems(new Set([`_force_update_${Date.now()}`]));
        }
    }, [findBestInsertionIndex, insertionIndex, virtualLayout.length]);

    const onGestureEndJS = useCallback((id: string, dx: number, dy: number) => {
        if (!draggingId || insertionIndex === null) {
            setDraggingId(null);
            setInsertionIndex(null);
            setInsertionPosition(null);
            setShiftingItems(new Set());
            return;
        }

        const draggedWrapper = wrappers.find(w => w.__id === draggingId);
        if (!draggedWrapper) {
            setDraggingId(null);
            setInsertionIndex(null);
            setInsertionPosition(null);
            setShiftingItems(new Set());
            return;
        }

        const withoutDraggedOriginals = orderWithoutDragged.map(w => w.__orig);
        const insertAt = Math.max(0, Math.min(withoutDraggedOriginals.length, insertionIndex));

        const newOrder: T[] = [...withoutDraggedOriginals];
        newOrder.splice(insertAt, 0, draggedWrapper.__orig);

        if (newOrder.length !== orderData.length) {
            console.error('❌ Error: longitudes no coinciden', {
                original: orderData.length,
                nuevo: newOrder.length
            });
        } else {
            setOrderData(newOrder);
            if (onItemsReorder) onItemsReorder(newOrder);
        }

        setDraggingId(null);
        setInsertionIndex(null);
        setInsertionPosition(null);

        setTimeout(() => setShiftingItems(new Set()), 400);

    }, [draggingId, insertionIndex, wrappers, orderWithoutDragged, orderData.length, onItemsReorder]);

    // Resize callbacks
    const onResizeStartJS = useCallback((id: string, style: GridStyle) => {
        setResizingId(id);
        resizeInitialStyleRef.current = style;

        // Inicial: valores en celdas
        const realItem = realMap.get(id);
        const startCols = realItem ? realItem.gridPosition.width : 1;
        const startRows = realItem ? realItem.gridPosition.height : 1;
        setResizingSize({ width: startCols, height: startRows });

        // bloquear shifting inicial
        setShiftingItems(new Set());
    }, [realMap]);

    const onResizeMoveJS = useCallback((id: string, dx: number, dy: number) => {
        const init = resizeInitialStyleRef.current;
        if (!init) return;

        const rawNewWidthPx = init.width + dx;
        const rawNewHeightPx = init.height + dy;

        const pxPerCol = cellWidth + spacing;
        const pxPerRow = cellHeight + spacing;

        let newCols = Math.max(1, Math.ceil(rawNewWidthPx / pxPerCol));
        let newRows = Math.max(1, Math.ceil(rawNewHeightPx / pxPerRow));

        // evitar desbordar columnas
        const currentCol = realMap.get(id)?.gridPosition.col ?? 0;
        if (currentCol + newCols > numColumns) {
            newCols = Math.max(1, numColumns - currentCol);
        }

        setResizingSize({ width: newCols, height: newRows });

        // Forzar preview recalculation
        setShiftingItems(new Set([`_resize_${Date.now()}`]));
    }, [cellWidth, cellHeight, spacing, realMap, numColumns]);

    const onResizeEndJS = useCallback((id: string, dx: number, dy: number) => {
        if (!resizingId) {
            setResizingId(null);
            setResizingSize(null);
            setShiftingItems(new Set());
            return;
        }

        const sizeCells = resizingSize || { width: 1, height: 1 };

        // Actualizar estado orderData: sustituir la entrada original con su nueva size
        const wrapper = wrappers.find(w => w.__id === id);
        if (!wrapper) {
            setResizingId(null);
            setResizingSize(null);
            setShiftingItems(new Set());
            return;
        }

        const orig = wrapper.__orig;
        const newOrig = { ...(orig as any), size: { width: sizeCells.width, height: sizeCells.height } } as T;
        const newOrder = orderData.map(it => it === orig ? newOrig : it);

        setOrderData(newOrder);
        if (onItemResize) onItemResize(id, { width: sizeCells.width, height: sizeCells.height }, newOrder);

        setResizingId(null);
        setResizingSize(null);

        setTimeout(() => setShiftingItems(new Set()), 350);

    }, [resizingId, resizingSize, wrappers, orderData, onItemResize]);

    // Items finales para renderizar (prioriza: dragging > preview > real)
    const finalRenderItems = useMemo(() => {
        return wrappers.map(w => {
            const id = w.__id;
            if (id === draggingId) {
                const base = realMap.get(id);
                if (base) return base;
            }
            // Durante resize, previewLayout contendrá la versión redimensionada
            const preview = previewMap.get(id);
            if (preview) return preview;

            const base = realMap.get(id);
            if (base) return base;

            return {
                ...(w as any),
                id,
                gridPosition: { row: 0, col: 0, width: 1, height: 1 },
                style: { position: 'absolute', left: 0, top: 0, width: cellWidth, height: cellHeight }
            } as PositionedItem<any>;
        });
    }, [wrappers, draggingId, realMap, previewMap, cellWidth, cellHeight]);

    return (
        <GestureHandlerRootView style={[{ flex: 1 }, style]}>
            <ScrollView
                style={{ flex: 1 }}
                // desactivar scroll si se está arrastrando o redimensionando
                // scrollEnabled={!isDragEnabled || (!draggingId && !resizingId)}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
            >
                <View style={{
                    height: Math.max(gridHeight, contentHeight),
                    position: 'relative',
                    width: '100%'
                }}>

                    {/* Debug grid completo */}
                    {showDebugGrid && (
                        <>
                            {/* Indicador de inserción visual */}
                            {draggingId && insertionPosition && (
                                <InsertionIndicator
                                    position={{ x: insertionPosition.x, y: insertionPosition.y }}
                                    isHorizontal={insertionPosition.width > insertionPosition.height}
                                    width={insertionPosition.width}
                                    height={insertionPosition.height}
                                />
                            )}
                            {Array.from({ length: Math.max(10, Math.ceil(gridHeight / (cellHeight + spacing))) }).map((_, r) =>
                                Array.from({ length: numColumns }).map((_, c) => {
                                    const isOccupied = finalRenderItems.some(item => {
                                        const gPos = item.gridPosition;
                                        return gPos &&
                                            c >= gPos.col &&
                                            c < gPos.col + gPos.width &&
                                            r >= gPos.row &&
                                            r < gPos.row + gPos.height;
                                    });

                                    return (
                                        <View
                                            key={`dbg-${r}-${c}`}
                                            style={{
                                                position: 'absolute',
                                                left: c * (cellWidth + spacing),
                                                top: r * (cellHeight + spacing),
                                                width: cellWidth,
                                                height: cellHeight,
                                                borderWidth: 1,
                                                borderColor: isOccupied
                                                    ? 'rgba(0,150,0,0.4)'
                                                    : 'rgba(150,150,150,0.2)',
                                                backgroundColor: isOccupied
                                                    ? 'rgba(0,200,0,0.1)'
                                                    : 'rgba(200,200,200,0.05)'
                                            }}
                                        >
                                            <Text style={{
                                                fontSize: 9,
                                                color: isOccupied
                                                    ? 'rgba(0,100,0,0.8)'
                                                    : 'rgba(100,100,100,0.5)',
                                                textAlign: 'center',
                                                lineHeight: cellHeight / 2
                                            }}>
                                                {r},{c}
                                            </Text>
                                            {isOccupied && (
                                                <Text style={{
                                                    fontSize: 8,
                                                    color: 'rgba(0,100,0,0.8)',
                                                    textAlign: 'center',
                                                    lineHeight: cellHeight / 2
                                                }}>
                                                    ✓
                                                </Text>
                                            )}
                                        </View>
                                    );
                                })
                            )}

                            {(draggingId || resizingId) && (
                                <View style={{
                                    position: 'absolute',
                                    top: 10,
                                    left: 10,
                                    backgroundColor: 'rgba(0,0,0,0.9)',
                                    padding: 12,
                                    borderRadius: 6,
                                    minWidth: 220
                                }}>
                                    <Text style={{ color: '#00FF00', fontSize: 12, fontWeight: 'bold' }}>🎯 DEBUG</Text>
                                    <Text style={{ color: 'white', fontSize: 11 }}>Arrastrando: {draggingId ? draggingId.slice(0, 10) + '...' : '—'}</Text>
                                    <Text style={{ color: 'white', fontSize: 11 }}>Redimensionando: {resizingId ? resizingId.slice(0, 10) + '...' : '—'}</Text>
                                    <Text style={{ color: 'white', fontSize: 11 }}>Insertar en índice: {insertionIndex}</Text>
                                    <Text style={{ color: 'white', fontSize: 11 }}>Items sin arrastrado: {orderWithoutDragged.length}</Text>
                                    <Text style={{ color: 'white', fontSize: 11 }}>Items moviéndose: {shiftingItems.size}</Text>
                                    <Text style={{ color: 'white', fontSize: 11 }}>Preview items: {previewWrappers.length}</Text>
                                    <Text style={{ color: 'white', fontSize: 11 }}>Virtual layout: {virtualLayout.length}</Text>
                                    {insertionPosition && (
                                        <Text style={{ color: '#00AAFF', fontSize: 11 }}>📍 Línea: {Math.round(insertionPosition.x)}, {Math.round(insertionPosition.y)}</Text>
                                    )}
                                    {resizingSize && (
                                        <Text style={{ color: '#00AAFF', fontSize: 11 }}>🔳 Nuevo tamaño: {resizingSize.width} x {resizingSize.height} celdas</Text>
                                    )}
                                </View>
                            )}
                        </>
                    )}

                    {/* Items del grid */}
                    {finalRenderItems.map((pItem) => {
                        const id = pItem.id;
                        const isDragged = id === draggingId;
                        const isResizing = id === resizingId;
                        const isShifting = shiftingItems.has(id);

                        const userPositioned: any = { ...pItem };

                        return (
                            <GridItem
                                key={id}
                                item={userPositioned}
                                renderItem={renderItem as any}
                                onPress={() => onItemPress?.(userPositioned)}
                                onLongPress={() => onItemLongPress?.(userPositioned)}
                                isDragEnabled={isDragEnabled}
                                isResizeEnabled={isResizeEnabled}
                                resizeColor={resizeColor}
                                isDragging={isDragged}
                                isResizing={isResizing}
                                isShifting={isShifting}
                                cellWidth={cellWidth}
                                cellHeight={cellHeight}
                                onGestureStart={(iid, style) => runOnJS(onGestureStartJS)(iid, style)}
                                onGestureMove={(iid, dx, dy) => runOnJS(onGestureMoveJS)(iid, dx, dy)}
                                onGestureEnd={(iid, dx, dy) => runOnJS(onGestureEndJS)(iid, dx, dy)}
                                onResizeStart={(iid, style) => runOnJS(onResizeStartJS)(iid, style)}
                                onResizeMove={(iid, dx, dy) => runOnJS(onResizeMoveJS)(iid, dx, dy)}
                                onResizeEnd={(iid, dx, dy) => runOnJS(onResizeEndJS)(iid, dx, dy)}
                            />
                        );
                    })}
                </View>
            </ScrollView>
        </GestureHandlerRootView>
    );
};

export default MasonryGrid;
