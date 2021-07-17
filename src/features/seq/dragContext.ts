
import { scaleLinear } from '@visx/visx'
import { createContext } from 'react'
import {ILayout} from './seqTypes'

export interface IDragContext{
	xScale(range:number,domain:number):number
		yScale(range:number,domain:number):number
		drawingAreaRef:React.MutableRefObject<SVGSVGElement | null>,
		iLayout: ILayout
} 

export const DragContext = createContext<IDragContext | undefined>(undefined)