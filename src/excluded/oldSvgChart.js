import React, {
	useCallback,
	useState,
	useMemo,
	useRef,
	createRef,
	useContext,
	createContext,
} from 'react'
import { PortDot } from './PortDot'
import { PortTriangle } from "./PortTriangle"
import { Group } from '@vx/vx'
import { useTooltip, TooltipWithBounds } from '@vx/vx'
import { localPoint } from '@vx/event'
import { Bar, BarStackHorizontal } from '@vx/vx'
import { Grid } from '@vx/vx'
import { AxisTop, AxisLeft, AxisBottom } from '@vx/axis'
import { Curve, curveLinear, curveStepBefore, LinePath } from '@vx/vx'
import { scaleLinear, scaleBand, scaleOrdinal } from '@vx/scale'
import { LinearGradient } from '@vx/gradient'
import { withTooltip, Tooltip, defaultStyles } from '@vx/tooltip'
import { WithTooltipProvidedProps } from '@vx/tooltip/lib/enhancers/withTooltip'
// import { Graph, DefaultLink, DefaultNode } from '@vx/network'
// import { DndProvider, useDrag, useDrop } from 'react-dnd'
//import { HTML5Backend } from 'react-dnd-html5-backend'
import { createStore } from 'redux'
import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'
import { connect } from 'react-redux'
// import * as actionTypes from '../store/actions'
//import update from 'immutability-helper'
import { useDispatch, useSelector } from 'react-redux'
import {
	tasksSlice,
	tasksSelector,
	selectCount,
	updateTasksItem,
	selectTimeMax,
	updateTimeMax,
	selectAllTaskIds,
} from '../store/tasksSlice'
import { TimeAxis } from './timeScale'
import TaskBar from './TaskBar'

const tooltipStyles = {
	...defaultStyles,
	minWidth: 60,
	backgroundColor: 'rgba(0,0,0,0.9)',
	color: 'white',
}



const MyBar = (props) => {
	const {
		label,
		x,
		y,
		width,
		height,
		fill,
		onClick,
		onDragStart,
		onDragMove,
		onDragEnd,
		rectRef,
	} = props
	return (
		<>
			<rect
				key={`bar-${label}`}
				key={label}
				x={x}
				y={y}
				width={width}
				height={height}
				fill={fill || 'green'}
				// onClick={onClick}
				onMouseDown={props.handleDragStart}
				onMouseMove={props.handleDragMove}
				onMouseUp={props.handleDragEnd}
			/>
		</>
	)
}
//
//DrawLine = helper from https://github.com/emersonlaurentino/react-connect-elements
// helper functions, it turned out chrome doesn't support Math.sgn()
export const signum = (x) => (x < 0 ? -1 : 1)
export const absolute = (x) => (x < 0 ? -x : x)

export const drawPath = (svg, path, startX, startY, endX, endY) => {
	// get the path's stroke width (if one wanted to be  really precise, one could use half the stroke size)

	const stroke = parseFloat(path.getAttribute('stroke-width'))
	// check if the svg is big enough to draw the path, if not, set height/width
	if (svg.getAttribute('height') < endY) svg.setAttribute('height', endY)
	if (svg.getAttribute('width') < startX + stroke)
		svg.setAttribute('width', startX + stroke)
	if (svg.getAttribute('width') < endX + stroke)
		svg.setAttribute('width', endX + stroke)

	const deltaX = (endX - startX) * 0.15
	const deltaY = (endY - startY) * 0.15

	// for further calculations which ever is the shortest distance
	const delta = deltaY < absolute(deltaX) ? deltaY : absolute(deltaX)

	// set sweep-flag (counter/clock-wise)
	// if start element is closer to the left edge,
	// draw the first arc counter-clockwise, and the second one clock-wise
	let arc1 = 0
	let arc2 = 1
	if (startX > endX) {
		arc1 = 1
		arc2 = 0
	}

	// draw tha pipe-like path
	// 1. move a bit down, 2. arch,  3. move a bit to the right, 4.arch, 5. move down to the end
	path.setAttribute(
		'd',
		`M${startX} ${startY} V${startY + delta} A${delta} ${delta} 0 0 ${arc1} ${
			startX + delta * signum(deltaX)
		} ${startY + 2 * delta} H${
			endX - delta * signum(deltaX)
		} A${delta} ${delta} 0 0 ${arc2} ${endX} ${startY + 3 * delta} V${endY}`
	)
}

//
// svgTask
const svgTask = (props) => {
	const { id, x, y, height, width, taskName, fill, xScale, yScale } = props
	// this draws a rectangle of variable height
	return (
		<TaskBar
			key={`bar-${taskName}`}
			x={x}
			y={y}
			labelid={id}
			width={width}
			height={height}
			xScale={xScale}
			yScale={yScale}
			handleDragEnd={props.handleDragEnd}
		></TaskBar>
	)
}

svgTask.defaultProps = {
	x1: 0,
	y1: 0,
	barHeight: 28,
	width: 30,
	taskName: 'taskName',
}

const SvgTask = (props) => {
	const { item, barHeight, lineSpacing } = props
	const {
		handleMouseOver,
		tooltipData,
		tooltipLeft,
		tooltipTop,
		tooltipOpen,
		showTooltip,
		hideTooltip,
	} = props
	//console.log('props handlemouse over ', props)
	if (item === undefined) {
		return
	} else {
		const { item, index } = props
		const width = item.duration
		const height = barHeight
		const x1 = item.start
		const y1 = index * lineSpacing
		const yMid = Math.round(barHeight / 2)
		const arrowSize = Math.round(barHeight * 0.8)
		const dotSize = Math.round(barHeight * 0.6)

		return (
			<Group key={'Tgroup' + item.taskName} left={x1} top={y1}>
				<Bar
					key={'Bar' + item.taskName}
					className='svgTask'
					overflow='visible'
					taskname={item.taskName}
					width={width}
					height={height}
					left={x1}
					fill={item.color}
					// onMouseOver={() => handleMouseOver}
					// onMouseEnter={(e) => {
					// console.log('enter e', e.target)
					// alert(`clicked  `)
					// }}
					// onMouseMove={(e) => {
					// 	console.log('mouseMove e', e.target)
					// alert(`clicked  `)
					// }}
					onMouseOut={() => hideTooltip}
				></Bar>

				{/* <PortDot
					key={'PortOut' + item.taskName}
					className='PortIn'
					height={dotSize}
					width={dotSize}
					cx={3}
					cy={yMid}
					r={Math.round(dotSize / 2)}
					onMouseDown={() => console.log('portdot onmousedown')}
				></PortDot> */}
				{/* 
				<PortTriangle
					key={'PortIn' + item.taskName}
					className='PortOut '
					height={arrowSize}
					width={arrowSize}
					x={item.duration - arrowSize}
					y={yMid}
					r={Math.round(arrowSize * 2)}
					style={{ cursor: 'help' }}
				></PortTriangle> */}
			</Group>
		)
	}
}

// const SvgChart = (props) => {
// 	const { height, width, lineSpacing, barHeight } = props
// 	const {
// 		tooltipData,
// 		tooltipLeft,
// 		tooltipTop,
// 		tooltipOpen,
// 		showTooltip,
// 		hideTooltip,
// 	} = useTooltip()

const DrawPath = (props) => {
	// const { x1, y1, x2, y2, id, color } = props
	console.log('DrawPath props', props)
	if (
		props.x1 === undefined ||
		props.y1 === undefined ||
		props.x2 === undefined ||
		props.y2 === undefined
	) {
		//console.log('path data contains undefined')
		return null
	}
	const bezierWeight = 0.675
	const x1 = props.x1
	const y1 = props.y1

	const x4 = props.x2
	const y4 = props.y2

	const dbx = bezierWeight

	const p1x = props.x1
	const p1y = props.y1

	const p2x = props.x1
	const p2y = props.y2

	const p3x = props.x1
	const p3y = props.y2

	const p4x = props.x2
	const p4y = props.y2

	const pathData = `M${p1x} ${p1y} C ${p2x} ${p2y} ${p3x} ${p3y} ${p4x} ${p4y}`
	console.log('bezier x1,y1,x2,y2,dbx', p1x, p1y, x4, y4, dbx)
	return (
		<path
			d={pathData}
			stroke={props.color || 'orange'}
			fill='none'
			strokeWidth='2'
		></path>
	)
}
const DrawLine = (props) => {
	const { path, id, color, xScale, yScale } = props
	const bezierWeight = 0.175
	// console.log('DrawLine x1,y1,x2,y2,color', x1,y1,x2,y2,color)
	console.log('DrawLine path', path)
	// if (
	// 	x1 === undefined ||
	// 	y1 === undefined ||
	// 	x2 === undefined ||
	// 	y2 === undefined
	// ) {
	// 	console.log('line data contains undefined', props)
	// 	return null
	// }
	// const pathData = `M${props.x1}, ${props.y1} , ${props.x2} ${props.y2}z`
	//	console.log('DrawLine x,y,x2,y2', x1, y1, x2, y2)

	return (
		<LinePath
			curve={curveLinear}
			data={path}
			x={(data) => (data.x)}
			y={(data) => (data.y)}
			stroke={props.color || 'orange'}
			fill='none'
			strokeWidth='2'
		></LinePath>
	)
}

const SvgBarChart2 = (props) => {
	const { height, width } = props
	// tasks definition from redux
	const dispatch = useDispatch()
	const rectRef = useRef()
	const [isDragging, setIsDragging] = useState(false)
	const [dragStart, setDragStart] = useState({ x: undefined, y: undefined })
	const [mousepos, setMousepos] = useState({ x: undefined, y: undefined })
	const graphAreaRef = useRef() // ref for chart area
	const tasks = useSelector(selectAllTaskIds)
	const MouseXYStartRef = useRef
	const mouseXYEndRef = useRef()
	const [timeGraphWidth, settimeGraphWidth] = useState(800) //sets time axis length in pixels
	//  define the graph zone

	const timeMin = 0
	const initialConnector = {
		id: 1,
		path: [
			{ x: 10, y: 1 },
			{ x: 50, y: 3 },
		],
	}
	const [nextConnectorId, setNextConnectorId] = useState(2)

	const [connectors, setconnectors] = useState([initialConnector])
	// //recalc time scales based on data
	//   const newMinTime=tasks.reduce((timeMin, task) => Math.min(task.start, timeMin), +Infinity)
	React.useEffect(() => {
		// run once to correctly set max time range in  for plotting
		//update my data adjusts maxtime if needed
		dispatch(updateTasksItem({ index: -1, colid: 'none', value: 'none' }))
	}, [])

	const timeMax = selectTimeMax

	const [activeTask, setActiveTask] = useState(undefined)
	const svgRef = React.useRef()

	const resetOnStart = true // reset dx at start of drag

	const gPoint = (e) => {
		let point = getLocalPoint(e, graphAreaRef.current) || {
			x: undefined,
			y: undefined,
		}
		// console.log('gPoint x,y,ref ', rectRef.x, rectRef.y, graphAreaRef.current)
		return { x: point.x, y: point.y }
		// return { x: point.x + graphPadLeft, y: point.y + graphPadTop }
	}

	const handleSvgTaskMouseDown = (props) => {
		if (!isDragging) {
			//only run if not already dragging as you can move over multiple elements

			const { x, y } = props
			console.log('dragstart on task props', x, y)
			//temporary lines are in unscaled coords
			setDragStart({ x: x, y: y })
			setIsDragging(true)
		}
	}

	const handleSvgMouseDown = (props) => {
		const { e, x, y } = props
		// const { onDragStart, resetOnStart } = props
		if (e !== undefined) {
			e.stopPropagation()
			e.persist()
		}
		if (!isDragging) {
			//only run if not already dragging as you can move over multiple elements

			console.log('dragstart props', e.target, x, y)
			let point = { x, y }
			//check to see if x & y is given
			if (x === undefined || y === undefined) {
				point = localPoint(graphAreaRef.current, e)
				// console.log(
				// 	'x ,y.invert with offset ',
				// 	point.x,
				// 	point.y,
				// 	xScale.invert(point.x),
				// 	yScale.invert(point.y)
				// )
				// console.log('drawingAreaRef.xy', graphAreaRef.current)
			}
			//have been given posittion by numbers from task
			// {point= {x,y} }
			//temporary lines start are in unscaled coords
			else {
				setDragStart({ x: x, y: y })
			}
			setIsDragging(true)
		}
	}

	const handleSvgMouseMove = (e) => {
		e.stopPropagation()
		e.persist()
		if (isDragging) {
			//use gPoint to get consistent ref point and avoid typo
			const point = gPoint(e)
			console.log(
				'dragMove x y, x.invert, y.invert',
				point.x,
				point.y

				// 'Invert x,y:',
				// xScale.invert(point.x),
				// yScale.invert(point.y)
			)
			// cancel drag if mouse is up.
			if (e.buttons === 0) {
				handleSVGMouseUp(e)
				// now  cancel drag
				setIsDragging(false)
				// setDragStart({ x: undefined, y: undefined })
			}
			//temporary lines are in unscaled coords
			setMousepos({ x: (point.x), y: (point.y) })
		}
	}

	const handleSVGMouseUp = (props) => {
		let x2 = undefined
		let y2 = undefined
		const { e, x, y } = props
		// const { onDragStart, resetOnStart } = props
		if (e !== undefined) {
			e.stopPropagation()
			e.persist()

			//use gPoint to get consistent ref point and avoid typo
			let point = gPoint(e)

			x2 = (point.x)
			y2 = (point.y)
		} else {
			// have been given x,y so use given values
			x2 = x
			y2 = y
		}
		const x1 = dragStart.x
		const y1 = dragStart.y
		console.log('MouseMove started x,y,x2,y2 ', x1, y1, x2, y2)

		setActiveTask(undefined)
		if (isDragging) {
			setMousepos({ x: x2, y: y2 })
			if (
				x1 !== undefined &&
				y1 !== undefined &&
				x2 !== undefined &&
				y2 !== undefined
			) {
				// only add if points are not identical - use 0.1 of barSpacing
				if (Math.abs(x1 - x2) > .05 || Math.abs(y1 - y2) > 0.05) {
					const newPath = {
						id: nextConnectorId,
						path: [
							{ x: x1, y: y1 },
							{ x: x2, y: y2 },
						],
					}
					const newConnectors = connectors.concat(newPath)

					setconnectors(newConnectors)
					setNextConnectorId(nextConnectorId + 1) // increment for next connector
				}
			}
		}
		// now  cancel drag
		setIsDragging(false)
		setMousepos({ x: undefined, y: undefined })
		setDragStart({ x: undefined, y: undefined })
		return
	}

	// end of drag

	// check for undefined
	//	let tasks = []
	// if (tasks === undefined || tasks.length <= 0) {
	// 	tasks = [{ taskname: 'no task yet', start: 0.0, duration: 1.0 }]
	// } else {
	// 	tasks = props.tasks
	// }
	// set xmax to ensure non zero range
	const graphPadTop = 40
	const graphPadLeft = 55
	const graphInnerWidth = width - graphPadLeft || 300
	//TODO 300 forced width - find why
	// graphInnerHeight is previously set from number of bars
	const graphPadRight = 30
	const xmax = useMemo(
		() =>
			tasks.reduce((acc, item) => Math.max(item.start + item.duration, 0.5)),
		[tasks]
	)

	const xScale = useMemo(
		() =>
			scaleLinear({
				domain: [0, xmax],
				range: [0, graphInnerWidth],
				nice: 10,
			}),
		[xmax]
	)
	const minBarHeight = 100
	const tasksCount = tasks.length
	let graphInnerHeight = Math.max(
		tasks.length * minBarHeight,
		height - graphPadTop,
		100
	)
	if (graphInnerHeight === NaN) graphInnerHeight = 100
	//if props for height are string then get NAN in graphInnerHeight

	const yDomain = useMemo(() => tasks.map((item, index) => item.taskName), [
		tasks,
	])

	const yBandScale = useMemo(
		() =>
			scaleBand({
				range: [0, graphInnerHeight],
				domain: tasks.map((item) => item.taskName),
				paddingOuter: 0.3,
				paddingInner: 0.3,
			}),
		[yDomain, graphInnerHeight]
	)

	const yScale = useMemo(
		() =>
			scaleLinear({
				range: [0, graphInnerHeight],
				domain: [0, tasksCount - 1],
			}),
		[yDomain, tasksCount]
	)
	// console.log('yScale height', graphInnerHeight)
	const barStepV = useMemo(() => yScale(1), [yScale])

	const getLocalPoint = (event) => {
		const zpt = localPoint(graphAreaRef.current, event)
		return {
			x: zpt.x - graphPadLeft || undefined,
			y: zpt.y - graphPadTop || undefined,
		}
	}

	const yInvertBandScale = (y) => (y - graphPadTop) / yBandScale.step()

	// console.log('svgBarChart props', tasks)
	const handleSvgBarClick = (e) => {
		console.log('Bar clicked', e.target.key, ' : ', e.target)
	}

	const DragContext = createContext({
		handleSvgDragStart: handleSvgMouseDown,
		handleSvgDragEnd: handleSVGMouseUp,
		handleSvgDragMove: handleSvgMouseMove,
		xScale,
		yScale,
		drawingAreaRef: graphAreaRef,
	})

	const toNum2 = (num) => {
		if (num !== undefined && !isNaN(num)) {
			return num.toFixed(2)
		} else {
			return ''
		}
	}
  const gScaleXform=`scale(${(xScale(2)-xScale(1))} ${yScale(1)})`
        console.log('gScaleXform', gScaleXform)

	const rectGraphArea = React.forwardRef((props, ref) => (
		<rect
			width={graphInnerWidth}
			height={graphInnerHeight}
			fill={`url(#gradientFill)`}
			rx={5}
			ref={graphAreaRef}
			fill={'rgb(250,250,240)'}
			onMouseDown={handleSvgMouseDown}
			onMouseMove={handleSvgMouseMove}
			onMouseUp={handleSVGMouseUp}
		/>
	))

	const Temppath =
		isDragging && mousepos.x !== undefined && dragStart.x !== undefined
			? [
					// only enned to test x for undefined as y will be the same
					{ x: dragStart.x, y: dragStart.y },
					{ x: mousepos.x, y: mousepos.y },
			  ]
			: undefined

	return (
		<>
			<DragContext.Provider>
				<h3>SVGchart2 vx</h3>

				<table className='tg'>
					<thead>
						<tr>
							<th>sc Drag: {isDragging ? ' True' : 'False'}</th>
							<th>x: {dragStart ? toNum2(dragStart.x) : ' ? '}</th>
							<th>y: {toNum2(dragStart.y)}</th>
							<th>
								x2: {mousepos ? toNum2(xScale.invert(mousepos.x)) : ' * '}
							</th>
							<th>
								y2: {mousepos ? toNum2(yScale.invert(mousepos.y)) : ' * '}
							</th>
							<th>xScale: {toNum2(xScale(1))}</th>
							<th>yScale: {toNum2(yScale(1))}</th>
						</tr>

						<tr>
							<th>sc Drag: {isDragging ? ' True' : 'False'}</th>
							<th>x: {toNum2(xScale(dragStart.x))}</th>
							<th>y: {toNum2(yScale(dragStart.y))}</th>
							<th>
								x2: {mousepos.x ? toNum2(xScale.invert(mousepos.x)) : ' * '}
							</th>
							<th>
								y2: {mousepos.y ? toNum2(yScale.invert(mousepos.y)) : ' * '}
							</th>
						</tr>
					</thead>
				</table>

				<svg
					height={graphInnerHeight + graphPadTop}
					width={graphInnerWidth + graphPadLeft}
					fill='color.rgb(200,200,200)'
				>
					<AxisTop scale={xScale} label='Time' labelOffset={20} top={graphPadTop} />
					<AxisLeft
							left={graphPadLeft}
							scale={yScale}
							numTicks={tasks.length}
							labelOffset={20}
							label='Tasks'
						/>
					<Group top={graphPadTop} left={graphPadLeft} transform={gScaleXform}>
											

						
						<LinearGradient from={`#e9e9e9`} to={`#fff`} id={`gradientFill`} />
						<svg ref={graphAreaRef} >
							<rect
								className='graphBackground'
								width={xScale.invert(graphInnerWidth)}
								height={yScale.invert(graphInnerHeight)}
								fill={`url(#gradientFill)`}
								rx={5}
								onMouseUpCapture={handleSVGMouseUp}
								onMouseMove={handleSvgMouseMove}
							/>
							<Grid
								xScale={xScale}
								yScale={yScale}
								width={xScale.range()[1]}
								height={yScale.range()[1]}
								numTicksRows={tasks.length}
								numTicksColumns={20}
								stroke='rgb(100,100,100)'
								strokeWidth={1}
								fill={undefined}						
							></Grid>

							

							{connectors.map((item, index) => (
								<DrawLine
									path={item.path}
									key={'connector' + item.id}
									xScale={xScale}
									yScale={yScale}
								></DrawLine>
							))}

							{Temppath ? (
								<DrawLine
									id='temp1'
									path={Temppath}
									xScale={xScale}
									yScale={yScale}
								/>
							) : null}
						</svg>
					</Group>
				</svg>
				<h3>Connector count {connectors.length}</h3>
				{connectors.map((item, index) => (
					<p key={index}>
						x: {item.x}, y: {item.y} to x2: {item.x2}, y2: {item.y2}
					</p>
				))}
			</DragContext.Provider>
		</>
	)
}

SvgBarChart2.defaultProps = {
	width: 1200,
	lineSpacing: 28,
	barHeight: 20,
	height: 120,
}

export default SvgBarChart2
