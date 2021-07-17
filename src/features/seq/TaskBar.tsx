import React, { ReactSVGElement, SVGProps, useContext, useMemo } from 'react'
import { Task ,ILayout, ITaskDtl} from './seqTypes'
import { scaleLinear, BarRounded } from '@visx/visx'
import PortDot from './PortDot'
import PortTriangle from './PortTriangle'
import { DragContext } from './dragContext'
import { useAppDispatch } from '../../app/hooks'
import {ISelItem, resetMouseOverItem,setMouseOverItem} from './seqSlice'


interface ITaskBar {
	taskDtl:ITaskDtl
	ytop: number
	index: number
	barHeight: number
	barWidth: number
	start: number
	//props:React.SVGProps<SVGRect>,
	fill?: string
	children:React.ReactNode|null

	onMouseDown?: React.MouseEventHandler<SVGRectElement>
	onMouseUp?: React.MouseEventHandler<SVGRectElement>
	onMouseMove?: React.MouseEventHandler<SVGRectElement>
	onMouseEnter?: React.MouseEventHandler<SVGRectElement>
	onMouseLeave?: React.MouseEventHandler<SVGRectElement>
	iLayout:ILayout
}

const TaskBar = (props: ITaskBar) => {
	const {
		taskDtl,
		ytop,
		index,
		barHeight,
		barWidth,
		start,
		fill,
		onMouseDown,
		onMouseUp,
		onMouseMove,
		onMouseEnter,
		onMouseLeave,
		iLayout,
		
	} = props

  const dispatch = useAppDispatch();

	//  const DragContext=()=>useContext(DragContext)

	// draw a taskbar
	const label = taskDtl.name || 'myRect' + index
	//const width = DragContext.xScale(barWidth)

  const selInfo:ISelItem={type:'taskRect',id:taskDtl.id, name:taskDtl.name}
	const handleMouseEnter = (e: React.MouseEvent<SVGElement, MouseEvent>) => {
	//	console.log('entered Task - index:', index,taskDtl.id, e.target)
		dispatch(setMouseOverItem(selInfo))
		// onMouseEnter && onMouseEnter(e)
	}
		const handleMouseLeave = (e: React.MouseEvent<SVGElement, MouseEvent>) => {
	//	console.log('entered Task - index:', index,taskDtl.id, e.target)
		dispatch(resetMouseOverItem(selInfo))
		// onMouseEnter && onMouseEnter(e)
	}
	
	return (
		<>
		<rect
			className='bar task'
			rx={2}
			key={`tbar-${label}`}
			x={start}
			y={ytop}
			width={barWidth}
			height={barHeight}
			fill={fill || 'lightblue'}
			// handleDragStart:{handleSvgTaskMouseDown}
			// handleSvgTaskMouseDown:{handleSvgTaskMouseDown}
			// onMouseDown:{handleSvgMouseDown}
			onMouseDown={onMouseDown}
			onMouseUp={onMouseUp}
			onMouseMove={onMouseMove}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			// 					onMouseDown:{props.handleDragStart}
			// onMouseMove:{props.handleDragMove}
			// onMouseUp:{props.handleDragEnd}
		/>
{props.children}
		</>
	)
}

export default TaskBar
