import React from 'react'
import {LinePath} from '@visx/shape'
import {XY} from './seqTypes'
import {scaleLinear} from '@visx/scale'
import { isJsxElement } from 'typescript'

export interface DrawLineProps{
  path:(XY[]), id:string|number, color:string,
}

const DrawLine:React.FC<DrawLineProps>= ({path, id, color})  => {
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
		/>
	)
}