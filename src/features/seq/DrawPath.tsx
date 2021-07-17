import React from 'react'
import {LinePath} from '@visx/visx'
import {XY} from './seqTypes'
import {scaleLinear} from '@visx/visx'
import { isJsxElement } from 'typescript'

export interface DrawPathProps{
  path:(XY[]), 
	id:string|number, 
	color:string,
	cornerRadius:number
}

const DrawLine:React.FC<DrawPathProps>= ({path, id, color})  => {
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