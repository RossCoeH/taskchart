import React, {
	createContext,
	useContext,
	LegacyRef,
	ReactSVGElement,
	RefObject,
	useMemo,
	useRef,
	useState,
	ReactNode,
} from 'react'
import * as _ from 'lodash'

import { Group } from '@visx/group'
// import { curveBasis } from '@visx/visx'
// import { LinePath } from '@visx/visx'
// import { XYChart } from '@visx/visx'
import { scaleTime, scaleLinear, Links, LinePath } from '@visx/visx'
import { AxisTop, AxisBottom } from '@visx/visx' ///axis'
import { GridRows, GridColumns, Grid } from '@visx/visx'
//import react-spring from '@visx/react-spring'
import { localPoint } from '@visx/visx'
import { Point } from '@visx/visx'
import { useViewport } from 'react-viewport-hooks'
import { useAppSelector, useAppDispatch } from '../../app/hooks'
import { initialLayout } from './initValues'
import {
	decrement,
	increment,
	incrementByAmount,
	incrementAsync,
	incrementIfOdd,
	selectCount,
	selTasks,
	selLinks,
	EntArrayToAdapter,
	mouseOverItem,
	ISelItem,
	setMouseOverItem,
	resetMouseOverItem,
	toggleSelectedItem,
	selectedItems,
	linksAddOne,
	linksUpsertOne,
	tasksUpsertOne,
	getNextTaskId,
	getNextLinkId,
} from './seqSlice'
import { Link, Task, XY, SelTypes, ITaskDtl, ILayout } from './seqTypes'
import styles from './Seq.module.scss'
import { useSelector } from 'react-redux'
import {
	createEntityAdapter,
	Dictionary,
	EntityId,
	EntityState,
} from '@reduxjs/toolkit'
import TaskBar from './TaskBar'
import { initTasksArray, initLinksArray } from './initValues'
import { link } from 'fs'
import { DragContext, IDragContext } from './dragContext'
import PortDot from './PortDot'
import PortTriangle from './PortTriangle'
import DrawPath from './DrawPath'
import { JsxElement } from 'typescript'
import MakeDrawLinks from './MakeDrawLinks'

export const background = '#f3f3f3'

// interface SvgRef{SVGElement |undefined)}

const toNum2 = (num: number | undefined | typeof NaN) => {
	return num !== undefined && !isNaN(num) ? num.toFixed(2) : ' '
}

enum dragAction {
	none = 'none',
	dragLine = 'dragLine',
	canCreateLink = 'canCreateLink',
	pan = 'pan',
}

export function Seq() {
	const count = useAppSelector(selectCount)
	const dispatch = useAppDispatch()
	const [incrementAmount, setIncrementAmount] = useState('2')
	const { vh, vw } = useViewport(/* object with options (if needed) */)
	//const [isDragging, setIsDragging] = useState(false)
	const [dragActionActive, setdragActionActive] = useState(dragAction.none)
	const [dragStart, setDragStart] = useState<XY | undefined>(undefined)
	const [mousepos, setMousepos] = useState<XY | undefined>(undefined)
	const graphAreaRef = useRef<SVGSVGElement | null>(null) // <SVGElement | React.LegacyRef<SVGElement>| null | undefined>() // ref for hart area
	const [activeTask, setActiveTask] = useState(undefined)
	const [iLayout, setIlayout] = useState(initialLayout)

	document.documentElement.style.setProperty('--vw', `${vw}px`)
	document.documentElement.style.setProperty('--vh', `${vh}px`)
	const incrementValue = Number(incrementAmount) || 0

	const [nextConnectorId, setNextConnectorId] = useState(2)
	const initialConnector = {
		id: 1,
		path: [
			{ x: 10, y: 1 },
			{ x: 50, y: 3 },
		],
	}
	const [connectors, setconnectors] = useState([initialConnector])
	const taskIds = useAppSelector((state) => state.seq.tasks.ids)
	const taskEnts = useAppSelector((state) => state.seq.tasks.entities) || {}
	const linkIds = useAppSelector((state) => state.seq.links.ids)
	const linkEnts = useAppSelector((state) => state.seq.links.entities)
	const linksAll = useAppSelector((state) => selLinks.selectAll(state))
	const mOverItem = useAppSelector(mouseOverItem)
	const nextLinkId = useAppSelector(getNextLinkId)
	const nextTaskId = useAppSelector(getNextTaskId)
	// linkEnts correctly interpreted as type Dictionary<Link> through as Dictionary<Link> but the
	//useAppSelector appears to have a type if Dictionary<Link>|undefined (coming from Redux)
	// console.log shows LinkEnts is giving a valid dictionary of objects
	//how do I typeguard the dictionary so that I can use .map

	//  const filtered = (ids: EntityId[], entities: EntityState<T>): any =>
	//         ids.map((id) => (entities as <T>)[id])

	// 	if (linkEnts!== undefined){
	// 		const output1 = linkEnts.map(link:any=>link.from)||[]
	// 		const output2 = linkEnts?.map(link=>link.from)
	// 	}
	//  both output1  & output2 have the same error: const linkEnts: Dictionary<Link>
	// Object is possibly 'undefined'.ts(2532)
	// Cannot invoke an object which is possibly 'undefined'.ts(2722)

	// then typing for link is
	// 	export interface Link{
	//   id:number,
	//   from:number
	//   to:number
	// }

	//console.log(`imported initTasks`, EntArrayToAdapter(initTasksArray))
	// accessors
	const time = (d: Task) => d.duration

	// helper function for undefined object in dictionaries stack overflow
	const propsSelector = (props: any) => {
		return Object.fromEntries(
			Object.entries(props).filter(([_, val]) => val !== undefined)
		)
	}

	let taskDtl = useMemo(() => {
		let taskD = new Map<number | string, ITaskDtl>()

		const getTaskDEndTime = (taskId: EntityId) => {
			if (taskId === undefined || taskD === undefined) return 0

			const index =taskIds.indexOf(taskId)
			const etime =
				taskD?.get(index)?.start ||
				0 + (taskD?.get(index)?.duration || 0) ||
				0
				console.log(`index ${index} -taskid ${taskId} -etime ${etime}`)
			console.log(`index ${index} taskD.get `, taskD.get(index) ,taskD)
			return etime
		}
		taskIds.map((taskid, index) => {
			const ctask = taskEnts[taskid]
			//	console.log(`index ${index} - task`, taskid, ctask)
			let fromTasks = linksAll.filter(
				(link) =>
					link.from == taskid &&
					taskIds.indexOf(link.from) < taskIds.indexOf(link.to)
			)

			const retTasks = linksAll.filter(
				(link) =>
					link.to == taskid &&
					taskIds.indexOf(link.from) > taskIds.indexOf(link.to)
			) //.map(link=>link.from)

			const toTasks = linksAll.filter((link) => link.to == taskid) //.map(link=>link.to)

			//  get start time - only those earlier than current will have defined times so ignore undefined values
			let startTime = 0
			toTasks.map((link) => {
				//const tDtl = 	(taskDtl && tid !==undefined&& taskDtl.hasOwnProperty(tid))? taskDtl[tid] :undefined
				const item = taskD.get(link.from)
				// console.log(`fromtasks.map item`, item)
				const endtime: number = (item?.start || 0) + (item?.duration || 0) || 0
				if (endtime && endtime > startTime) startTime = endtime
			})

			// now sort froms based on starttimes + duration of predecessor - earliest is last
			console.log(`fromTasks`, fromTasks)
			
			fromTasks.sort(
				(aTask, bTask) =>
				(	getTaskDEndTime(aTask.from) - getTaskDEndTime(bTask.from))*-1.0
			)

			if (ctask !== undefined && taskid !== undefined) {
				taskD.set(taskid, {
					id: ctask.id,
					name: ctask.name,
					duration: ctask.duration,
					index: index,
					froms: fromTasks,
					rets: retTasks,
					tos: toTasks,
					start: startTime,
				})
			}
		})
		console.log(`taskDtl`, taskD)

		return taskD
	}, [taskIds, taskEnts, linksAll])

	//end of taskDtl
	// bounds
	const defaultGraphMargin = { top: 0, right: 30, bottom: 50, left: 0 }
	const graphHeight = Math.max(taskIds.length + 1, 2) * iLayout.barSpacing
	// iLayout.graphWidth = isNaN(Number(vw)) ? 600 : Math.min(600, vw)
	// const graphMargin = defaultGraphMargin
	// const xMax = vw - margin.left - margin.right
	// const yMax = vh - margin.top - margin.bottom

	// scales
	const xScale = useMemo(
		() =>
			scaleLinear<number>({
				domain: [Math.min(0), 100], //TODO Math.max(...tasks.map(task=>task.duration*2))],
				range: [
					iLayout.graphX0,
					iLayout.graphWidth + iLayout.graphX0 - iLayout.graphPadRight,
				],
			}),
		[iLayout.graphX0, iLayout.graphWidth + iLayout.graphPadRight]
	)

	const yScale = scaleLinear<number>({
		domain: [0, taskIds.length + 1],
		range: [0, (taskIds.length + 1) * iLayout.barSpacing],
		//nice: true,
	})
	// xScale.range([0, xMax])
	// yScale.range([yMax, 0])
	//---------
	// svgMouse

	const gPoint = (e: React.MouseEvent) => {
		// get point relative to defined svg coords
		if (graphAreaRef !== null && graphAreaRef.current !== null) {
			const zpt = localPoint(graphAreaRef.current, e) || null
			if (zpt != null && zpt.x !== undefined && zpt.y != undefined)
				// console.log('getlocalpt', zpt)
				return zpt //early exit with valid point
		}
		return undefined // default fallback value
	}

	// console.log('gPoint x,y,ref ', rectRef.x, rectRef.y, graphAreaRef.current)
	// return { x: point.x, y: point.y }
	// return { x: point.x + graphPadLeft, y: point.y + graphPadTop }
	// }

	// const handleSvgTaskMouseDown = (x: number, y: number) => {
	// 	if (!isDragging) {
	// 		//only run if not already dragging as you can move over multiple elements
	// 		console.log('dragstart on task props', x, y)
	// 		//temporary lines are in unscaled coords
	// 		setDragStart({ x: x, y: y })
	// 		setIsDragging(true)
	// 	}
	// }

	const handleSvgMouseDown = (
		e: React.MouseEvent,
		x?: number,
		y?: number,
		senderType?: string,
		senderId?: number
	) => {
		// const { onDragStart, resetOnStart } = props
		if (e !== undefined) {
			e.stopPropagation()
			e.persist()
		}
		if (dragActionActive === dragAction.none) {
			//only run if not already dragging as you can move over multiple elements

			// console.log(
			// 	`dragstart from type ${senderType} ${senderId}, isDragging x,y`,
			// 	x,
			// 	y,
			// x && xScale.invert(x),y && yScale.invert(y)
			// )

			let point = { x, y }
			//check to see if x & y is given
			if (
				(x === undefined || y === undefined) &&
				graphAreaRef.current !== undefined
			) {
				if (graphAreaRef !== null) {
					if (
						graphAreaRef.current !== undefined &&
						graphAreaRef.current !== null
					) {
						let ppoint = localPoint(graphAreaRef.current, e)
						console.log(`mouseDown ppoint`, ppoint, ` from`, e.target)
						if (ppoint !== null && ppoint !== undefined) {
							setDragStart({ x: ppoint.x, y: ppoint.y })
						}
						console.log(`set dragstart at`, ppoint, ` from `, e.target)
						setdragActionActive(dragAction.dragLine)
					}
				} else {
					if (typeof x === 'number' && typeof y === 'number') {
						setDragStart({ x: x, y: y })
						setdragActionActive(dragAction.dragLine)
					}
				}
			}
		}
	}

	const handleSvgMouseUp = (
		e?: React.MouseEvent<Element, MouseEvent>,
		selInfo?: ISelItem //	|{x?: number,		y?: number}
	) => {
		let point: XY | undefined = undefined
		// console.log('preparing Mouse up- isDragging', isDragging)
		// const { onDragStart, resetOnStart } = props
		if (e !== undefined) {
			e.stopPropagation()
			console.log(`handleMouseMoveUp`, e, selInfo)
			const ev = e as React.MouseEvent<Element, MouseEvent>
			//use gPoint to get consistent ref point and avoid typo
			if (ev !== undefined) {
				point = ev && gPoint(ev) // fallback used to remove a null value
				setdragActionActive(dragAction.none)
				point && setMousepos(point)
			}
			// check if link avail
			const endItem = Math.floor(yScale.invert(mousepos?.y || 0))
			const startItem = Math.floor(yScale.invert(dragStart?.y || 0))
			let isLinkPossible = false

			const startTask = taskDtl.get(taskIds[startItem])
			const endTask = taskDtl.get(taskIds[endItem])
			isLinkPossible =
				startItem < endItem &&
				endTask?.froms.filter(
					(link) => linkEnts[link.id]?.from === startTask?.id
				).length === 0
			console.log(
				`MouseUp isLinkPossible`,
				startTask?.index,
				endTask?.index,
				isLinkPossible
			)
			if (
				dragActionActive === dragAction.dragLine &&
				isLinkPossible &&
				startTask?.id !== undefined &&
				endTask?.id !== undefined
			) {
				// setdragActionActive(dragAction.canCreateLink)
				//if (dragActionActive===dragAction.canCreateLink && !isLinkPossible &&startTask?.id && endTask?.id ) {
				const newID = nextLinkId
				//  if (linkEnts[newID]) {
				// 	 while
				// 	 console.log(`LinkID already in use`, newID, ' in ', linkIds)}
				console.log(
					`about to dispatch addlink id: ${nextLinkId}from ${startTask.name} to ${endTask.name}`
				)

				dispatch(
					linksAddOne({
						from: startTask?.id as number,
						to: endTask?.id as number,
						id: nextLinkId,
					})
				)
				setdragActionActive(dragAction.none)

				// now  cancel drag
				setDragStart(undefined)
				selInfo && dispatch(toggleSelectedItem(selInfo))
			}

			// if (dragActionActive===dragAction.canCreateLink && !isLinkPossible)	setdragActionActive(dragAction.none)
		}

		//const selInfo:ISelItem| = e ||undefined
		// else if(e as {x: number,		y: number}) {
		// 	// have been given x,y so use given values
		// 	if (e?.x? !== undefined && e.y !== undefined) {
		// 		point = { x, y } as XY
		// 	}
	}

	const handleSvgMouseMove = (e: React.MouseEvent, selInfo?: ISelItem) => {
		e.stopPropagation()
		e.persist()

		if (dragActionActive !== dragAction.none) {
			console.log('mouse Move - isDragging', dragActionActive)
			//use gPoint to get consistent ref point and avoid typo
			let mousePoint = gPoint(e)
			if (mousePoint === null) mousePoint = undefined
			// console.log('dragMove to position', mousePoint)
			if (mousePoint && dragActionActive === dragAction.dragLine) {
				//  check to see if a link can be made
				if (Math.floor(dragStart?.x || 0) < Math.floor(mousePoint?.x || 0)) {
					//  we have downward link attempt
				}
			}
			// mouse move is capturing mouse up so need to check buttons
			// cancel drag if mouse is up.
			if (e.buttons === 0) {
				console.log(`MouseMove button is up - selInfo -`, selInfo)
				handleSvgMouseUp(e, selInfo)

				// now  cancel drag
				setdragActionActive(dragAction.none)
				setDragStart(undefined)
			} else {
				//temporary lines are in unscaled coords
				setMousepos(mousePoint)
				console.log(
					'MouseMove started start, current, selInfo',
					dragStart,
					mousePoint
				)
				// setActiveTask(undefined)
				//if (dragActionActive == dragAction.none) {
				if (dragStart !== undefined && mousepos !== undefined) {
					// setMousepos(mousepos)
					// only add if points are not identical - use 0.1 of barSpacing
					if (
						Math.abs(dragStart.x - mousepos.x) > 0.05 ||
						Math.abs(dragStart.y - mousepos.y) > 0.05
					) {
						const newPath = {
							id: nextConnectorId,
							path: [
								{ x: dragStart.x, y: dragStart.y },
								{ x: mousepos.x, y: mousepos.y },
							],
						}
					}
					console.log(`mousemove, selInfo`, mousepos.x, mousepos.y, e.target)
					// const newConnectors = connectors.concat(newPath)

					// setconnectors(newConnectors)
					// setNextConnectorId(nextConnectorId + 1) // increment for next connector
				}
			}
			//}
		}
	}
	// end of drag
	//-svgMouse-

	const DragContextItem: IDragContext = {
		// handleSvgDragStart: handleSvgMouseDown,
		// handleSvgDragEnd: handleSvgMouseUp,
		// handleSvgDragMove: handleSvgMouseMove,
		xScale: xScale,
		yScale: yScale,
		drawingAreaRef: graphAreaRef,
		iLayout: iLayout,
	}
	const [dragcontext, setDragcontext] = useState(DragContextItem)

	const DrawDragLine = () => {
		if (dragActionActive === dragAction.none) return null
		const endSize = dragActionActive === dragAction.canCreateLink ? 5 : 2

		console.log(
			'dragActionActive, to mousepos.x',
			dragActionActive,
			yScale.invert(dragStart?.y || 0),
			yScale.invert(mousepos?.y || 0)
		)
		if (
			dragStart !== undefined &&
			mousepos !== undefined &&
			dragActionActive === dragAction.dragLine
		) {
			return (
				<>
					<line
						className='dragLine'
						x1={dragStart.x}
						y1={dragStart.y}
						x2={mousepos.x}
						y2={mousepos.y}
						stroke='purple'
						strokeWidth='2'
					/>
					<circle
						className='dragCircle'
						cx={mousepos.x}
						cy={mousepos.y}
						stroke='purple'
						strokeWidth='2'
						// fill='none'
						r={endSize}
					/>
				</>
			)
		} else {
			return null
		}
	}

	const DrawTopAxis = useMemo(
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
				hideZero={true}
			/>
		),
		[xScale, iLayout.graphWidth]
	)
	const DrawRectGrid = () => {
		const numYticks: number = taskIds.length + 1
		return (
			<Group>
				<GridRows
					scale={yScale}
					width={iLayout.graphWidth}
					height={graphHeight}
					stroke='#e0e0e0'
					numTicks={numYticks}
				/>
				<GridColumns
					scale={xScale}
					width={iLayout.graphWidth}
					height={graphHeight}
					stroke='#e0e0e0'
				/>
			</Group>
		)
	}

	const dragposTxt = `Mouse Down Start x= ${
		dragStart && toNum2(dragStart.x)
	} , ${dragStart && toNum2(dragStart.y)} scaled to ${
		(dragStart?.x && xScale.invert(dragStart.x))?.toFixed(1) || '-'
	}
	 , 	${(dragStart?.y && yScale.invert(dragStart.y)?.toFixed(1)) || '-'}`
	const mouseposTxt = `Mouse Move to  x= ${mousepos && toNum2(mousepos.x)} , ${
		mousepos && toNum2(mousepos.y)
	}  scaled to ${(mousepos?.x && xScale.invert(mousepos.x))?.toFixed(1) || '-'}
	 , 	${(mousepos?.y && yScale.invert(mousepos.y)?.toFixed(1)) || '-'}`

	// console.log(`taskIds, taskEnts`, taskIds, taskEnts)

	const TaskBars = () => {
		//useMemo(() => {
		const output = useMemo(
			() =>
				taskIds.map((id, index) => {
					//if (id ===undefined) {returnnull)}
					//	console.log(`taskEnts, id`, taskEnts, taskEnts[id])
					const taskItem = taskDtl.get(id)
					if (taskItem === undefined) {
						return <text>{`Undefined item at index ${index}`}</text>
					}
					const taskname: string = taskItem.name || ''
					// need to get start and end as xscale allows for left offsets and it gets double counted
					const xStart = xScale(taskItem.start)
					const xEnd = xScale(taskItem.duration + taskItem.start) || 0
					const ytop = index * iLayout.barSpacing + iLayout.barPad
					const barHeight = Math.round(iLayout.barSpacing - 2 * iLayout.barPad)

					const fill = 'pink'
					const handleLocalMouseDown = (e: React.MouseEvent) => {
						handleSvgMouseDown(e, undefined, undefined, SelTypes.TaskBar, index)
					}
					const handleLocalMouseUp = (
						e: React.MouseEvent,
						selInfo?: ISelItem
					) => {
						console.log(`Mouseup on taskbar `, selInfo)
						handleSvgMouseUp(e, selInfo)
					}

					return (
						<TaskBar
							key={`TaskBar ${taskItem.id}`}
							taskDtl={taskItem}
							ytop={ytop}
							index={index}
							barHeight={barHeight}
							xEnd={xEnd}
							xStart={xStart}
							fill={fill}
							onMouseDown={handleLocalMouseDown}
							onMouseMove={handleSvgMouseMove}
							onMouseUp={handleLocalMouseUp}
							iLayout={iLayout}
						></TaskBar>
					)
				}),
			[taskIds]
		)
		return <g>{output}</g>
	}

	const handleMouseEnter = (selInfo: ISelItem) => {
		//	console.log('entered Task - index:', index,taskDtl.id, e.target)
		dispatch(setMouseOverItem(selInfo))
		// onMouseEnter && onMouseEnter(e)
	}
	const handleMouseLeave = (selInfo: ISelItem) => {
		//	console.log('entered Task - index:', index,taskDtl.id, e.target)
		dispatch(resetMouseOverItem(selInfo))
		// onMouseEnter && onMouseEnter(e)
	}
	const handleMouseUp = (selInfo: ISelItem) => {
		//	console.log('entered Task - index:', index,taskDtl.id, e.target)
		dispatch(toggleSelectedItem(selInfo))
		debugger
		// onMouseEnter && onMouseEnter(e)
	}

	const DrawLinks = MakeDrawLinks(
		taskDtl,
		iLayout,
		xScale,
		yScale,
		handleMouseEnter,
		handleMouseLeave
	) // ,[taskDtl,iLayout,xScale,yScale] )

	const DrawInPorts = () => {
		const map2 = taskDtl.forEach(
			(task) =>
				task.tos.map((taskItem, index) => {
					let targetTask = taskDtl.get(taskItem.from)
					if (targetTask === undefined) return null
					const selInfo: ISelItem = {
						type: 'taskPortIn',
						id: targetTask.id,
						sname: `InPort${targetTask?.name} -port ${index}`,
						desc: `${targetTask?.name} -port ${index}`,
					}

					const handleMouseEnter = (
						e: React.MouseEvent<SVGElement, MouseEvent>
					) => {
						//	console.log(selInfo)
						e.preventDefault()
						dispatch(setMouseOverItem(selInfo))
						// onMouseEnter && onMouseEnter(e)
					}
					const handleMouseLeave = (
						e: React.MouseEvent<SVGElement, MouseEvent>
					) => {
						e.preventDefault()
						dispatch(resetMouseOverItem(selInfo))
					}
					// console.log(`PortIn selInfo`, selInfo,targetTask)
					return (
						<PortTriangle
							className='PortIn'
							x={targetTask.start - iLayout.portTriLength}
							y={
								index * iLayout.barSpacing +
								1 -
								iLayout.barPad * iLayout.portLinkVoffset * index
							}
							width={iLayout.portTriLength * iLayout.barSpacing}
							height={(iLayout.portTriLength / 2) * iLayout.barSpacing}
							fill={'green'}
							onMouseEnter={handleMouseEnter}
							onMouseLeave={handleMouseLeave}
							onMouseUp={(e) => handleMouseUp(selInfo)}
						/>
					)
				}) // end of tos map
		) //end of forEach task

		return <>{map2}</>
	}
	// const inPath=taskDtl.froms.map((port,index)=>
	//  const path ={

	//  }
	// return(<DrawLine
	// className='PortInPath'
	// data={path}
	// 		x={(data) => (data.x)}
	// 		y={(data) => (data.y)}
	// 		stroke={color || 'orange'}
	// 		fill='none'
	// 		strokeWidth='2'
	// 	x={start-iLayout.portTriLength}
	// 	y={ytop+0.2* barHeight+iLayout.barSpacing*iLayout.portLinkVoffset*index}
	// 	width={iLayout.portTriLength*iLayout.barSpacing}
	// 	height={iLayout.portTriLength/2*iLayout.barSpacing}
	// 	fill={'green'}
	// 	/>)
	// 	)

	const txtMouseOver = mOverItem
		? `Mouse Over type: ${mOverItem.type} - mouseOverid: ${mOverItem.id} - sname: ${mOverItem.sname}`
		: 'mouseOveritem:'

	const selectedList = useAppSelector(selectedItems)
	// -- render output starts
	return (
		<DragContext.Provider value={DragContextItem}>
			<div className='seq graphContainer'>
				<p>{dragposTxt} </p>
				<p>{mouseposTxt} </p>
				<p>{txtMouseOver}</p>
				<ul>
					{selectedList.map((item, index) => (
						<li key={index}>{item.sname}</li>
					))}
				</ul>
				<p>xScale: {(xScale(2) - xScale(1)).toFixed(2)}</p>
				<p>Selected item: </p>
				<svg
					width={
						iLayout.graphWidth + iLayout.graphPadLeft + iLayout.graphPadRight
					}
					height={iLayout.graphPadTop}
				>
					{DrawTopAxis}
				</svg>
				<svg
					x={iLayout.graphPadLeft}
					y={iLayout.graphPadTop}
					ref={graphAreaRef}
					width={
						iLayout.graphWidth + iLayout.graphPadLeft + iLayout.graphPadRight
					}
					height={graphHeight + iLayout.graphPadTop + iLayout.graphPadBottom}
				>
					<rect
						x={0}
						y={0}
						width={iLayout.graphWidth}
						height={graphHeight}
						fill={background}
						rx={14}
						onMouseDown={handleSvgMouseDown}
						onMouseUp={handleSvgMouseUp}
						onMouseMove={handleSvgMouseMove}
					/>
					<DrawRectGrid />
					<TaskBars />
					{/* <DrawInPorts /> */}
					{/* 
					<DrawOutPorts/> */}
					{DrawLinks}
					<DrawDragLine />

					<text x='-70' y='15' transform='rotate(0)' fontSize={10}>
						Time (Sec)
					</text>
				</svg>
			</div>
		</DragContext.Provider>
	)
}
