import React from 'react'
import {LinePath} from '@visx/visx'
import {XY} from './seqTypes'
import {scaleLinear} from '@visx/visx'

export interface IDrawPath{
  path:(XY[]), 
	id:string|number, 
	color:string,
	cornerRadius:number
	xScale:any,
	yScale:any,
}

const DrawPath:React.FC<IDrawPath>= ({path, id, color,xScale,yScale})  => {
	const bezierWeight = 0.175
	return (
		<LinePath
			//curve={curveLinear}  curveLinear is the default so do not need to specify
			data={path}
			x={(data) => (data.x)}
			y={(data) => (data.y)}
			stroke={color || 'orange'}
			fill='none'
			strokeWidth='2'
			radius='4'
		/>
	)
}

export default DrawPath