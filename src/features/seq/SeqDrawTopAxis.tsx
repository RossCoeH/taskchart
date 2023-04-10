import React, { useMemo } from 'react';
import { AxisScale, AxisScaleOutput, AxisTop, scaleLinear } from '@visx/visx'	;
import { ILayout } from './seqTypes';
import {ScaleLinear} from 'd3-scale'

interface IxScale{
domain:number[],
range:number[]
}

export function SeqDrawTopAxis(iLayout: ILayout, xScale: AxisScale<AxisScaleOutput>) {
	return useMemo(
		() => (
			<AxisTop
				axisClassName='graphaxis'
				top={iLayout.graphPadTop - 1}
				label='Time (sec)'
				labelOffset={15}
				scale={xScale}
				numTicks={iLayout.graphWidth > 520 ? 10 : 5}
				stroke='rgb(0,10,10)'
				strokeWidth='2px'
				hideZero={true} />
		),
		[ xScale, iLayout.graphWidth ]
	);
}
