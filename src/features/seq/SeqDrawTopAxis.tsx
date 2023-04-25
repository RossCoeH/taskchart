import React, { FC, useMemo } from 'react';
import { AxisScale, AxisScaleOutput, AxisTop, } from '@visx/axis'	;
import {scaleLinear } from '@visx/scale'	;
import {Zoom} from '@visx/zoom'
import {ProvidedZoom,TransformMatrix} from '@visx/zoom/lib/types'
import { ILayout } from './seqTypes';
import {ScaleLinear} from 'd3-scale'

interface IxScale{
domain:number[],
range:number[]
}

declare type ZoomState = {
    initialTransformMatrix: TransformMatrix;
    transformMatrix: TransformMatrix;
    isDragging: boolean;
};

interface ISeqDrawTopAxisProps{
iLayout: ILayout, xScale: AxisScale<AxisScaleOutput>,
translatePx?:number,
zoomScale?:number
}


export const SeqDrawTopAxis =({iLayout,xScale,translatePx,
zoomScale}:ISeqDrawTopAxisProps)=> {
	return useMemo(
		() => { 
       const innerZoomScale=zoomScale||1.0
			 const innerTranslatePx=translatePx||0.0
   

			return (<AxisTop
				axisClassName='graphaxis'
				top={iLayout.graphPadTop - 1}
				label='Time (sec)'
				labelOffset={15}
				scale={xScale}
				numTicks={iLayout.graphWidth > 520 ? 10 : 5}
				stroke='rgb(0,10,10)'
				strokeWidth='2px'
				hideZero={false} 
				left={0} //move across by stroke width to align with grid
				/>
		)},
		[ xScale, iLayout.graphWidth ]
	);
}
