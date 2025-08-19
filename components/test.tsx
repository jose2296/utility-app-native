// import React, { useCallback, useEffect, useMemo, useState } from 'react';
// import {
//     Dimensions,
//     StyleProp,
//     TouchableOpacity,
//     View,
//     ViewStyle
// } from 'react-native';
// import { ScrollView } from 'react-native-gesture-handler';

// // Hook para obtener dimensiones de pantalla
// const useScreenDimensions = () => {
//     const [dimensions, setDimensions] = useState(Dimensions.get('window'));

//     useEffect(() => {
//         const subscription = Dimensions.addEventListener('change', ({ window }) => {
//             setDimensions(window);
//         });
//         return () => subscription?.remove();
//     }, []);

//     return dimensions;
// };

// type PositionedItem<T> = T & {
//     gridPosition: { row: number, col: number, width: number, height: number }
//     style: {
//         position: string,
//         left: number,
//         top: number,
//         width: number,
//         height: number,
//     }
// }

// interface useMasonryGridLayoutProps<T> {
//     data: T[];
//     numColumns: number;
//     numRows?: number;
//     spacing: number;
//     contentWidth: number;
//     contentHeight: number;
//     keyExtractor: (item: T, index: number) => string;
// }
// // Algoritmo para organizar elementos en grid masonry
// const useMasonryGridLayout = <T,>({data, numColumns, numRows, spacing, contentWidth, contentHeight, keyExtractor}: useMasonryGridLayoutProps<T>): { layoutData: PositionedItem<T>[], gridHeight: number, cellWidth: number, cellHeight: number } => {
//     const [layoutData, setLayoutData] = useState<PositionedItem<T>[]>([]);
//     const [gridHeight, setGridHeight] = useState(0);

//     // const contentWidth = useScreenDimensions().width;

//     // Calcular width de celda base
//     const cellWidth = useMemo(() => {
//         const totalSpacing = spacing * (numColumns - 1);
//         return Math.floor((contentWidth - totalSpacing) / numColumns);
//     }, [contentWidth, numColumns, spacing]);
//     // calcular height de celda base
//     const cellHeight = useMemo(() => {
//         if (numRows) {
//             const totalSpacing = spacing * (numRows - 1);
//             return Math.floor((contentHeight - totalSpacing) / numRows);
//         }

//         return cellWidth;
//     }, [contentHeight, numRows, spacing]);

//     const calculateLayout = useCallback(() => {
//         if (!data || data.length === 0) {
//             setLayoutData([]);
//             setGridHeight(0);
//             return;
//         }

//         // Crear grid para tracking de ocupación
//         const maxRows = numRows || Math.floor(data.length * 2); // Estimación generosa de filas
//         const occupiedGrid = Array(maxRows).fill(null).map(() => Array(numColumns).fill(false));

//         const positionedItems: PositionedItem<T>[] = [];
//         let currentMaxRow = 0;

//         data.forEach((item, index) => {
//             const { width: w, height: h } = (item as any).size;

//             // Validar que el tamaño no exceda las columnas
//             if (w > numColumns) {
//                 console.warn(`Item ${index} tiene ancho ${w} que excede las ${numColumns} columnas`);
//                 return;
//             }
//             if (h > 11) {
//                 console.warn(`Item ${index} tiene alto ${h} que excede las ${11} filas`);
//                 return;
//             }

//             let placed = false;
//             let row = 0;

//             // Buscar la primera posición disponible
//             while (!placed && row <( maxRows + 1) - h) {
//                 for (let col = 0; col <= numColumns - w; col++) {
//                     // Verificar si el espacio está libre
//                     let canPlace = true;
//                     for (let r = row; r < row + h && canPlace; r++) {
//                         for (let c = col; c < col + w && canPlace; c++) {
//                             if (occupiedGrid[r][c]) {
//                                 canPlace = false;
//                             }
//                         }
//                     }

//                     if (canPlace) {
//                         // Marcar celdas como ocupadas
//                         for (let r = row; r < row + h; r++) {
//                             for (let c = col; c < col + w; c++) {
//                                 occupiedGrid[r][c] = true;
//                             }
//                         }

//                         // Calcular posición y tamaño en píxeles
//                         const x = col * (cellWidth + spacing);
//                         const y = row * (cellHeight + spacing);
//                         const itemWidth = w * cellWidth + (w - 1) * spacing;
//                         const itemHeight = h * cellHeight + (h - 1) * spacing;

//                         positionedItems.push({
//                             ...item,
//                             id: keyExtractor(item, index) || `item-${index}`,
//                             gridPosition: { row, col, width: w, height: h },
//                             style: {
//                                 position: 'absolute',
//                                 left: x,
//                                 top: y,
//                                 width: itemWidth,
//                                 height: itemHeight,
//                             },
//                         });

//                         currentMaxRow = Math.max(currentMaxRow, row + h);
//                         placed = true;
//                         break;
//                     }
//                 }
//                 row++;
//             }

//             if (!placed) {
//                 console.warn(`No se pudo ubicar el item ${index} con tamaño ${w}x${h}`);
//             }
//         });

//         setLayoutData(positionedItems);
//         setGridHeight(maxRows * (cellHeight + spacing) - spacing); // +40 padding bottom
//     }, [data, numColumns, cellWidth, spacing]);

//     useEffect(() => {
//         calculateLayout();
//     }, [calculateLayout]);

//     return { layoutData, gridHeight, cellWidth, cellHeight };
// };

// interface GridItemProps<T> {
//     item: PositionedItem<T>;
//     onPress?: (item: PositionedItem<T>) => void;
//     onLongPress?: (item: PositionedItem<T>) => void;
//     colors?: string[];
//     renderItem: (item: PositionedItem<T>) => React.ReactNode;
// }
// // Componente para item individual
// const GridItem = React.memo(({
//     item,
//     onPress,
//     onLongPress,
//     colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'],
//     renderItem
// }: GridItemProps<any>) => {
//     const { width: w, height: h } = item.size;
//     const sizeText = `${w}×${h}`;

//     // Seleccionar color basado en el tamaño para consistencia visual
//     const colorIndex = (w + h) % colors.length;
//     const backgroundColor = item.backgroundColor || colors[colorIndex];

//     // Determinar tamaño de texto basado en el tamaño del elemento
//     const fontSize = Math.min(item.style.width, item.style.height) / 4;
//     const textSize = Math.max(12, Math.min(24, fontSize));

//     return (
//         <TouchableOpacity
//             style={[
//                 item.style,
//             ]}
//             onPress={() => onPress?.(item)}
//             onLongPress={() => onLongPress?.(item)}
//             activeOpacity={0.7}
//         >
//             {renderItem(item)}
//         </TouchableOpacity>
//     );
// });

// interface MasonryGridProps<T> {
//     data: T[];
//     numColumns?: number;
//     numRows?: number;
//     spacing?: number;
//     containerPadding?: number;
//     onItemPress?: (item: PositionedItem<T>) => void;
//     onItemLongPress?: (item: PositionedItem<T>) => void;
//     colors?: string[];
//     style?: StyleProp<ViewStyle>;
//     contentContainerStyle?: StyleProp<ViewStyle>;
//     showDebugGrid?: boolean;
//     keyExtractor: (item: T, index: number) => string;
//     renderItem: (item: PositionedItem<T>) => React.ReactNode;
//     contentWidth: number;
//     contentHeight: number;
// }
// // Componente principal MasonryGrid
// const MasonryGrid = <T,>({
//     data = [],
//     numColumns = 4,
//     numRows,
//     spacing = 8,
//     onItemPress,
//     onItemLongPress,
//     colors,
//     style,
//     contentContainerStyle,
//     showDebugGrid = false,
//     renderItem,
//     keyExtractor,
//     contentWidth,
//     contentHeight,
// }: MasonryGridProps<T>) => {
//     const { layoutData, gridHeight, cellWidth, cellHeight } = useMasonryGridLayout<T>({
//         data,
//         numColumns,
//         numRows,
//         spacing,
//         contentWidth,
//         contentHeight,
//         keyExtractor
//     });

//     const handleItemPress = useCallback((item: PositionedItem<T>) => {
//         onItemPress?.(item);
//     }, [onItemPress]);

//     const handleItemLongPress = useCallback((item: PositionedItem<T>) => {
//         onItemLongPress?.(item);
//     }, [onItemLongPress]);

//     // Renderizar grid de debug (opcional)
//     const renderDebugGrid = () => {
//         if (!showDebugGrid) return null;

//         const rows = Math.ceil(gridHeight / (cellHeight + spacing));
//         const gridItems = [];

//         for (let row = 0; row < rows; row++) {
//             for (let col = 0; col < numColumns; col++) {
//                 gridItems.push(
//                     <View
//                         key={`debug-${row}-${col}`}
//                         style={{
//                             position: 'absolute',
//                             left: col * (cellWidth + spacing),
//                             top: row * (cellHeight + spacing),
//                             width: cellWidth,
//                             height: cellHeight,
//                             borderWidth: 1,
//                             borderColor: 'rgba(255, 0, 0, 0.2)',
//                             backgroundColor: 'rgba(255, 0, 0, 0.05)',
//                         }}
//                     />
//                 );
//             }
//         }

//         return gridItems;
//     };

//     return (
//         <ScrollView
//             style={[{ flex: 1 }, style]}
//             // contentContainerStyle={contentContainerStyle}
//             // showsVerticalScrollIndicator={false}
//             // className='bg-red-500'
//             // contentContainerClassName='bg-red-50'
//         >
//             <View style={{
//                 height: gridHeight,
//                 position: 'relative',
//                 width: '100%',
//             }}>
//                 {/* Grid de debug */}
//                 {renderDebugGrid()}

//                 {/* Items del masonry */}
//                 {layoutData.map((item, index) => (
//                     <GridItem
//                         key={keyExtractor(item, index)}
//                         item={item}
//                         onPress={handleItemPress}
//                         onLongPress={handleItemLongPress}
//                         colors={colors}
//                         renderItem={renderItem}
//                     />
//                 ))}
//             </View>
//         </ScrollView>
//     );
// };

// export default MasonryGrid;






// MasonryGrid.tsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ScrollView,
    StyleProp,
    TouchableOpacity,
    View,
    ViewStyle
} from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated';

/**
 * MasonryGrid.tsx
 * - Single-file Masonry grid with drag & drop (no preview)
 * - Uses Gesture + Reanimated worklets
 * - Drop reorders items (onItemsReorder called con nuevo array)
 *
 * Requisitos:
 * - react-native-reanimated v2+ (runOnJS, useSharedValue...)
 * - react-native-gesture-handler (Gesture, GestureDetector)
 * - Configura correctamente Reanimated (plugin de babel)
 */

/* ---------------------- Types ---------------------- */
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
  originalIndex: number; // índice en el array original de data (para mapear fácilmente)
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
  onItemPress?: (item: PositionedItem<T>) => void;
  onItemLongPress?: (item: PositionedItem<T>) => void;
  style?: StyleProp<ViewStyle>;
  showDebugGrid?: boolean;
  isDragEnabled?: boolean;
  onItemsReorder?: (newData: T[]) => void;
};

/* -------------------- Hook: useMasonryGridLayout -------------------- */
/*
  Calcula layout tipo masonry capaz de leer item.size = {width, height} (en celdas)
  Devuelve layoutData con originalIndex para facilitar reorder.
*/
function useMasonryGridLayout<T>({
  data,
  numColumns,
  numRows,
  spacing,
  contentWidth,
  contentHeight,
  keyExtractor
}: {
  data: T[];
  numColumns: number;
  numRows?: number;
  spacing: number;
  contentWidth: number;
  contentHeight: number;
  keyExtractor: (item: T, index: number) => string;
}) {
  const [layoutData, setLayoutData] = useState<PositionedItem<T>[]>([]);
  const [gridHeight, setGridHeight] = useState(0);

  const cellWidth = useMemo(() => {
    const totalSpacing = spacing * (numColumns - 1);
    return Math.floor((contentWidth - totalSpacing) / numColumns);
  }, [contentWidth, numColumns, spacing]);

  const cellHeight = useMemo(() => {
    if (numRows) {
      const totalSpacing = spacing * (numRows - 1);
      return Math.floor((contentHeight - totalSpacing) / numRows);
    }
    return cellWidth;
  }, [contentHeight, numRows, spacing, cellWidth]);

  const calculateLayout = useCallback(() => {
    if (!data || data.length === 0) {
      setLayoutData([]);
      setGridHeight(0);
      return;
    }

    const maxRows = numRows || Math.ceil(data.length * 1.5);
    const occupiedGrid = Array.from({ length: maxRows }, () => Array(numColumns).fill(false));

    const positionedItems: PositionedItem<T>[] = [];
    let currentMaxRow = 0;

    data.forEach((item, index) => {
      const size = (item as any).size || { width: 1, height: 1 };
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

            const positioned: PositionedItem<T> = {
              ...(item as any),
              id: keyExtractor(item, index) || `item-${index}`,
              originalIndex: index,
              gridPosition: { row, col, width: w, height: h },
              style: {
                position: 'absolute',
                left: x,
                top: y,
                width: itemWidth,
                height: itemHeight
              }
            } as PositionedItem<T>;

            positionedItems.push(positioned);
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

    setLayoutData(positionedItems);
    setGridHeight(currentMaxRow * (cellHeight + spacing));
  }, [data, numColumns, numRows, cellWidth, cellHeight, spacing, keyExtractor]);

  useEffect(() => {
    calculateLayout();
  }, [calculateLayout]);

  return { layoutData, gridHeight, cellWidth, cellHeight };
}

/* -------------------- GridItem (draggable) -------------------- */
type GridItemProps<T> = {
  item: PositionedItem<T>;
  renderItem: (item: PositionedItem<T>) => React.ReactNode;
  onPress?: (item: PositionedItem<T>) => void;
  onLongPress?: (item: PositionedItem<T>) => void;
  isDragEnabled?: boolean;
  isDragging?: boolean;
  isAnyDragging?: boolean;
  onDragStart?: (item: PositionedItem<T>) => void;
  onDragMove?: (item: PositionedItem<T>, dx: number, dy: number) => void;
  onDragEnd?: (item: PositionedItem<T>, dx: number, dy: number) => void;
};

const GridItem = React.memo(<T,>({
  item,
  renderItem,
  onPress,
  onLongPress,
  isDragEnabled = false,
  isDragging = false,
  isAnyDragging = false,
  onDragStart,
  onDragMove,
  onDragEnd
}: GridItemProps<T>) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const elevation = useSharedValue(1);

  // permitir pan solo si dragEnabled y (no hay otro drag o este es el que arrastra)
  const panEnabled = !!isDragEnabled && (!isAnyDragging || !!isDragging);

  // Crear gesto con la API moderna (Gesture.Pan)
  const panGesture = useMemo(() => {
    const g = Gesture.Pan()
      .onStart(() => {
        'worklet';
        if (!panEnabled) return;
        // notificar JS
        if (onDragStart) runOnJS(onDragStart)(item);
        scale.value = withSpring(1.06);
        elevation.value = withSpring(12);
      })
      .onUpdate((ev) => {
        'worklet';
        if (!panEnabled) return;
        translateX.value = ev.translationX;
        translateY.value = ev.translationY;
        if (onDragMove) runOnJS(onDragMove)(item, ev.translationX, ev.translationY);
      })
      .onEnd((ev) => {
        'worklet';
        if (!panEnabled) return;
        if (onDragEnd) runOnJS(onDragEnd)(item, ev.translationX, ev.translationY);
        // animar de vuelta a 0 (las coordenadas left/top se ajustarán por el nuevo layout si hubo reorder)
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        scale.value = withSpring(1);
        elevation.value = withSpring(1);
      });

    // si no habilitado, desactivar
    if (!panEnabled) return g.enabled(false);
    return g;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panEnabled, item, onDragStart, onDragMove, onDragEnd]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      // animar left/top con spring para transiciones suaves en reorden
      left: withSpring(item.style.left),
      top: withSpring(item.style.top),
      width: item.style.width,
      height: item.style.height,
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value }
      ],
      zIndex: isDragging ? 999 : 1,
      elevation: elevation.value
    } as any;
  }, [item.style.left, item.style.top, isDragging]);

  const content = (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={{ flex: 1 }}
        activeOpacity={0.85}
        onPress={() => !isDragging && onPress?.(item)}
        onLongPress={() => !isDragging && onLongPress?.(item)}
        disabled={isDragging}
      >
        {renderItem(item)}
      </TouchableOpacity>
    </Animated.View>
  );

  // Si el pan está activo, envolver con GestureDetector
  if (panEnabled) {
    return (
      <GestureDetector gesture={panGesture}>
        {content}
      </GestureDetector>
    );
  }

  return content;
});

/* -------------------- MasonryGrid (export default) -------------------- */
const MasonryGrid = <T,>({
  data = [],
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
  onItemsReorder
}: MasonryGridProps<T>) => {
  // layout actual (sin preview)
  const { layoutData, gridHeight, cellWidth, cellHeight } = useMasonryGridLayout<T>({
    data,
    numColumns,
    numRows,
    spacing,
    contentWidth,
    contentHeight,
    keyExtractor
  });

  // estado para saber quién se está arrastrando (solo id)
  const [draggingItem, setDraggingItem] = useState<PositionedItem<T> | null>(null);
  const isAnyDragging = !!draggingItem;

  // función: encuentra index del item más cercano al centro del arrastre
  const findClosestIndex = useCallback((finalX: number, finalY: number, dragging: PositionedItem<T>) => {
    const centerX = finalX + dragging.style.width / 2;
    const centerY = finalY + dragging.style.height / 2;

    let closestIndex = -1;
    let closestDistance = Infinity;

    layoutData.forEach((it, idx) => {
      if (it.id === dragging.id) return;
      const itemCenterX = it.style.left + it.style.width / 2;
      const itemCenterY = it.style.top + it.style.height / 2;
      const d = Math.hypot(centerX - itemCenterX, centerY - itemCenterY);
      if (d < closestDistance) {
        closestDistance = d;
        closestIndex = idx;
      }
    });

    return closestIndex; // puede ser -1 si no hay otros items
  }, [layoutData]);

  // drag lifecycle (serán llamados desde worklet via runOnJS)
  const handleDragStart = useCallback((item: PositionedItem<T>) => {
    setDraggingItem(item);
  }, []);

  const handleDragMove = useCallback((_item: PositionedItem<T>, _dx: number, _dy: number) => {
    // No hacemos preview dinámico; reservamos para futuros efectos visuales si quieres.
  }, []);

  const handleDragEnd = useCallback((item: PositionedItem<T>, dx: number, dy: number) => {
    if (!draggingItem) {
      setDraggingItem(null);
      return;
    }

    // posición final aproximada (left + translation)
    const finalX = item.style.left + dx;
    const finalY = item.style.top + dy;

    const closestIdx = findClosestIndex(finalX, finalY, draggingItem);

    // si no hay otro item -> nada que hacer
    if (closestIdx === -1) {
      setDraggingItem(null);
      return;
    }

    // Orden actual de ids según layoutData
    const orderedIds = layoutData.map(it => it.id);

    // El id del target (el elemento más cercano)
    const targetId = layoutData[closestIdx].id;

    // crear array sin el dragged id
    const arr = orderedIds.filter(id => id !== draggingItem.id);

    // índice donde insertar (antes del target)
    const targetPos = arr.findIndex(id => id === targetId);
    const insertAt = targetPos === -1 ? arr.length : targetPos;

    // insertar dragged id
    arr.splice(insertAt, 0, draggingItem.id);

    // Mapa id -> originalIndex (viene de layoutData)
    const idToOriginalIndex = new Map(layoutData.map(it => [it.id, it.originalIndex]));

    // Reconstruir newData en el nuevo orden
    const newData: T[] = arr.map(id => {
      const origIdx = idToOriginalIndex.get(id);
      // origIdx debería existir; fallback prudente:
      if (origIdx === undefined) return data[0];
      return data[origIdx];
    });

    // Llamar al callback con nuevo orden
    onItemsReorder?.(newData);

    // reset state dragging
    setDraggingItem(null);
  }, [draggingItem, findClosestIndex, layoutData, data, onItemsReorder]);

  // Debug grid render
  const renderDebugGrid = () => {
    if (!showDebugGrid) return null;
    const rows = Math.ceil(gridHeight / (cellHeight + spacing));
    const debug: React.ReactNode[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < numColumns; c++) {
        debug.push(
          <View
            key={`dbg-${r}-${c}`}
            style={{
              position: 'absolute',
              left: c * (cellWidth + spacing),
              top: r * (cellHeight + spacing),
              width: cellWidth,
              height: cellHeight,
              borderWidth: 1,
              borderColor: 'rgba(0,0,0,0.06)',
              backgroundColor: 'rgba(0,0,0,0.01)'
            }}
          />
        );
      }
    }
    return debug;
  };

  return (
    <GestureHandlerRootView style={[{ flex: 1 }, style]}>
      <ScrollView
        style={{ flex: 1 }}
        scrollEnabled={!isDragEnabled || !isAnyDragging}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ height: Math.max(gridHeight, contentHeight), position: 'relative', width: '100%' }}>
          {renderDebugGrid()}

          {layoutData.map((item) => {
            const isDragged = draggingItem?.id === item.id;
            return (
              <GridItem
                key={item.id}
                item={item}
                renderItem={renderItem}
                onPress={() => onItemPress?.(item)}
                onLongPress={() => onItemLongPress?.(item)}
                isDragEnabled={isDragEnabled}
                isDragging={isDragged}
                isAnyDragging={isAnyDragging}
                onDragStart={handleDragStart}
                onDragMove={handleDragMove}
                onDragEnd={handleDragEnd}
              />
            );
          })}
        </View>
      </ScrollView>
    </GestureHandlerRootView>
  );
}

/* Export por defecto */
export default MasonryGrid;
