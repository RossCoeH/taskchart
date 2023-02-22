import React, { ReactNode } from 'react'
import {
	e_SeqDiagElement,
	ILayout,
	ILinkOut,
	ISelDiagItem,
	ITaskDtl,
} from './seqTypes'
import { LinePath } from '@visx/visx'

import {
	toggleDiagSelectedItem,
	mouseOverItem,
	selectedItems,
} from './seqSlice'
import { useAppDispatch, useAppSelector } from '../../app/hooks/hooks'
import './MakeDrawLinks.scss'
import clsx from 'clsx'

const MakeDrawLinks = (
	taskDtl: ITaskDtl[],
	iLayout: ILayout,
	xScale: any,
	yScale: any,
	// taskEnts: Dictionary<Task>,
	 handleMouseEnter: (selInfo: ISelDiagItem) => void,
	handleMouseLeave: (selInfo: ISelDiagItem) => void,
	handleKeyPressApp: (e: React.KeyboardEvent<HTMLElement>) => void
	//	outPort_x:(taskItem: ITaskDtl, taskIndex: number) =>number,
) => {
	const triHeight = iLayout.portTriHeight * iLayout.barSpacing
	const triLength = iLayout.portTriLength * iLayout.barSpacing
	const selectedList = useAppSelector(selectedItems)

	const dispatch = useAppDispatch()

	const outPort_x = (taskItem: ITaskDtl, taskOutportIndex: number) => {
		const output =
			taskItem.startTime +
			taskItem.duration / 2 -
			iLayout.portLinkHoffset * taskOutportIndex
		// console.log(`taskIndex @${taskIndex} ,  outPortx=${output} -`, taskItem)
		return output
	}

	const outPort_y = (index: number) =>
		(index + 1) * iLayout.barSpacing - iLayout.barPad // fetch lower edge of taskbar

	const retPort_x = (taskItem: ITaskDtl) => taskItem.endTime // end of task
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

	const inPort_x = (taskItem: ITaskDtl) => taskItem.startTime // end of task
	let output: ReactNode[] = []
	let outputPortCircles: ReactNode[] = []
	const appMouseOverItem = useAppSelector(mouseOverItem)

	taskDtl.forEach((taskD, indexTaskD) => {
		// top level per task
		if (taskD === undefined) return null

		// const taskFromItem = taskDtl.from.find((item) => item.id === id)
		// if (taskFromItem === undefined) {
		// 	console.log(`Undefined taskOutitem at index ${indexPortIdFrom}`)
		// 	return null
		// }

		// work through incoming links -retlinks done later
		const innerMap = taskD.inLinks.map(
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

				const indexTaskOutLink = taskDtl[indexTaskFrom].outLinks.findIndex(
					(item) => item.id === inLink.id
				)
				const indexTaskTo = indexInLink

				const ppt0 = {
					x: outPort_x(taskFrom, indexTaskOutLink),
					y: outPort_y(indexTaskFrom),
				}
				const pptEnd = {
					x: inPort_x(taskD),
					y: inPort_y(taskD, indexTaskD, indexInLink),
				}
				// console.log(
				// 	`fromTask : ${taskOutItem.name} : link, ,pptEnd,taskToItem,toIndex`,
				// 	link,
				// 	pptEnd,
				// 	taskToItem
				// )

				const xPortOffset = 0 //- iLayout.portLinkHoffset * iLayout.barSpacing * indexInLink

				let path = [
					indexInLink > 0
						? { x: xScale(ppt0.x) * indexTaskOutLink, y: ppt0.y } // initial point
						: { x: xScale(ppt0.x) + xPortOffset, y: ppt0.y }, //subsequent indexes
				] //first point
				path.push({ x: xScale(ppt0.x) + xPortOffset, y: ppt0.y })
				const midX = Math.min(
					xScale(ppt0.x) + xPortOffset,
					xScale(pptEnd.x) - triLength * 1.5 //trilength offset to ensure space for end arrow
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
					x: xScale(pptEnd.x) - iLayout.portTriLength * 1.5,
					y: pptEnd.y,
				}) // end less triangle

				if (pptEnd) {
					// polygon uses x,y sequence in array
					const color = 'purple'

					const nameStart = `Link Start -Task ${taskDtl[indexTaskFrom].name} to ${taskDtl[indexTaskTo]?.name}`
					const nameLink = `Link Task ${taskDtl[indexTaskFrom]?.name} to ${taskDtl[indexTaskTo].name}`
					const nameEnd = `Link End -Task ${taskDtl[indexTaskFrom]?.name} to ${taskDtl[indexTaskTo]?.name}`
					const selInfoS: ISelDiagItem = {
						type: e_SeqDiagElement.LinkStart,
						id: inLink.id,
						sname: `Slink${inLink.id}`,
						desc: nameStart,
					}
					const selInfoL: ISelDiagItem = {
						type: e_SeqDiagElement.Link,
						id: inLink.id,
						sname: `link${inLink.id}`,
						desc: nameStart,
					}
					const selInfoE: ISelDiagItem = {
						type: e_SeqDiagElement.LinkEnd,
						id: inLink.id,
						sname: `Elink${inLink.id}`,
						desc: nameStart,
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
						classnameL = classnameL + ' ' + 'linkIsSelected'
						classnameS = classnameS + ' ' + 'linkFillIsSelected'
						classnameE = classnameE + ' ' + 'linkFillIsSelected'
					}

					const dotScale = startIsHover || linkIsSelected ? 2.0 : 1.0 // sets display scale
					const triScale = endIsHover || linkIsSelected ? 2.0 : 1.0 // set display scale

					// console.log(`App isHover over link`,	appMouseOverItem?.sname || '',	dotScale,triScale	)

					const onMouseUp = (selInfo: ISelDiagItem): void => {
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

					outputPortCircles.push(
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
					const polypoints = path
						.map((item) => `${item.x},${item.y} `)
						.join(' ')
					output.push(
						<polyline
							className={classnameL}
							key={selInfoL.sname}
							//curve={curveLinear}  curveLinear is the default so do not need to specify
							points={polypoints}
							// stroke={color || 'orange'}
							fill='transparent'
							// strokeWidth='2'
							radius='4'
						//	onMouseEnter={(e) => handleMouseEnter(selInfoL)}
						//	onMouseLeave={(e) => handleMouseLeave(selInfoL)}
							onMouseUp={(e) => onMouseUp && onMouseUp(selInfoL)}
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
							pointerEvents= 'visible'
							
						/>
					)
				}
			}
		)

		// now do return links or loops

		const retMap = taskD.retFroms.map(
			(retLink, indexPortRetOffset, retarray) => {
				// find to Task and matchind index
				const indexTaskToItem = indexTaskD
				const indexTaskFromItem = retLink.fromTaskIndex
				const taskFromEndtime = taskDtl[indexTaskFromItem].endTime
				const taskToEndtime = taskD.endTime
				// if (taskToItem === undefined) {
				// 	console.log(`Undefined taskToitem at index ${indexPortIdFrom}`)
				// 	return null
				// }
				// if (taskFromItemIndex === undefined) {
				// 	console.log(`Undefined taskFromItem at link id ${retLink.id}`)
				// 	return null
				// }
				const indexPortOffsetTo = taskDtl[indexTaskToItem].outLinks.findIndex(
					(item) => retLink.id === item.id
				)

				const ppt0 = {
					x: taskFromEndtime,
					y:
						indexTaskFromItem * iLayout.barSpacing -
						iLayout.barPad -
						indexPortRetOffset * iLayout.portLinkVoffset,
				}
				const pptEnd = {
					x: taskToEndtime,
					y:
						indexTaskD * iLayout.barSpacing +
							iLayout.barPad +
							indexPortOffsetTo * iLayout.portLinkVoffset || 0,
				}
				// console.log(
				// 	`RetTask : ${taskOutItem.name} : link, ,pptEnd,taskToItem,toIndex`,
				// 	link,
				// 	pptEnd,
				// 	taskToItem
				// )

				const yFromOffset =
					iLayout.barSpacing -
					iLayout.barPad -
					iLayout.portLinkVoffset * iLayout.barSpacing * indexPortRetOffset
const dropperX = Math.max(
					xScale(ppt0.x) + triLength * 1.5,
					xScale(pptEnd.x) + triLength * 1.5)

				let path = [
					{ x: xScale(ppt0.x), y: ppt0.y + yFromOffset }, 
					{ x: dropperX, y: ppt0.y + yFromOffset }
				] //first point

			

				path.push({ x: dropperX, y: ppt0.y + yFromOffset }) // end less triangle
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
					const color = 'green'

					const nameStart = `Link Start -Ret ${taskDtl[indexTaskFromItem].name} to ${taskD?.name}`
					const nameLink = `Link -Ret ${taskDtl[indexTaskFromItem].name} to ${taskD?.name}`
					const nameEnd = `Link End -Ret ${taskDtl[indexTaskFromItem].name} to ${taskD?.name}`

					const trianglePoints = [
						xScale(pptEnd.x) + triLength,
						pptEnd.y + triHeight / 2,
						xScale(pptEnd.x) + triLength,
						pptEnd.y - triHeight / 2,
						xScale(pptEnd.x),
						pptEnd.y,
					].toString()

					outputPortCircles.push(
						<circle
							key={`SLink${retLink.id}`}
							cx={xScale(ppt0.x)}
							cy={ppt0.y + yFromOffset}
							r={iLayout.PortDotSize * iLayout.barSpacing}
							className={'PortIn'}
							// fill={color}
							// stroke='1px'
					/*		onMouseEnter={(e) =>
					 			handleMouseEnter({
									type: e_SeqDiagElement.LinkStart,
									id: retLink.id,
									sname: `Slink${retLink.id}`,
									desc: nameStart,
								})
							}
							onMouseLeave={(e) =>
								handleMouseLeave({
									type: e_SeqDiagElement.LinkStart,
									sname: `Slink${retLink.id}`,
									id: retLink.id,
									desc: nameStart,
								}) 
							}*/
						/>
					)
					output.push(
						<LinePath
							key={`Link${retLink.id}`}
							//curve={curveLinear}  curveLinear is the default so do not need to specify
							data={path}
							x={(data) => data.x}
							y={(data) => data.y}
							stroke={color || 'orange'}
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
							fill={color}
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
export default MakeDrawLinks
