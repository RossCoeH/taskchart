import React, { ReactNode } from 'react'
import { e_SeqDiagElement, ILayout, ISelDiagItem, ITaskDtl } from './seqTypes'
import { scaleLinear, LinePath } from '@visx/visx'
import { useSelector } from 'react-redux'
import {
	createEntityAdapter,
	Dictionary,
	EntityId,
	EntityState,
} from '@reduxjs/toolkit'
import {
	toggleDiagSelectedItem,
	ISelItem,
	mouseOverItem,
	selectedItems,
} from './seqSlice'
import { useAppDispatch, useAppSelector } from '../../app/hooks/hooks'
import './MakeDrawLinks.scss'

import clsx from 'clsx'
import { isNamedTupleMember } from 'typescript'
import { outPort_x } from './Seq'

const MakeDrawLinks = (
	taskDtl: ITaskDtl[],
	iLayout: ILayout,
	xScale: any,
	yScale: any,
	// taskEnts: Dictionary<Task>,
	handleMouseEnter: (selInfo: ISelDiagItem) => void,
	handleMouseLeave: (selInfo: ISelDiagItem) => void
	//	outPort_x:(taskItem: ITaskDtl, taskIndex: number) =>number,
) => {
	const taskIds = useAppSelector((state) => state.seq.tasks.ids)
	const selectedList = useAppSelector(selectedItems)

	const dispatch = useAppDispatch()

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
	let output: ReactNode[] = []
	let outputPortCircles: ReactNode[] = []
	const appMouseOverItem = useAppSelector(mouseOverItem)

	taskIds.forEach((id, indexPortIdFrom) => {
		// top level per task
		if (id === undefined) return null

		const taskFromItem = taskDtl.find((item) => item.id === id)
		if (taskFromItem === undefined) {
			console.log(`Undefined taskOutitem at index ${indexPortIdFrom}`)
			return null
		}

		// work through inner normal
		const innerMap = taskFromItem.froms.map((link, indexPortIdFrom) => {
			// find to Task and matchind index
			const taskToItem = taskDtl.find((item) => item.id === link.to)
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
				x: outPort_x(taskFromItem, indexTaskIdFrom),
				y: outPort_y(indexTaskIdFrom),
			}
			const pptEnd = {
				x: inPort_x(taskToItem),
				y: inPort_y(taskToItem, indexTaskIdTo, indexPortTo) || 0,
			}
			// console.log(
			// 	`fromTask : ${taskOutItem.name} : link, ,pptEnd,taskToItem,toIndex`,
			// 	link,
			// 	pptEnd,
			// 	taskToItem
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
				x: midX,
				y: pptEnd.y,
			}) // first dropper

			path.push({
				x: xScale(pptEnd.x - iLayout.portTriLength * 1.5),
				y: pptEnd.y,
			}) // end less triangle

			if (pptEnd) {
				// polygon uses x,y sequence in array
				const color = 'purple'
				const triHeight = yScale(iLayout.portTriHeight)
				const triLength = yScale(iLayout.portTriLength)
				const nameStart = `Link Start -Task ${taskFromItem?.name} to ${taskToItem?.name}`
				const nameLink = `Link -Task ${taskFromItem?.name} to ${taskToItem.name}`
				const nameEnd = `Link End -Task ${taskFromItem?.name} to ${taskToItem?.name}`
				const selInfoS:ISelDiagItem = {
					type: e_SeqDiagElement.LinkStart,
					id: link.id,
					sname: `Slink${link.id}`,
					desc: nameStart,
				}
				const selInfoL:ISelDiagItem = {
					type: e_SeqDiagElement.Link,
					id: link.id,
					sname: `link${link.id}`,
					desc: nameStart,
				}
				const selInfoE:ISelDiagItem = {
					type: e_SeqDiagElement.LinkEnd,
					id: link.id,
					sname: `Elink${link.id}`,
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
const handlekeyUp=(e:KeyboardEvent,info:e_SeqDiagElement)=>{
	console.log('key up inside Link', e.key, ' startIsHover =', startIsHover)
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
						onMouseEnter={(e) => handleMouseEnter(selInfoS)}
						onMouseLeave={(e) => handleMouseLeave(selInfoS)}
						onMouseUp={(e) => onMouseUp && onMouseUp(selInfoS)}
						onClick={e=> alert(`Click on ${selInfoS.sname}`)}
					
					/>
				)
				const polypoints = path.map((item) => `${item.x},${item.y} `).join(' ')
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
						onMouseEnter={(e) => handleMouseEnter(selInfoL)}
						onMouseLeave={(e) => handleMouseLeave(selInfoL)}
						onMouseUp={(e) => onMouseUp && onMouseUp(selInfoL)}
						onClick={e=> alert(`Click on ${selInfoL.sname}`)}
						
					/>
				)
				output.push(
					<polygon //end triangle
						key={selInfoE.sname}
						className={classnameE}
						points={trianglePoints}
						// fill={color}
						// stroke='1 px'
						onMouseEnter={(e) => handleMouseEnter(selInfoE)}
						onMouseLeave={(e) => handleMouseLeave(selInfoE)}
						onMouseUp={(e) => onMouseUp && onMouseUp(selInfoE)}
					/>
				)
			}
		})

		// now do return loops

		const retMap = taskFromItem.rets.map((link, indexPortIdFrom, retarray) => {
			// find to Task and matchind index
			const taskToItem = taskDtl.find((item) => item.id === link.to)
			const taskFromItem = taskDtl.find((item) => item.id === link.from)
			if (taskToItem === undefined) {
				console.log(`Undefined taskToitem at index ${indexPortIdFrom}`)
				return null
			}
			if (taskFromItem === undefined) {
				console.log(`Undefined taskFromItem at link id ${link.id}`)
				return null
			}
			const indexTaskIdFrom = taskIds.findIndex((item) => link.from === item)
			const indexTaskIdTo = taskIds.findIndex((item) => link.to === item)
			const indexPortTo = taskToItem?.tos.findIndex(
				(item) => link.id === item.id
			)

			const ppt0 = {
				x: taskFromItem.start + taskFromItem.duration,
				y:
					indexTaskIdFrom * iLayout.barSpacing -
					iLayout.barPad -
					indexPortIdFrom * iLayout.portLinkVoffset,
			}
			const pptEnd = {
				x: taskToItem.start + taskToItem.duration,
				y:
					indexTaskIdTo * iLayout.barSpacing +
						iLayout.barPad +
						indexPortIdFrom * iLayout.portLinkVoffset || 0,
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
				iLayout.portLinkVoffset * iLayout.barSpacing * indexPortIdFrom

			let path = [
				{ x: xScale(ppt0.x), y: ppt0.y + yFromOffset }, //subsequent indexes
			] //first point
			path.push({ x: xScale(ppt0.x), y: ppt0.y + yFromOffset })
			const midX = Math.max(
				xScale(ppt0.x + iLayout.portTriLength * 1.5),
				xScale(pptEnd.x) + iLayout.portTriLength * 1.5
			)

			path.push({ x: midX, y: ppt0.y + yFromOffset }) // end less triangle
			path.push({
				x: midX,
				y: pptEnd.y,
			}) // first dropper

			path.push({
				x: xScale(pptEnd.x + iLayout.portTriLength * 1.5),
				y: pptEnd.y,
			}) // end less triangle

			if (pptEnd) {
				// polygon uses x,y sequence in array
				const color = 'green'
				const triHeight = yScale(iLayout.portTriHeight)
				const triLength = yScale(iLayout.portTriLength)
				const nameStart = `Link Start -Task ${taskFromItem?.name} to ${taskToItem?.name}`
				const nameLink = `Link -Task ${taskFromItem?.name} to ${taskToItem?.name}`
				const nameEnd = `Link End -Task ${taskFromItem?.name} to ${taskToItem?.name}`

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
						key={`SLink${link.id}`}
						cx={xScale(ppt0.x)}
						cy={ppt0.y + yFromOffset}
						r={iLayout.PortDotSize * iLayout.barSpacing}
						className={'PortIn'}
						// fill={color}
						// stroke='1px'
						onMouseEnter={(e) =>
							handleMouseEnter({
								type: e_SeqDiagElement.LinkStart,
								id: link.id,
								sname: `Slink${link.id}`,
								desc: nameStart,
							})
						}
						onMouseLeave={(e) =>
							handleMouseLeave({
								type: e_SeqDiagElement.LinkStart,
								sname: `Slink${link.id}`,
								id: link.id,
								desc: nameStart,
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
							handleMouseEnter({
								type: e_SeqDiagElement.Link,
								id: link.id,
								sname: `link${link.id}`,
								desc: nameLink,
							})
						}
						onMouseLeave={(e) =>
							handleMouseLeave({
								type: e_SeqDiagElement.Link,
								id: link.id,
								sname: `link${link.id}`,
								desc: nameLink,
							})
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
							handleMouseEnter({
								type: e_SeqDiagElement.Link,
								id: link.id,
								sname: `Elink${link.id}`,
								desc: nameEnd,
							})
						}
						onMouseLeave={(e) =>
							handleMouseLeave({
								type: e_SeqDiagElement.Link,
								id: link.id,
								sname: `Elink${link.id}`,
								desc: nameEnd,
							})
						}
					/>
				)
			}
		})

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
