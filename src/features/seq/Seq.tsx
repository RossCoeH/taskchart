import React, { useMemo, useRef, useState } from 'react'
import * as _ from 'lodash'
import { Text } from '@visx/text'
import { RectClipPath } from '@visx/clip-path'
import { Group } from '@visx/group'
// import { curveBasis } from '@visx/visx'
// import { LinePath } from '@visx/visx'
// import { XYChart } from '@visx/visx'
import { scaleLinear } from '@visx/scale'
import { AxisBottom } from '@visx/axis'
import { GridRows, GridColumns } from '@visx/grid'
//import react-spring from '@visx/react-spring'
import { localPoint } from '@visx/event'
import { Point } from '@visx/point'
import { Zoom,applyMatrixToPoint } from '@visx/zoom'
import { ProvidedZoom, TransformMatrix } from '@visx/zoom/lib/types'
import { AxisScale, AxisScaleOutput, AxisTop } from '@visx/axis'

import { useViewport } from 'react-viewport-hooks'
import { Tooltip } from 'react-tooltip'
import 'react-tooltip/dist/react-tooltip.css'
import { useAppSelector, useAppDispatch } from '../../app/hooks/hooks'
import { initialLayout } from './seqInitValues'
import {
	selTasks,
	selLinks,
	EntArrayToAdapter,
	mouseOverItem,
	setMouseOverItem,
	resetMouseOverItem,
	toggleDiagSelectedItem,
	selectedItems,
	linksAddOne,
	linksUpsertOne,
	tasksUpsertOne,
	getNextTaskId,
	getNextLinkId,
	removeSelectedItem,
	removeAllSelectedItems,
	linksRemoveMany,
	selectTasksAll,
	selectLinksAll,
	linkUpdateCount,
	taskUpdateCount,
} from './seqSlice'
import {
	Link,
	Task,
	XY,
	ITaskDtl,
	e_SeqDiagElement,
	IBranchLink,
	IMouseOverInfo,
	ISelInfo,
	IDrawTasks,
	ILinkIn,
	ILinkOut,
	ILayout,
	ISeqStartMouseDrag,
	IHandleSeqMouseDown,
	IHandleSeqMouseMovewithInfo,
	IDragStartItem,
} from './seqTypes'
import styles from './Seq.module.scss'
import { useSelector } from 'react-redux'
import {
	createEntityAdapter,
	Dictionary,
	EntityId,
	EntityState,
} from '@reduxjs/toolkit'
import TaskBar from './TaskBar'
import { link } from 'fs'
import { DragContext, IDragContext } from './dragContext'
import PortDot from './PortDot'
import PortTriangle from './PortTriangle'
import DrawPath from './DrawPath'
import MakeDrawLinks from './MakeDrawLinks'
import { useClickOutside, useKeyboardEvent, useToggle } from '@react-hookz/web'
import { assert, debug } from 'console'
import taskGetDtl from './TaskGetDtl'
import TanTableDnD from '../Tables/TanTable_DnD'
import { SeqDrawDragLine } from './SeqDrawDragLine'
import { SeqDrawTopAxis } from './SeqDrawTopAxis'
import { FileInput } from 'grommet'
import EditableCell from '../Editable/EditableCell'
import { ScaleLinear } from 'd3-scale'

import SeqDrawTaskBars from './SeqDrawTaskBars'
import { transform } from 'typescript'
// import MyFluentUITable from '../Tables/MyFluentUITable';
//import MyTable from '../Tables/MyTable'

export const background = '#f3f3f3'

enum e_CursorStyles {
	default = '',
	notAllowed = 'notAllowed',
	canGrab = 'canGrab',
	canAccept = 'canAccept',
	draggable = 'draggable',
}

const toNum2 = (num: number | undefined | typeof NaN) => {
	return num !== undefined && !isNaN(num) ? num.toFixed(2) : ' '
}

export enum dragAction {
	none = 'none',
	dragLine = 'dragLine',
	canCreateLink = 'canCreateLink',
	pan = 'pan',
	zomm = 'zoom',
}

export function Seq() {
	const dispatch = useAppDispatch()
	const [incrementAmount, setIncrementAmount] = useState('2')
	const { vh, vw } = useViewport(/* object with options (if needed) */)
	//const [isDragging, setIsDragging] = useState(false)
	const [dragActionActive, setdragActionActive] = useState(dragAction.none)

	const [dragStartItem, setDragStartItem] = useState<
		IDragStartItem | undefined
	>(undefined)
	const [mousepos, setMousepos] = useState<XY | undefined>(undefined)
	const graphAreaRef = useRef<SVGSVGElement | null>(null)

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
	const taskList = useAppSelector(selectTasksAll) || {}
	const linkList = useAppSelector(selectLinksAll) || {}
	const linkIds = useAppSelector((state) => state.seq.links.ids)
	const linkEnts = useAppSelector((state) => state.seq.links.entities)
	const linksAll = useAppSelector((state) => selLinks.selectAll(state))
	const mOverItem = useAppSelector(mouseOverItem)
	const nextLinkId = useAppSelector(getNextLinkId)
	const nextTaskId = useAppSelector(getNextTaskId)
	const [toggledMousedDown, toggleMousedDown] = useToggle()
	const [dragStartInfo, setDragStartInfo] = useState<
		ISeqStartMouseDrag | undefined
	>(undefined)
	const [seqCursorStyle, setSeqCursorStyle] = useState<e_CursorStyles>(
		e_CursorStyles.default
	)
	const ClickOutSide = () => {
		const ref = useRef(null)
		useClickOutside(ref, () => {
			window.alert('Clicked Outside')
			toggleMousedDown()
		})
	}

	const [keyInlist, setKeyInList] = useState<string[]>([])

	// const handleKeyPress= useKeyboardEvent(
	// 	true,
	// 	(e: KeyboardEvent) => {
	// 		console.log('keyup event', e)
	// 		if (e.key === 'Delete') {
	// 		}
	// 		setKeyInList((l) => l.slice(-5).concat([e.key])) //logging keys
	// 	},
	// 	[],

	// 	{ event: 'keyup', eventOptions: { passive: true } }
	// )

	const time = (d: Task) => d.duration

	// helper function for undefined object in dictionaries stack overflow
	const propsSelector = (props: any) => {
		return Object.fromEntries(
			Object.entries(props).filter(([_, val]) => val !== undefined)
		)
	}

	//let taskDtl: ITaskDtl[] = []
	const taskDtl = taskGetDtl(taskList, linkList)
	console.log('exported taskDtl', taskDtl)
	//,[linkUpdateCount,taskUpdateCount])

	// bounds
	const maxEndTime = Math.max(...taskDtl.map((task) => task.endTime))
	// console.log(
	// 	'max EndTime is',
	// 	maxEndTime,
	// 	'from ',
	// 	taskDtl.map((task) => task.start + task.duration)
	// )

	const defaultGraphMargin = { top: 0, right: 30, bottom: 50, left: 0 }
	const graphHeight = Math.max(taskIds.length + 1, 2) * iLayout.barSpacing
	// iLayout.graphWidth = isNaN(Number(vw)) ? 600 : Math.min(600, vw)
	// const graphMargin = defaultGraphMargin
	// const xMax = vw - margin.left - margin.right
	// const yMax = vh - margin.top - margin.bottom

	// scales

	const xScaleDomainInit = [Math.min(0), Math.max(10, maxEndTime)]

	const xScale: ScaleLinear<number, number, never> = useMemo(
		() =>
			scaleLinear<number>({
				domain: [Math.min(0), Math.max(10, maxEndTime)],
				range: [
					iLayout.graphxFontOffset,
					iLayout.graphWidth - iLayout.graphxFontOffset - iLayout.graphPadRight,
				],
			}),
		[
			iLayout.graphxFontOffset,
			iLayout.graphWidth + iLayout.graphPadRight,
			maxEndTime,
		]
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

	const handleSvgMouseDown = ({
		e,
		selInfo,
		index,
		x,
		y,
		zoom,
	}: IHandleSeqMouseDown) => {
		// const { onDragStart, resetOnStart } = props
		if (e !== undefined) {
			e.stopPropagation()
			//		e.persist()
		}
		if (dragActionActive === dragAction.none) {
			//only run if not already dragging as you can move over multiple elements
			// console.log(
			// 	`MouseDown dragStart from type ${senderType.toString()} -Entity: ${senderId}`
			// )

			let point = { x, y }
			//check to see if x & y is given
			if (
				x === undefined ||
				y === undefined ||
				graphAreaRef.current === undefined
			) {
				if (graphAreaRef !== null) {
					if (
						graphAreaRef.current !== undefined &&
						graphAreaRef.current !== null
					) {
						const gpoint: Point = gPoint(e) || ({ x: -1, y: -1 } as Point) // use -1 as invalid value
						let ppoint = { x: e.clientX, y: e.clientY }
						// console.log(
						// 	`mouseDown ppoint`,
						// 	gpoint.y,
						// 	` from`,
						// 	e.target,
						// 	' id ',
						// 	senderId,
						// 	'index ',
						// 	index
						// )
						//
						const startId = selInfo?.id // this line possibly not needed
						if (
							selInfo?.type === e_SeqDiagElement.TaskBar &&
							selInfo.id !== undefined
						) {
							setDragStartItem({
								selInfo,
								x: gpoint.x,
								y: gpoint.y,
							})
							
							setdragActionActive(dragAction.dragLine)
											console.log('dragActionActive set to', dragActionActive)
							toggleMousedDown()
							// console.log(`set dragstart at`, ppoint, ` from `, e.target)
						} else {
							alert('could not define start task')
						}
					}
				} else {
					if (
						typeof x === 'number' &&
						typeof y === 'number' &&
						x !== undefined &&
						y !== undefined
					) {
						if (y === undefined) return
						const yint = Math.trunc(yScale.invert(y as number))
						const startTask = taskEnts[taskIds[yint]]
						alert('broken code in setting numbers for dragging')
						if (startTask != undefined) {
							// setDragStart({ x: x, y: y ,senderType:startTask})
							// setdragActionActive(dragAction.dragLine)
							// 	}
							// 		else{
							// 		alert("could not define start task")
						}
					}
				}
			}
		}
	}
	interface IHandleSvgDragStart {
		e: React.MouseEvent<Element>
		zoom: ProvidedZoom<SVGSVGElement>
	}

	const handleSvgDragStart = ({ e, zoom }: IHandleSvgDragStart) => {
		// check if other dragging is active.
		if (dragActionActive === dragAction.none) {
			zoom.dragStart(e)
			console.log('zoom started')
		} else zoom.dragEnd()
	}

	// const IsNewLinkPossible(startIndex:number,endIndex:number) =>	    {
	// 			const startTask = taskDtl[taskIds.indexOf(startIndex)]
	// 		const endTask = taskDtl[taskIds.indexOf(endIndex)]
	// 		if( startIndex >0 && endIndex >0 &&	startIndex < endIndex && linkEnts){
	// const	 linkMatched=	linkEnts.filter( (link:Link) => (linkEnts[link.id]?.from === startTask?.id && linkEnts[link.id]?.to === endTask.id				)
	// 		}
	// 		console.log(
	// 			`MouseUp isLinkPossible from index ${startTask?.index} to index ${endTask?.index} is ${isLinkPossible}`
	// 		)
	// }

	const handleSvgMouseUp = ({ e, selInfo }: IMouseOverInfo) => {
		let point: XY | undefined = undefined
		// console.log('preparing Mouse up- isDragging', isDragging)
		// const { onDragStart, resetOnStart } = props
		if (e !== undefined) {
			e.stopPropagation()
			// console.log(`handleMouseMoveUp`, e, selItemUp)
			const ev = e as React.MouseEvent<Element, MouseEvent>
			//use gPoint to get consistent ref point and avoid typo
			if (ev !== undefined) {
				point = ev && gPoint(ev) // fallback used to remove a null value
				setdragActionActive(dragAction.none)
				point && setMousepos(point)
			}
			// check if link avail
			const endIndex = Math.floor(yScale.invert(mousepos?.y || 0))
			const startIndex = Math.floor(yScale.invert(dragStartItem?.y || 0))
			let isLinkPossible = false // assume not possible

			const startTask = taskDtl[startIndex]
			const endTask = taskDtl[endIndex]
			isLinkPossible =
				startIndex !== endIndex &&
				endTask?.inLinks.filter(
					(link) => linkEnts[link.fromTaskIndex]?.from === startTask.id
				).length === 0

			if (startIndex <= endIndex) {
				// 	console.log(
				// 		`Return links are not programmed yet.MouseUp isLinkPossible from index ${startTask?.index} to index ${endTask?.index} is ${isLinkPossible}`
				// 	)
				// } else {
				// console.log(
				// 	`MouseUp isLinkPossible from index ${startTask?.index} to index ${endTask?.index} is ${isLinkPossible}`
				// )
			}

			if (
				dragActionActive === dragAction.dragLine &&
				isLinkPossible &&
				startTask?.id !== undefined &&
				endTask?.id !== undefined
			) {
				// setdragActionActive(dragAction.canCreateLink)
				//if (dragActionActive===dragAction.canCreateLink && !isLinkPossible &&startTask?.id && endTask?.id ) {

				//  if (linkEnts[newID]) {
				// 	 while
				// 	 console.log(`LinkID already in use`, newID, ' in ', linkIds)}
				// console.log(
				// 	`about to dispatch addlink id: ${nextLinkId}from ${startTask.name} to ${endTask.name}`
				// )

				dispatch(
					linksAddOne({
						from: startTask?.id as number,
						to: endTask?.id as number,
						id: nextLinkId,
					})
				)
				setdragActionActive(dragAction.none)

				// now  cancel drag
				setDragStartItem(undefined)
				// clear selected items
				dispatch(removeAllSelectedItems)
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

	const handleSvgMouseMove = ({ e, selInfo, zoom }: IMouseOverInfo) => {
		// e.stopPropagation()
		e.persist()
		// console.log ('MouseMove Seq dragActionActive =', dragActionActive)
		if (dragActionActive !== dragAction.none) {
			//	console.log('mouse Move - isDragging', dragActionActive)
			//use gPoint to get consistent ref point and avoid typo
			let mousePoint = gPoint(e)
			if (mousePoint === null) mousePoint = undefined
			// console.log('dragMove to position', mousePoint)
			if (mousePoint && dragActionActive === dragAction.dragLine) {
				//  check to see if a link can be made
				if (
					Math.floor(dragStartItem?.x || 0) !== Math.floor(mousePoint?.x || 0)
				) {
					//  we have  link attempt
				}
			}
			// mouse move is capturing mouse up so need to check buttons
			// cancel drag if mouse is up.
			if (e.buttons === 0) {
				// console.log(
				// 	`MouseMove button is up - selInfo -`,
				// 	type,
				// 	' index ',
				// 	index,
				// 	' id ',
				// 	id
				// )
				handleSvgMouseUp({ e, selInfo, zoom })
				// now  cancel drag
				setdragActionActive(dragAction.none)
				setDragStartItem(undefined)
			} else {
				//temporary lines are in unscaled coords
				setMousepos(mousePoint)

				// console.log(
				// 	'MouseMove started start ${dragStart.x) current, selInfo',
				// 	dragStart,
				// 	mousePoint
				// )

				// setActiveTask(undefined)
				//if (dragActionActive == dragAction.none) {
				if (dragStartItem !== undefined && mousepos !== undefined) {
					// setMousepos(mousepos)
					// only add if points are not identical - use 0.1 of barSpacing
					if (
						Math.abs(dragStartItem.x - mousepos.x) > 0.05 ||
						Math.abs(dragStartItem.y - mousepos.y) > 0.05
					) {
						const newPath = {
							id: nextConnectorId,
							path: [
								{ x: dragStartItem.x, y: dragStartItem.y },
								{ x: mousepos.x, y: mousepos.y },
							],
						}
					}
					/* 		console.log(
						`mousemove dragto, selInfo`,
						mousepos.x,
						mousepos.y,
						e.target
					) */
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

	const matchLinks = (
		dragStartTaskId: EntityId,
		dragEndTaskId: EntityId
	): boolean => {
		// console.log('drag ,', dragStart, ' --', dragStart?.startId, linkEnts)
		// if (dragStart?.startId === undefined || linkEnts === undefined) {
		// 	return false}

		var matchItems = _.find(
			linkEnts,
			(linkitem) =>
				linkitem?.from === dragStartTaskId && linkitem.to == dragEndTaskId
		)
		// console.log('matchItems inside MatchLink are: ', matchItems)
		if (matchItems !== undefined) {
			//		console.log('mouse link already exists: ', matchItems)
			return true
		} else {
			return false
		}
	}

	//const DrawTopAxis = SeqDrawTopAxis(iLayout, xScale)
	//xScale:ScaleLinear<number,number,never>
	const DrawGraphGrid = (
		xScaleTransformed: ScaleLinear<number, number, never>
	) => {
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
					scale={xScaleTransformed}
					width={iLayout.graphWidth}
					height={graphHeight}
					stroke='#e0e0e0'
				/>
			</Group>
		)
	}

	const dragposTxt = `Mouse Down Start x= ${
		dragStartItem && toNum2(dragStartItem?.x || -999)
	} , ${dragStartItem && toNum2(dragStartItem?.y)} scaled to ${
		(dragStartItem?.x && dragStartItem?.x)?.toFixed(1) || '-'
	}
	 , 	${((dragStartItem?.y && dragStartItem?.y) || -999)?.toFixed(1) || '-'}`

	const mouseposTxt = `Mouse Move to  x= ${
		mousepos && toNum2(mousepos?.x || -999)
	} , ${mousepos && toNum2(mousepos?.y || -999)}  scaled to ${
		(mousepos?.x && xScale.invert(mousepos?.x || -999))?.toFixed(1) || '-'
	}
	 , 	${(mousepos?.y && yScale.invert(mousepos?.y || -999)?.toFixed(1)) || '-'}`

	// console.log(`taskIds, taskEnts`, taskIds, taskEnts)

	const MyText = (text: string, xPos: number, yPos: number) => {
		return (
			<Text
				x={xPos}
				y={yPos}
				width={iLayout.graphPadLeft - 6}
				verticalAnchor='middle'
			>
				{text}
			</Text>
		)
	}

	//   duplicated defs : const handleMouseEnter = (
	// 				e: React.MouseEvent<SVGElement, MouseEvent>,
	// 				selInfo:ISelInfo
	// 			) => {
	// 				//	console.log(selInfo)
	// 				e.preventDefault()
	// 				dispatch(setMouseOverItem(selInfo))
	// 				// onMouseEnter && onMouseEnter(e)
	// 			}
	// 			const handleMouseLeave = (
	// 				e: React.MouseEvent<SVGElement, MouseEvent>,
	// 				selInfo:ISelInfo
	// 			) => {
	// 				e.preventDefault()
	// 				dispatch(resetMouseOverItem(selInfo))
	// 			}

	//TODO working on delete of items here
	const handleKeyPress = (e: React.KeyboardEvent<HTMLElement>) => {
		if (e.key === 'Escape') console.log(`KeyPress`, e.key)
		if (e.key !== 'Delete') return

		if (mOverItem?.type === e_SeqDiagElement.Link) {
			const delId = mOverItem?.id
			if (delId !== undefined) {
				console.log('about to delete Link:', delId)
				mOverItem.id && dispatch(linksRemoveMany([delId]))
			}
		}
	}

	const handleMouseEnter = ({ e, selInfo }: IMouseOverInfo) => {
		console.log('entered Task - index:', selInfo.sname, e.target)
		selInfo && dispatch(setMouseOverItem(selInfo))
	}

	const handleMouseLeave = ({ e, selInfo }: IMouseOverInfo) => {
		//	console.log('entered Task - index:', index,taskDtl.id, e.target)
		dispatch(resetMouseOverItem(selInfo))
		// onMouseEnter && onMouseEnter(e)
	}

	const handleMouseUp = ({ e, selInfo, x, y }: IHandleSeqMouseDown) => {
		console.log('entered Task - index:', selInfo, selInfo?.sname, e.target)
		selInfo && dispatch(toggleDiagSelectedItem(selInfo))
		//debugger
		// onMouseEnter && onMouseEnter(e)
	}

	const DrawTaskBars = (
		xScale: ScaleLinear<number, number, never>,
		zoom: ProvidedZoom<SVGElement>
	) => {
		const drawprops: IDrawTasks = {
			taskDtl: taskDtl,
			xScale,
			iLayout: iLayout,
			dragStartInfo: dragStartInfo,
			zoom,
			handleMouseEnter,
			handleMouseLeave,
			handleMouseDown: handleSvgMouseDown,
			handleMouseUp: handleSvgMouseUp,
			handleMouseMove: handleSvgMouseMove,
		}
		console.log('Drawprops', drawprops)

		return SeqDrawTaskBars(drawprops)
	}
	const DrawLinks = (xScale: ScaleLinear<number,number,never>) =>MakeDrawLinks({
		taskDtl: taskDtl,
		iLayout: iLayout,
		xScale: xScale,
		dragStartInfo: dragStartInfo,
		handleMouseEnter,
		handleMouseLeave,
		handleMouseDown: handleSvgMouseDown,
		handleMouseUp: handleSvgMouseUp,
		handleMouseMove: handleSvgMouseMove,
	})

	const DrawDragLine = (xScale: ScaleLinear<number,number,never>) => dragStartItem
		? SeqDrawDragLine(
				// do not process if dragstartItem is undefined
				{
					dragActionActive: dragActionActive,
					dragStartItem,
					xScale: xScale,
					yScale: yScale,
					mousepos,
					matchLinks,
					taskIds,
				}
		  )
		: null // return null if  dragstartItem is not defined

	const DrawInPorts = (xScale: ScaleLinear<number, number, never>) => {
		const map2 = taskDtl.forEach(
			(taskD) =>
				taskD.inLinks.map((taskFromItem, curTaskIndex) => {
					let targetTask = taskFromItem.fromTaskId //taskDtl.find((item) => item.id === taskItem)
					const fromTaskName = taskDtl[taskFromItem.fromTaskIndex].name
					if (targetTask === undefined) return null
					const selInfo: ISelInfo = {
						type: e_SeqDiagElement.PortIn,
						id: curTaskIndex,
						sname: `In Port from ${fromTaskName} -port ${curTaskIndex}`,
						desc: `from ${fromTaskName} -port ${curTaskIndex}`,
					}

					// console.log(`PortIn selInfo`, selInfo,targetTask)
					return (
						<PortTriangle
							className='PortIn'
							x={taskD.endTime - iLayout.portTriLength}
							y={
								curTaskIndex * iLayout.barSpacing +
								1 -
								iLayout.barPad * iLayout.portLinkVoffset * curTaskIndex
							}
							width={iLayout.portTriLength * iLayout.barSpacing}
							height={(iLayout.portTriLength / 2) * iLayout.barSpacing}
							fill={'green'}
							onMouseEnter={(e) => handleMouseEnter({ e, selInfo })}
							onMouseLeave={(e) => handleMouseLeave}
							onMouseUp={(e) =>
								handleMouseUp({ e, selInfo, index: curTaskIndex })
							}
						/>
					)
				}) // end of tos map
		) //end of forEach task

		return <>{map2}</>
	}

	// const txtMouseOver = mOverItem
	// 	? `Mouse Over type: ${mOverItem.} - mouseOverid: ${mOverItem.id} - sname: ${mOverItem.sname}`
	// 	: 'mouseOveritem:'

	const selectedItemList = useAppSelector(selectedItems)

	const gWidth = iLayout.graphWidth
	const gHeight = iLayout.barSpacing * taskDtl.length
	const initialTransformMatrix: TransformMatrix = {
		scaleX: 1,
		scaleY: 1,
		translateX: 0,
		translateY: 0,
		skewX: 0,
		skewY: 0,
	}

	const zoomContainerRef = useRef<SVGElement>(null)

	interface IzoomConstrain {
		transform: TransformMatrix
		prevTransform: TransformMatrix
	}
	function ZoomConstrain(
		transform: TransformMatrix,
		prevTransform: TransformMatrix
	) {
		if (dragActionActive !== dragAction.none) return prevTransform
		else

		//applying view bounds below - not currently working so comment out
		 { const min = applyMatrixToPoint(transform, { x: 0, y: 0 });
   const max = applyMatrixToPoint(transform, { x: iLayout.graphWidth, y: iLayout.graphHeight });
/*    if (max.x >  iLayout.graphWidth ) {
     return prevTransform;
   }
   if (min.x > 0) {
     return prevTransform;
   }*/
		 }
		 return transform
	}

	// -- render output starts
	return (
		<DragContext.Provider value={DragContextItem}>
			{/* <	 TanTableDnD data={taskDtl} xScale={xScale}  iLayout={iLayout}/> */}
			<Zoom<SVGSVGElement>
				width={gWidth}
				height={gHeight}
				scaleXMin={1 / 2}
				scaleXMax={4}
				scaleYMin={1 / 2}
				scaleYMax={4}
				initialTransformMatrix={initialTransformMatrix}
				constrain={ZoomConstrain}
			>
				{(zoom) => {
					console.log(
						'zoomTranslateX ',
						zoom.transformMatrix.translateX,
						'zoomScaleX',
						zoom.transformMatrix.scaleX
					)

					const xScaleDomain = xScale.domain()
					const xViewTransform: TransformMatrix = {
						translateX: zoom.transformMatrix.translateX,
						scaleX: zoom.transformMatrix.scaleX,
						scaleY: 1.0,
						translateY: 0.0,
						skewX: 0,
						skewY: 0,
					}

const rescaleXAxis = (scale:ScaleLinear<number,number,never>) => {
  let newDomain = scale.range().map((r) => {
    return scale.invert((r - zoom.transformMatrix.translateX)/zoom.transformMatrix.scaleX)
  })
  return scale.copy().domain([Math.max(newDomain[0],0),newDomain[1]]) // limit x values to >=0
}



					const xMinVis =
					
						xScale.invert((xScaleDomain[0]-
							zoom.transformMatrix.translateX / zoom.transformMatrix.scaleX
						) / zoom.transformMatrix.scaleX)//									zoom.transformMatrix.scaleX)
					const xMaxVis = xScale(
						xScaleDomain[1] -
							xScale.invert((
								zoom.transformMatrix.translateX / zoom.transformMatrix.scaleX
							)/ zoom.transformMatrix.scaleX)
					)

					/* 											const xMinVis=xScale.invert(
								(xScale(xScaleDomain[0] )+ zoom.transformMatrix.translateX / zoom.transformMatrix.scaleX)) //									zoom.transformMatrix.scaleX)
					const xMaxVis= xScale.invert(
								xScale(xScaleDomain[1] +zoom.transformMatrix.translateX /									zoom.transformMatrix.scaleX)
							) */
					const xScaleTransformed: ScaleLinear<number, number, never> = rescaleXAxis(xScale)
						// scaleLinear({
						// 	range: xScale.range(), // no change to range as width is same
						// 	domain: [xMinVis, xMaxVis],
						// })
					console.log(
						'xScaleTransformed: ',
						xScaleTransformed.domain().toString()
					)

					const textXtransformed = ` scale(${
						xViewTransform.scaleX
					}, ${0}) transform ${xViewTransform.translateX}, ${0})`

					console.log('textXtransformed', textXtransformed)

					console.log(
						'xViewTransformed',
						xViewTransform.toString(),
						xViewTransform.translateX,
						xViewTransform.scaleX
					)
					const handleZoomReset = (zoom: ProvidedZoom<SVGSVGElement>) => {
						console.log('zoom reset')
						zoom.reset() //handler for rest of zoom}
					}
					const SelInfoBackground: ISelInfo = {
						type: e_SeqDiagElement.SeqChart,
						id: 0,
					}
						graphAreaRef.current=zoom.containerRef.current
					return (
					
						<>
							<div
								className='seqGraphContainer'
								onKeyUp={handleKeyPress}
								style={{ textAlign: 'left' }}
							>
								{/* // use an outer div here to capture keyup as svg cannot do this */}
               <svg
							    	width={iLayout.graphWidth + iLayout.graphxFontOffset}
									height={iLayout.graphPadTop+iLayout.graphHeight+iLayout.graphPadBottom}> 
								<svg
									className='seqGraphAxis'
									width={iLayout.graphWidth + iLayout.graphxFontOffset}
									height={iLayout.graphPadTop}
								>
									{	SeqDrawTopAxis ({iLayout:iLayout, xScale:xScaleTransformed}) 
									
									} 
							
								</svg>

								<svg

									x={iLayout.graphPadLeft}
									y={iLayout.graphPadTop}
									className='seqGraphContent'
									width={iLayout.graphWidth + iLayout.graphxFontOffset}
									height={iLayout.graphHeight}
							/* 		transform={`matrix(${zoom.transformMatrix.translateX},0,${
										zoom.transformMatrix.scaleX 
									},1,0,0`} */
									ref={zoom.containerRef}
									onDrag={(e) => zoom.dragEnd}
									onDoubleClick={(e) => handleZoomReset(zoom)}
									onDragStart={(e) => handleSvgDragStart({ e, zoom })}
									onDragEnd={zoom.dragEnd}
									onMouseLeave={() => {
										if (zoom.isDragging) zoom.dragEnd()
									}}
								>
									<rect
										key='graphZoneBackground'
										x={0}
										width={iLayout.graphWidth + +iLayout.graphxFontOffset}
										height={graphHeight}
										fill={background}
										onMouseDown={(e: React.MouseEvent) =>
											handleSvgMouseDown({
												e,
												selInfo: SelInfoBackground,
												index: 0,
												x: -1,
												y: -1,
											})
										}
										onMouseUp={(e: React.MouseEvent) =>
											handleSvgMouseUp({ e, selInfo: SelInfoBackground, zoom })
										}
										onMouseMove={(e: React.MouseEvent) => {
											// console.log('rect move listener active ', e)
											handleSvgMouseMove({
												e,
												selInfo: SelInfoBackground,
												zoom,
											})
										}}

									/>
									{/* {DrawGraphGrid(xScaleTransformed)} */}
								
										{DrawTaskBars(xScaleTransformed, zoom)}
										{DrawInPorts(xScaleTransformed)}
										{DrawLinks(xScaleTransformed)}
										{DrawDragLine(xScaleTransformed)}
							
									{/* <MyText text= 'tryme' xPos={2} yPos={iLayout.barSpacing/2}/> */}
								</svg>
								</svg>
							</div>

							<br></br>
							<div>
								<p>xScale: {(xScale(2) - xScale(1)).toFixed(2)}</p>
								<p>{`zoom scale ${zoom.transformMatrix.scaleX} transl ${zoom.transformMatrix.translateX}`}</p>
								<p>{`zoom.IsDragging ${zoom.isDragging} DragActionActive: ${dragActionActive}`}</p>
								<p>{`xMinVis ${xMinVis} xMaxVis ${xMaxVis}`}</p>
								<p>Selected item: </p>
								{/* <p>Mouse is over item: {mouseOverItem??''} </p> */}

								{/* //	<p>{dragposTxt} </p> */}
								<p>{mouseposTxt} </p>
								{/* <p>{txtMouseOver}</p> */}
								{/* <ul>
					{selectedItemList.map((item, index) => (
						<li key={index}>{item.sname}</li>
					))}
				</ul> */}

								<div>Press any keyboard keys and they will appear below.</div>
								<p>You have pressed</p>

								{/* <ul>
						{keyInlist.map((k, i) => (
							<li key={`${i}_${k}`}>{k}</li>
						))}{' '}
					</ul> */}
							</div>

							<Tooltip id='registerTip' place='top'>
								Tooltip for the register button
							</Tooltip>
						</>
					)
				}}
			</Zoom>
			)
		</DragContext.Provider>
	)
}
