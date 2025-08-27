'use dom'

import '@/global.css';
import { DOMProps } from 'expo/dom';
import { useState } from 'react';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';

interface GridDomComponentProps {
    itemHeight: number;
    containerHeight: number;
    containerWidth: number;
    dom?: DOMProps
}
const GridDomComponent = ({ itemHeight, containerHeight, containerWidth }: GridDomComponentProps) => {
    const [layout, setLayout] = useState([
        { i: '1', x: 0, y: Infinity, w: 1, h: 1 },
        { i: '2', x: 0, y: Infinity, w: 1, h: 1 },
        { i: '3', x: 0, y: Infinity, w: 1, h: 1 },
        { i: '4', x: 0, y: Infinity, w: 1, h: 1 },
        { i: '5', x: 0, y: Infinity, w: 1, h: 1 },
      ]);

    return (
        <div className='flex-1 bg-red-500 w-full h-full'>
            <GridLayout
                className="bg-orange-500 flex-1 w-full"
                style={{ height: containerHeight }}
                onLayoutChange={(newLayout) => setLayout(newLayout)}
                layout={layout}
                cols={3}       // número de columna
                rowHeight={itemHeight} // alto por fila en px
                width={containerWidth}
                isDraggable={true}
                isResizable={true}
                isBounded={true}
                compactType={null}

                preventCollision={true}
            >
                {
                    layout.map((item) => (
                        <div key={item.i} className='bg-lime-500'>
                            {item.i}
                        </div>
                    ))
                }
            </GridLayout>
        </div>
    )
}

export default GridDomComponent
