import { LinePath } from '@visx/shape'
import { ReactNode } from 'react'
import {
	e_SeqDiagElement,
	IDrawTasks,
	ILinkOut,
	ISelInfo,
	ITaskDtl,
} from './seqTypes'

import clsx from 'clsx'
import { useAppDispatch, useAppSelector } from '../../app/hooks/hooks'
import './SeqDrawLinks.scss'
import {
	mouseOverItem,
	selectedItems,
	toggleDiagSelectedItem,
} from './seqSlice'

const SeqDrawLinks = (
{	taskDtl ,
	iLayout,
	xScale ,
	handleMouseEnter,
	handleMouseLeave,
	handleMouseDown,
	handleMouseUp,
}:IDrawTasks
	//	outPort_x:(taskItem: ITaskDtl, taskIndex: number) =>number,
) => {
	const triHeight = iLayout.portTriHeight 
	const triLength = iLayout.portTriLength 
	const selectedList = useAppSelector(selectedItems)

	const dispatch = useAppDispatch()

	const outPort_x = (taskItem: ITaskDtl, taskOutportIndex: number) => {
		const output =
			taskItem.startTime +
			taskItem.duration / 2 //-
			//iLayout.portLinkHoffset * taskOutportIndex
		// console.log(`taskIndex @${taskIndex} ,  outPortx=${output} -`, taskItem)
		return output
	}

  const rhPortCount = (taskItem: ITaskDtl) => taskItem.outLinks.length+taskItem.retTos.length

	const outPort_y = (index: number) =>
		(index +1) * iLayout.barSpacing - iLayout.barPad // fetches lower edge of taskbar

	//const retPort_x = (taskItem: ITaskDtl) => taskItem.endTime // end of task

	//const retPortCount = (taskItem: ITaskDtl) => taskItem.retTos.length
	
///Port_y calculates the y position for in ports, out ports and ret ports based on the index of the port and total count of ports for that task. It spaces the ports evenly within the task bar area, accounting for padding. The formula ensures that ports are distributed from the top to the bottom of the task bar, with equal spacing between them.
	function Port_y(taskItem: ITaskDtl,taskIndex:number, index: number,portCount:number) {
		const retPortSpacing =(taskItem: ITaskDtl) => ( iLayout.barSpacing- iLayout.barPad) / (portCount + 1)
		const y_pt =taskIndex * iLayout.barSpacing +
			iLayout.barPad +
			retPortSpacing(taskItem) * (index + 0.5)
		return y_pt
			// was iLayout.portLinkVoffset * index
			
	}


	const inPort_y = (
		taskItem: ITaskDtl,
		indexTaskItem: number,
		indexTaskTo: number,
		indexPortTo: number
	) =>
		indexTaskTo * iLayout.barSpacing +
		Port_y(taskItem,indexTaskItem,indexPortTo,taskItem.inLinks.length)
	//	iLayout.portLinkVoffset * (indexPortTo + 1) 

	const inPort_x = (taskItem: ITaskDtl) => taskItem.startTime // end of task
	let output: ReactNode[] = []
	let outputPortCircles: ReactNode[] = []
	const appMouseOverItem = useAppSelector(mouseOverItem)

	taskDtl.forEach((taskIn, indexTaskIn) => {
		// top level per task
		if (taskIn === undefined) return null

		// const taskFromItem = taskDtl.from.find((item) => item.id === id)
		// if (taskFromItem === undefined) {
		// 	console.log(`Undefined taskOutitem at index ${indexPortIdFrom}`)
		// 	return null
		// }

		// work through incoming links -retlinks done later
		const innerMap = taskIn.inLinks.map(
			(inLink: ILinkOut, indexInLink: number) => {
				// 	// find to Task and matchind index
				// 	const taskToItem = taskDtl.find((item) => item.id === link.fromTaskId)
				// 	if (taskToItem === undefined) {
				// 		console.log(`Undefined taskToitem at index ${indexPortIdFrom}`)
				// 		return null
				// 	}
				const indexTaskFrom = inLink.fromTaskIndex
				const taskFrom = taskDtl[inLink.fromTaskIndex]
				if (taskFrom === undefined) {
					alert('error in program - FromTask cannot be found in MakeDrawLinks')
				}
	const selInfoILinkIn: ISelInfo = {
		type: e_SeqDiagElement.Link,
		id: inLink.id,
		sname: `InLink ${taskFrom.name} - ${indexInLink}`,
		desc: `InLink ${taskFrom.name} to ${taskIn.name}`,
	}
				const indexTaskOutLink = taskDtl[indexTaskFrom].outLinks.findIndex(
					(item) => item.id === inLink.id
				)
				const indexTaskTo = indexInLink

				const ppt0 = {
					x: outPort_x(taskFrom, indexTaskOutLink),
					y: outPort_y(indexTaskFrom),
				}
				const pptEnd = {
					x: inPort_x(taskIn),
					y: Port_y(taskIn, indexTaskIn, indexInLink, taskIn.inLinks.length),
				}
				// console.log(
				// 	`fromTask : ${taskOutItem.name} : link, ,pptEnd,taskToItem,toIndex`,
				// 	link,
				// 	pptEnd,
				// 	taskToItem
				// )

				const xPortOffset = 0-iLayout.portLinkHoffset * indexTaskOutLink //- iLayout.portLinkHoffset * iLayout.barSpacing * indexInLink

				let path = [
					indexInLink > 0
						? { x: xScale(ppt0.x)+xPortOffset , y: ppt0.y } // initial point
						: { x: xScale(ppt0.x) + xPortOffset, y: ppt0.y }, //subsequent indexes
				] //first point
				path.push({ x: xScale(ppt0.x) + xPortOffset, y: ppt0.y })
				const midX = Math.min(
					xScale(ppt0.x) + xPortOffset,
					xScale(pptEnd.x) - triLength * 1.5//trilength offset to ensure space for end arrow
				)
				path.push({
					x: midX,
					y: ppt0.y,
				}) // end less triangle
				path.push({
					x: midX,
					y: pptEnd.y,
				}) // first dropper

				path.push({
					x: xScale(pptEnd.x) - iLayout.portTriLength * 1,
					y: pptEnd.y,
				}) // end less triangle

				if (pptEnd) {
					// polygon uses x,y sequence in array
					const color = 'purple'

					const nameLink = `Link Start -Task ${taskDtl[indexTaskFrom].name} to ${taskDtl[indexTaskTo]?.name}`

					const selInfoS: ISelInfo = {
						type: e_SeqDiagElement.LinkStart,
						id: inLink.id,
						sname: `Slink ${inLink.id}`,
						desc: nameLink,
					}
					const selInfoL: ISelInfo = {
						type: e_SeqDiagElement.Link,
						id: inLink.id,
						sname: `link ${inLink.id}`,
						desc: nameLink,
					}
					const selInfoE: ISelInfo = {
						type: e_SeqDiagElement.LinkEnd,
						id: inLink.id,
						sname: `Elink${inLink.id}`,
						desc: nameLink,
					}

					const startIsHover =
						appMouseOverItem?.sname === selInfoS.sname ||
						appMouseOverItem?.sname === selInfoL.sname
					const endIsHover =
						appMouseOverItem?.sname === selInfoE.sname ||
						appMouseOverItem?.sname === selInfoL.sname

					var classnameS = startIsHover ? 'linkStartIsHover' : 'linkStart'

					var classnameE = endIsHover ? 'linkEndIsHover' : 'linkEnd'

					var classnameL =
						appMouseOverItem?.sname === selInfoL.sname ? 'linkIsHover' : 'link'

					const linkIsSelected =
						selectedList.findIndex((item) => item.sname === selInfoL.sname) >= 0
					if (linkIsSelected) {
						classnameL = `${classnameL} linkIsSelected`
						classnameS = `${classnameS} linkFillIsSelected`
						classnameE = `${classnameE} linkFillIsSelected`
					}

					const dotScale = startIsHover || linkIsSelected ? 2.0 : 1.0 // sets display scale
					const triScale = endIsHover || linkIsSelected ? 2.0 : 1.0 // set display scale

					// console.log(`App isHover over link`,	appMouseOverItem?.sname || '',	dotScale,triScale	)

					const onMouseUp = (selInfo: ISelInfo): void => {
						console.log(`Mouseup`, selInfo)
						dispatch(toggleDiagSelectedItem(selInfo))
					}
					const trianglePoints = [
						xScale(pptEnd.x) - triLength * triScale,
						pptEnd.y + (triHeight * triScale) / 2,
						xScale(pptEnd.x) - triLength * triScale,
						pptEnd.y - (triHeight * triScale) / 2,
						xScale(pptEnd.x),
						pptEnd.y,
					].toString()

					//keyup cannot be attached to polylines
					const handlekeyUp = (e: KeyboardEvent, info: e_SeqDiagElement) => {
						console.log(
							'key up inside Link',
							e.key,
							' startIsHover =',
							startIsHover
						)
					}

					output.push(
						<circle
							className={classnameS}
							key={selInfoS.sname}
							cx={xScale(ppt0.x) + xPortOffset}
							cy={ppt0.y}
							r={iLayout.PortDotSize * iLayout.barSpacing * dotScale}
							// fill={color}
							// stroke='1px'
							// onMouseEnter={(e) => handleMouseEnter(selInfoS)}
							// 	onMouseLeave={(e) => handleMouseLeave(selInfoS)}
							onMouseUp={(e) => onMouseUp && onMouseUp(selInfoS)}
							onClick={(e) => alert(`Click on ${selInfoS.sname}`)}
						/>
					)
					const pathThickness = startIsHover || endIsHover || linkIsSelected ? 3 : 2
					const polypoints = path
						.map((item) => `${item.x},${item.y} `)
						.join(' ')
					output.push(
						
						// first export an invisible polyline of 2x thickness for hit testing
						<polyline
							className={classnameL}
							key={selInfoL.sname }
							//curve={curveLinear}  curveLinear is the default so do not need to specify
							points={polypoints}
							stroke='lightblue'
							fill='none'
							strokeWidth={iLayout.PortDotSize * iLayout.barSpacing * 3} // make hit zone thicker than visible stroke
							radius={pathThickness}		
					     	//	onMouseEnter={(e) => handleMouseEnter(selInfoL)}
							//	onMouseLeave={(e) => handleMouseLeave(selInfoL)}
							pointerEvents="stroke" // ensure only stroke is interactive not fill zone
							cursor='pointer'
							onMouseUp={(e) => onMouseUp && onMouseUp(selInfoL)}
						 onClick={e => 	alert(`Click on ${selInfoL.sname} Hitzone`)}
						/>)

						// then export visible polyline with actual stroke width
						output.push(
						<polyline
							className={classnameL}
							key={selInfoL.sname +'Visible'}
							//curve={curveLinear}  curveLinear is the default so do not need to specify
							points={polypoints}
							stroke={color || 'orange'}
							fill='none'
							strokeWidth={pathThickness}
							radius={pathThickness}
						  pointerEvents='none' // ensure only invisible stroke is selectable
							//	onMouseEnter={(e) => handleMouseEnter(selInfoL)}
							//	onMouseLeave={(e) => handleMouseLeave(selInfoL)}
							//onMouseUp={(e) => onMouseUp && onMouseUp(selInfoL)}
							// onClick={e => 	alert(`Click on ${selInfoL.sname}`);
						/>
					)
					output.push(
						<polygon //end triangle
							key={selInfoE.sname}
							className={classnameE}
							points={trianglePoints}
							// fill={color}
							// stroke='1 px'
							// onMouseEnter={(e) => handleMouseEnter(selInfoE)}
							// onMouseLeave={(e) => handleMouseLeave(selInfoE)}
							onMouseUp={(e) => onMouseUp && onMouseUp(selInfoE)}
							pointerEvents='visible'
						/>
					)
				}
			}
		)

		// now do return links or loops
		const retMap = taskIn.retTos.map(
			(retLink, indexRetOut, retarray) => {
				// find to Task and matchind index
				const indexTaskToItem = retLink.toTaskIndex
				const indexTaskFromItem = indexTaskIn
				const taskFromEndtime = taskDtl[indexTaskFromItem].endTime
				const taskToEndtime = taskDtl[indexTaskToItem].endTime
				// if (taskToItem === undefined) {
				// 	console.log(`Undefined taskToitem at index ${indexPortIdFrom}`)
				// 	return null
				// }
				// if (taskFromItemIndex === undefined) {
				// 	console.log(`Undefined taskFromItem at link id ${retLink.id}`)
				// 	return null
				// }
				const indexPortRetOffsetTo = taskDtl[indexTaskToItem].retPorts.findIndex(
					item => retLink.id === item.id
				)

					// }
				const indexPortRetOffsetFrom = taskDtl[indexTaskFromItem].retPorts.findIndex(
					item => retLink.id === item.id)

				if (indexPortRetOffsetFrom < 0) {
					alert('indexPortRetOffsetFrom ws not found')
				}
				const ppt0 = {
					x:  taskDtl[indexTaskFromItem].endTime,
					y: 
					(	indexTaskFromItem * iLayout.barSpacing) +
						iLayout.barPad +
						(indexPortRetOffsetFrom+.5) * iLayout.portLinkVoffset,
					
				}
				const pptEnd = {
					x: taskDtl[indexTaskToItem].endTime,
					y:Port_y( taskDtl[indexTaskToItem],indexTaskToItem, indexPortRetOffsetTo,taskDtl[indexTaskToItem].retPorts.length) 
						// indexTaskToItem* iLayout.barSpacing +
						// iLayout.barPad +
						// indexPortRetOffsetTo * iLayout.portLinkVoffset ,
				}
				console.log(
					`RetTask : ${retLink.id} : from: ${indexTaskFromItem} to ${retLink.toTaskIndex} indexPortRetOffsetFrom ${indexPortRetOffsetFrom} indexPortRetOffsetTo ${indexPortRetOffsetTo} VportSpacing ${iLayout.portLinkVoffset} pptEndY ${pptEnd.y}`
				)
/* 	const selInfoRet: ISelInfo= {
		type: e_SeqDiagElement.Link,
		id: retLink.id,
		sname: `RetLink ${taskD.id} - ${indexTaskFromItem}`,
		desc: `RetLink${taskD.id} - ${indexTaskFromItem}`,
	} */
				const yFromOffset =
					iLayout.barSpacing/2 -
					iLayout.barPad +
					iLayout.portLinkVoffset * indexPortRetOffsetFrom

const retLinkHdropperOffset=iLayout.retLinkHdropperOffset
				const dropperX = Math.max(
					xScale(ppt0.x) + triLength * 1.5+indexPortRetOffsetFrom*retLinkHdropperOffset,
					xScale(pptEnd.x) +
						triLength * 1.5
				) +	indexPortRetOffsetFrom *retLinkHdropperOffset
				console.log(`retTask dropperX ${dropperX} indexPortRetOffsetFrom ${indexPortRetOffsetFrom} indexPortRetOffsetTo ${indexPortRetOffsetTo}`)

				let path = [
					{ x: xScale(ppt0.x), y: ppt0.y },
					{ x: dropperX, y: ppt0.y  },
				] //first point

				path.push({ x: dropperX, y: ppt0.y  }) // end less triangle
				path.push({
					x: dropperX,
					y: pptEnd.y,
				}) // first dropper

				path.push({
					x: xScale(pptEnd.x) + triLength * 1,
					y: pptEnd.y,
				}) // end less triangle

				if (pptEnd) {
					// polygon uses x,y sequence in array
					

					// const nameStart = `Link Start -Ret ${taskDtl[indexTaskFromItem].name} to ${taskD?.name}`
					const nameLink = `Link -Ret ${taskDtl[indexTaskFromItem].name} to ${taskIn?.name}`
					const nameEnd = `Link End -Ret ${taskDtl[indexTaskFromItem].name} to ${taskIn?.name}`

					const trianglePoints = [
						xScale(pptEnd.x) + triLength,
						pptEnd.y + triHeight / 2,
						xScale(pptEnd.x) + triLength,
						pptEnd.y - triHeight / 2,
						xScale(pptEnd.x),
						pptEnd.y,
					].toString()

					output.push(
						<circle
							key={`SLink${retLink.id}`}
							cx={xScale(ppt0.x)}
							cy={ppt0.y }
							r={iLayout.PortDotSize * iLayout.barSpacing}
							className={clsx('PortIn','RetLink')}
						/>
					)
					output.push(
						<LinePath
							key={`Link${retLink.id}`}
							className={clsx('Path','RetLink')}
							//curve={curveLinear}  curveLinear is the default so do not need to specify
							data={path}
							x={(data) => data.x}
							y={(data) => data.y}
							fill='none'
							strokeWidth='2'
							radius='4'
							/* onMouseEnter={(e) =>
								handleMouseEnter({
									type: e_SeqDiagElement.Link,
									id: retLink.id,
									sname: `link${retLink.id}`,
									desc: nameLink,
								})
							}
							onMouseLeave={(e) =>
								handleMouseLeave({
									type: e_SeqDiagElement.Link,
									id: retLink.id,
									sname: `link${retLink.id}`,
									desc: nameLink,
								}) 
							}*/
							onKeyUp={(e) => {
								alert(`Keyup ${e.key} for Link id ${retLink.id}`)
							}}
						/>
					)
					output.push(
						<polygon
							key={`ELink${retLink.id}`}
							className={'inPortTriangle'}
							points={trianglePoints}
							stroke='1 px'
							/* 	onMouseEnter={(e) =>
								handleMouseEnter({
									type: e_SeqDiagElement.Link,
									id: retLink.id,
									sname: `Elink${retLink.id}`,
									desc: nameEnd,
								})
							}
							onMouseLeave={(e) =>
								handleMouseLeave({
									type: e_SeqDiagElement.Link,
									id: retLink.id,
									sname: `Elink${retLink.id}`,
									desc: nameEnd,
								})
							} */
						/>
					)
				}
			}
		)

		return
	})
	if (output.length > 0) {
		return (
			<g>
				{output} {outputPortCircles}
			</g>
		)
	} else return null
}
export default SeqDrawLinks
