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
} from './seqSlice'
import { Link, Task, XY, SelTypes, ITaskDtl } from './seqTypes'
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

export const background = '#f3f3f3'

// interface SvgRef{SVGElement |undefined)}

const toNum2 = (num: number | undefined | typeof NaN) => {
	return num !== undefined && !isNaN(num) ? num.toFixed(2) : ' '
}

export function Seq() {
	const count = useAppSelector(selectCount)
	const dispatch = useAppDispatch()
	const [incrementAmount, setIncrementAmount] = useState('2')
	const { vh, vw } = useViewport(/* object with options (if needed) */)
	const [isDragging, setIsDragging] = useState(false)
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
	// const ny = (d: CityTemperature) => Number(d['New York']);
	//const sf = (d: CityTemperature) => Number(d['San Francisco']);

	// export type ThresholdProps = {
	//   width: number;
	//   height: number;
	//   margin?: { top: number; right: number; bottom: number; left: number };
	// };
	// interface TaskDtl {
	// 	id: number
	// 	name: string
	// 	start: number
	// 	duration: number
	// }

	// helper function for undefined object in dictionaries stack overflow
	const propsSelector = (props: any) => {
		return Object.fromEntries(
			Object.entries(props).filter(([_, val]) => val !== undefined)
		)
	}

	//	const taskDtl = createEntityAdapter()
	//find start and end times
	//const tasksAll=selectorTasksAll()
	//  let taskDtl:({[id:(number|string)]:ITaskDtl}|undefined) = undefined
	let taskDtl = new Map<number | string, ITaskDtl>()
	taskIds.forEach((taskid, index) => {
		const ctask = taskEnts[taskid]
		console.log(`index ${index} - task`, taskid, ctask)
		const fromTasks = linksAll.filter(
			(link) =>
				link.from == taskid &&
				taskIds.indexOf(link.from) < taskIds.indexOf(link.to)
		) //.map(link=>link.from)

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
			const item = taskDtl.get(link.from)
			// console.log(`fromtasks.map item`, item)
			const endtime: number = (item?.start || 0) + (item?.duration || 0) || 0
			if (endtime && endtime > startTime) startTime = endtime
		})

		if (ctask !== undefined && taskid !== undefined) {
			taskDtl.set(taskid, {
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

		// if( linkEnts !==undefined) {
		// 	linkEnts?.forEach?(link => {
		// 	if(link?.to===taskid){
		// 		linksTo.push(link.from)
		// 	}
		// });
		// }

		// if (linkEnts!== undefined && linkEnts.length >0 ){
		// const clinksIn:Array<Link> = linkEnts?.map (val as Link => val?.to || undefined)}

		// return clinksIn

		// if (linkEnts !==undefined && linkEnts.length  >1 ){ // } && ctask !==undefined && ctask.id !== undefined ){
		// for (const key of linkEnts.keys(dictionary)) =>{

		//  }

		// linkEnts?.filter(link=>(link.to===ctask?.id))||undefined}
		// 	}
		// 		const preTasks= if(linkEnts){  else[]
		// 	}else
		// 	return(new  Array<Link>[])}
	})
	console.log(`taskDtl`, taskDtl)
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
		if (!isDragging) {
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
						//		console.log(`mouseDown ppoint`, ppoint)
						if (ppoint !== null && ppoint !== undefined) {
							setDragStart({ x: ppoint.x, y: ppoint.y })
						}
						console.log(`set dragstart at`, ppoint)
						setIsDragging(true)
					}
				} else {
					if (typeof x === 'number' && typeof y === 'number') {
						setDragStart({ x: x, y: y })
						setIsDragging(true)
					}
				}
			}
		}
	}

	const handleSvgMouseUp = (
		e?: React.MouseEvent, // | React.SyntheticEvent,
		x?: number,
		y?: number
	) => {
		let point: XY | undefined = undefined
		// console.log('preparing Mouse up- isDragging', isDragging)
		// const { onDragStart, resetOnStart } = props
		if (e !== undefined) {
			e.stopPropagation()
			e.persist()

			//use gPoint to get consistent ref point and avoid typo
			if (typeof e === typeof MouseEvent) {
				point = gPoint(e) || undefined // fallback used to remove a null value
			}
		} else {
			// have been given x,y so use given values
			if (x !== undefined && y !== undefined) {
				point = { x, y } as XY
			}
		}
		// now  cancel drag
		setIsDragging(false)
		setMousepos(point)
		setDragStart(undefined)
	}

	const handleSvgMouseMove = (e: React.MouseEvent) => {
		e.stopPropagation()
		e.persist()

		if (isDragging) {
			console.log('mouse Move - isDragging', isDragging)
			//use gPoint to get consistent ref point and avoid typo
			let mousePoint = gPoint(e)

			console.log('dragMove to position', mousePoint)
			if (mousePoint === null) mousePoint = undefined
			// mouse move is capturing mouse up so need to check buttons
			// cancel drag if mouse is up.
			if (e.buttons === 0) {
				handleSvgMouseUp(e)
				// now  cancel drag
				setIsDragging(false)
				setDragStart(undefined)
			} else {
				//temporary lines are in unscaled coords
				setMousepos(mousePoint)
				console.log('MouseMove started start, current', dragStart, mousePoint)
				// setActiveTask(undefined)
				if (isDragging) {
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
						// const newConnectors = connectors.concat(newPath)

						// setconnectors(newConnectors)
						// setNextConnectorId(nextConnectorId + 1) // increment for next connector
					}
				}
			}
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
		if (dragStart !== undefined && mousepos !== undefined && isDragging) {
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
						r='2'
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

					const OutPorts = taskItem.froms.map((item, index) =>
						DrawOutPorts(taskItem, item.to, index, ytop + barHeight)
					)
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
							iLayout={iLayout}
						></TaskBar>
					)
				}),
			[taskIds]
		)
		return <g>{output}</g>
	}

	const outPort_x = (taskItem: ITaskDtl, taskIndex: number) => {
		const output = taskItem.start + taskItem.duration / 2
		console.log(`taskIndex @${taskIndex} ,  outPortx=${output} -`, taskItem)
		return output
	}

	const outPort_y = (index: number) =>
		(index + 1) * iLayout.barSpacing - iLayout.barPad // fetch lower edge of taskbar
	const retPort_x = (taskItem: ITaskDtl) => taskItem.duration + taskItem.start // end of task
	const retPort_y = (taskItem: ITaskDtl, index: number) =>
		index * iLayout.barSpacing +
		1 -
		iLayout.barPad +
		iLayout.portLinkVoffset * index
	const inPort_y = (
		taskItem: ITaskDtl,
		indexTaskTo: number,
		indexPortTo: number
	) =>
		indexTaskTo * iLayout.barSpacing +
		iLayout.barPad +
		iLayout.portLinkVoffset * (indexPortTo + 1) * iLayout.barSpacing
	const inPort_x = (taskItem: ITaskDtl) => taskItem.start // end of task

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

	let DrawLinks = () => {
		let output: ReactNode[] = []
		let outputPortCircles: ReactNode[] = []
		taskIds.forEach((id, indexPortIdFrom) => {
			if (id === undefined) return null
			//	console.log(`taskEnts, id`, taskEnts, taskEnts[id])
			const taskOutItem = taskDtl.get(id)
			if (taskOutItem === undefined) {
				console.log(`Undefined taskOutitem at index ${indexPortIdFrom}`)
				return null
			}
			// work through inner
			const innerMap = taskOutItem.froms.map((link, indexPortIdFrom) => {
				// find to Task and matchind index
				const taskToItem = taskDtl.get(link.to)
				if (taskToItem === undefined) {
					console.log(`Undefined taskToitem at index ${indexPortIdFrom}`)
					return null
				}
				const indexTaskIdFrom =
					taskIds.findIndex((item) => link.from === item) || 0
				const indexTaskIdTo = taskIds.findIndex((item) => link.to === item) || 0
				const indexPortTo =
					taskToItem?.tos.findIndex((item) => link.id === item.id) || 0

				const ppt0 = {
					x: outPort_x(taskOutItem, indexTaskIdFrom),
					y: outPort_y(indexTaskIdFrom),
				}
				const pptEnd = {
					x: inPort_x(taskToItem),
					y: inPort_y(taskToItem, indexTaskIdTo, indexPortTo) || 0,
				}
				console.log(
					`fromTask : ${taskOutItem.name} : link, ,pptEnd,taskToItem,toIndex`,
					link,
					pptEnd,
					taskToItem
				)
				// console.log(
				// 	`indexTaskIdFrom ${indexTaskIdFrom} , indexTaskIdTo ${indexTaskIdTo}`
				// )
				const xPortOffset =
					0 - iLayout.portLinkHoffset * iLayout.barSpacing * indexPortIdFrom

				let path = [
					indexPortIdFrom > 0
						? { x: xScale(ppt0.x), y: ppt0.y } // initial point
						: { x: xScale(ppt0.x) + xPortOffset, y: ppt0.y }, //subsequent indexes
				] //first point
				path.push({ x: xScale(ppt0.x) + xPortOffset, y: ppt0.y })
				const midX = Math.min(
					xScale(ppt0.x) + xPortOffset,
					xScale(pptEnd.x) - iLayout.portTriLength * 1.5
				)
				path.push({ x: midX, y: (indexTaskIdFrom + 1) * iLayout.barSpacing }) // end less triangle
				path.push({
					x: midX, //- 1.5 * iLayout.portTriLength*iLayout.barSpacing,
					y: pptEnd.y,
				}) // first drop

				path.push({
					x: xScale(pptEnd.x - iLayout.portTriLength * 1.5),
					y: pptEnd.y,
				}) // end less triangle

				if (pptEnd) {
					// polygon uses x,y sequence in array
					const color = 'purple'
					const triHeight = yScale(iLayout.portTriHeight)
					const triLength = yScale(iLayout.portTriLength)
					const nameStart = `Link Start -Task ${taskEnts[link.from]?.name} to ${
						taskEnts[link.to]?.name
					}`
					const nameLink = `Link -Task ${taskEnts[link.from]?.name} to ${
						taskEnts[link.to]?.name
					}`
					const nameEnd = `Link End -Task ${taskEnts[link.from]?.name} to ${
						taskEnts[link.to]?.name
					}`

					const trianglePoints = [
						xScale(pptEnd.x) - triLength,
						pptEnd.y + triHeight / 2,
						xScale(pptEnd.x) - triLength,
						pptEnd.y - triHeight / 2,
						xScale(pptEnd.x),
						pptEnd.y,
					].toString()
					outputPortCircles.push(
						<circle
						 key={`SLink${link.id}`}
							cx={xScale(ppt0.x)+xPortOffset}
							cy={(ppt0.y)}
							r={iLayout.PortDotSize*iLayout.barSpacing}
							className={'PortIn'}
							fill={color}
							stroke='1px'
							onMouseEnter={(e) =>
								handleMouseEnter({
									type: 'LinkStart',
									id: link.id,
									name: nameStart,
								})
							}
							onMouseLeave={(e) =>
								handleMouseLeave({
									type: 'LinkStart',
									id: link.id,
									name: nameStart,
								})
							}
						/>
					)
					output.push(
						<LinePath
							 key={`Link${link.id}`}
							//curve={curveLinear}  curveLinear is the default so do not need to specify
							data={path}
							x={(data) => data.x}
							y={(data) => data.y}
							stroke={color || 'orange'}
							fill='none'
							strokeWidth='2'
							radius='4'
							onMouseEnter={(e) =>
								handleMouseEnter({ type: 'Link', id: link.id, name: nameLink })
							}
							onMouseLeave={(e) =>
								handleMouseLeave({ type: 'Link', id: link.id, name: nameLink })
							}
						/>
					)
					output.push(
						<polygon
						 	 key={`ELink${link.id}`}
							className={'inPortTriangle'}
							points={trianglePoints}
							fill={color}
							stroke='1 px'
							onMouseEnter={(e) =>
								handleMouseEnter({ type: 'Link', id: link.id, name: nameEnd })
							}
							onMouseLeave={(e) =>
								handleMouseLeave({ type: 'Link', id: link.id, name: nameEnd })
							}
						/>
					)
				}
			})
			return
		})
		if (output.length > 0) {
		
		
			return <g>{output  } {outputPortCircles}</g>
		} else return null
	} // , [taskDtl])

	const DrawOutPorts = (
		taskItem: ITaskDtl,
		item: EntityId,
		index: number,
		ytop: number
	) => {
		// console.log(`DrawOutports taskItem `, taskItem,' index', index, ' item ',item)
		const size = iLayout.portTriHeight * iLayout.barSpacing

		const selInfo: ISelItem = {
			type: 'taskPortOut',
			id: taskItem.id,
			name: `${taskItem.name} -port ${index}`,
		}
		const handleMouseEnter = (e: React.MouseEvent<SVGElement, MouseEvent>) => {
			//	console.log(selInfo)
			e.preventDefault()
			dispatch(setMouseOverItem(selInfo))
			// onMouseEnter && onMouseEnter(e)
		}
		const handleMouseLeave = (e: React.MouseEvent<SVGElement, MouseEvent>) => {
			e.preventDefault()
			dispatch(resetMouseOverItem(selInfo))
		}
		return (
			<PortDot
				className={'portOut'}
				key={`${taskItem.id}'-port'${index}`}
				cx={xScale(outPort_x(taskItem, index))}
				cy={ytop}
				r={size}
				fill='#b7580f' //{'orange'}
				stroke='solid black 2px'
				iLayout={iLayout}
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
			/>
		)
	}

	const DrawInPorts = () => {
		const map2 = taskDtl.forEach(
			(task) =>
				task.tos.map((taskItem, index) => {
					let targetTask = taskDtl.get(taskItem.from)
					if (targetTask === undefined) return null
					const selInfo: ISelItem = {
						type: 'taskPortIn',
						id: targetTask.id,
						name: `${targetTask?.name} -port ${index}`,
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
		? `type: ${mOverItem.type} - mouseOverid: ${mOverItem.id} - name: ${mOverItem.name}`
		: 'mouseOveritem:'
	// -- render output starts
	return (
		<DragContext.Provider value={DragContextItem}>
			<div className='seq graphContainer'>
				<p>{dragposTxt} </p>
				<p>{mouseposTxt} </p>
				<p>{txtMouseOver}</p>
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
						height={graphHeight / 2}
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
					<DrawLinks />
					<DrawDragLine />

					<text x='-70' y='15' transform='rotate(0)' fontSize={10}>
						Time (Sec)
					</text>
				</svg>
			</div>
		</DragContext.Provider>
	)
}
