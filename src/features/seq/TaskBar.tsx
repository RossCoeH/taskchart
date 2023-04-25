import React, {
	ReactSVGElement,
	SVGProps,
	useContext,
	useMemo,
	useState,
} from 'react'
import { Task, ILayout, ITaskDtl, e_SeqDiagElement } from './seqTypes'
import {BarRounded } from '@visx/shape'
import { scaleLinear } from '@visx/scale'
import PortDot from './PortDot'
import PortTriangle from './PortTriangle'
import { DragContext } from './dragContext'
import { useAppDispatch, useAppSelector } from '../../app/hooks/hooks'
import {
	ISelItem,
	mouseDownInItem,
	mouseOverItem,
	resetMouseOverItem,
	selectedItems,
	setMouseDownInItem,
	setMouseOverItem,
	setSelectedItem,
	toggleDiagSelectedItem,
} from './seqSlice'
import styles from './TaskBar.module.css'
import clsx from 'clsx'
import { useSelector } from 'react-redux'

interface ITaskBar {
	taskDtl: ITaskDtl
	ytop: number
	index: number
	barHeight: number
	xEnd: number
	xStart: number
	//props:React.SVGProps<SVGRect>,
	fill?: string
	children?: React.ReactNode | null

	onMouseDown?: React.MouseEventHandler<SVGRectElement>
	onMouseUp?: React.MouseEventHandler<SVGRectElement> //& (ISelItem|undefined)
	onMouseMove?: any // React.MouseEventHandler<SVGRectElement>& (ISelItem|undefined)
	// onMouseEnter?: React.MouseEventHandler<SVGRectElement>
	// onMouseLeave?: React.MouseEventHandler<SVGRectElement>
	iLayout: ILayout
	extraClasses:string
}

const TaskBar = (props:any) => {
	const {
		taskDtl,
		ytop,
		index,
		barHeight,
		xEnd,
		xStart,
		fill,
		onMouseDown,
		onMouseUp,
	onMouseMove,
		iLayout,
		extraClasses
	} = props

	const dispatch = useAppDispatch()
	//const appMouseOverItem = useAppSelector(mouseOverItem)
	//const appMouseDownInItem = useAppSelector(mouseDownInItem)
	const appSelectedItem = useAppSelector(selectedItems)

	var classNames = require('classnames/bind')

	// draw a taskbar
	const label = taskDtl.name || 'myTask' + index

	const selInfo: ISelItem = {
		type: e_SeqDiagElement.TaskBar,
		id: taskDtl.id,
		sname: `Task${taskDtl.id}`,
		desc: taskDtl.name,
	}
	const handleMouseEnter = (
		e: React.MouseEvent<SVGRectElement, MouseEvent>
	) => {	
	//	console.log('entered Task - index:', index,selInfo,extraClasses)
	e.persist()
		dispatch(setMouseOverItem(selInfo))

	}
	const handleMouseLeave = (e: React.MouseEvent<SVGElement, MouseEvent>) => {
	// console.log('MouseLeave Task - index:', index,selInfo)
		dispatch(resetMouseOverItem(selInfo))
	}
	const handleMouseDown = (e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
		
		e && onMouseDown && onMouseDown(e)

		{console.log('MouseDown Task - index:', index, selInfo)
		e.persist()
		dispatch(setMouseDownInItem(selInfo))}
	}
	const handleMouseUp = (e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
//		console.log('MouseUp Task - index:', index, selInfo)

	/* 	if (appMouseDownInItem?.sname === selInfo.sname) {
			console.log(`Mouse Down& Up in same element`,selInfo.sname, selInfo)
			selInfo && onMouseUp && dispatch(setSelectedItem(selInfo))
		} else {
			onMouseUp && onMouseUp(e)
		} */
		//	dispatch(resetMouseOverItem(selInfo))
	}

	const handleMouseMove = (e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
//		console.log('MouseMove Task - index:', index, selInfo)
		onMouseMove && onMouseMove(e, selInfo)
	}

	let classname =styles.taskbar
	//	appMouseOverItem?.sname === selInfo.sname //? styles.ishover : styles.taskbar
	/* if (
		appSelectedItem &&
		appSelectedItem?.filter((item) => item?.sname === selInfo.sname).length > 0
	)
		classname = classname + ' ' + styles.isselected +extraClasses??""
	//	console.log("MouseMove taskBar", selInfo.sname) */
	return (
		<>
			<rect
				className={classname}
				rx={2}
				key={`tbar-${label}`}
				x={xStart}
				y={ytop}
				width={xEnd - xStart}
				height={barHeight}
		// pointerEvents=''
				//fill={fill || 'lightblue'}

				// handleDragStart:{handleSvgTaskMouseDown}
				// handleSvgTaskMouseDown:{handleSvgTaskMouseDown}
				// onMouseDown:{handleSvgMouseDown}
				 onMouseDown={handleMouseDown}
				onMouseUp={handleMouseUp}
		  onMouseMove={handleMouseMove}
				// onMouseEnter={handleMouseEnter}
				// onMouseLeave={handleMouseLeave}

				// 					onMouseDown:{props.handleDragStart}
				// onMouseMove:{props.handleDragMove}
				// onMouseUp:{props.handleDragEnd}
			/>
			{props.children}
		</>
	)
}

export default TaskBar
