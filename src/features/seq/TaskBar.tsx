import React, {
	ReactSVGElement,
	SVGProps,
	useContext,
	useMemo,
	useState,
} from 'react'
import { Task, ILayout, ITaskDtl } from './seqTypes'
import { scaleLinear, BarRounded } from '@visx/visx'
import PortDot from './PortDot'
import PortTriangle from './PortTriangle'
import { DragContext } from './dragContext'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import {
	ISelItem,
	mouseOverItem,
	resetMouseOverItem,
	selectedItems,
	setMouseOverItem,
	toggleSelectedItem,
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
	onMouseEnter?: React.MouseEventHandler<SVGRectElement>
	onMouseLeave?: React.MouseEventHandler<SVGRectElement>
	iLayout: ILayout
}

const TaskBar = (props: ITaskBar) => {
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
	} = props

	const dispatch = useAppDispatch()
	const appMouseOverItem = useAppSelector(mouseOverItem)
	const appSelectedItem = useAppSelector(selectedItems)

	var classNames = require('classnames/bind')

	// draw a taskbar
	const label = taskDtl.name || 'myRect' + index

	const selInfo: ISelItem = {
		type: 'taskRect',
		id: taskDtl.id,
		sname: `Task${taskDtl.id}`,
		desc: taskDtl.name,
	}
	const handleMouseEnter = (e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
	
		dispatch(setMouseOverItem(selInfo))
		// console.log('entered Task - index:', index,selInfo)
	}
	const handleMouseLeave = (e: React.MouseEvent<SVGElement, MouseEvent>) => {
	// console.log('left Task - index:', index,selInfo)
		dispatch(resetMouseOverItem(selInfo))
	}
	const handleMouseDown = (e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
			e && onMouseDown && onMouseDown(e)
		//console.log('MouseDown Task - index:', index, selInfo)
		//	dispatch(resetMouseOverItem(selInfo))
	}
	const handleMouseUp = (e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
		// console.log('MouseUp Task - index:', index, selInfo)
	
		if(appMouseOverItem?.sname === selInfo.sname){
	
		selInfo && onMouseUp && dispatch(toggleSelectedItem (selInfo))
		} else{ 	onMouseUp && onMouseUp(e)}
		//	dispatch(resetMouseOverItem(selInfo))
	}
	const handleMouseMove = (e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
		// console.log('MouseMove Task - index:', index, selInfo)
  onMouseMove && onMouseMove(e,selInfo)
	}

	let classname =
		appMouseOverItem?.sname === selInfo.sname ? styles.ishover : styles.taskbar
    if(appSelectedItem && appSelectedItem?.filter(
			item =>item?.sname === selInfo.sname).length>0) classname= classname +' ' + styles.isselected
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
				//fill={fill || 'lightblue'}

				// handleDragStart:{handleSvgTaskMouseDown}
				// handleSvgTaskMouseDown:{handleSvgTaskMouseDown}
				// onMouseDown:{handleSvgMouseDown}
			onMouseDown={handleMouseDown}
			onMouseUp={handleMouseUp}
				onMouseMove={handleMouseMove}
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
