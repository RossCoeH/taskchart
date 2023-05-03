import { EntityId } from '@reduxjs/toolkit'
import TaskBar from './TaskBar'
import { scaleLinear } from '@visx/scale'
import {

	e_SeqDiagElement,
	ILinkOut,
	IMouseOverInfo,
	IDrawTasks,
	ISelInfo,
} from './seqTypes'



const SeqDrawTaskBars = ({
	taskDtl,
	xScale,
	iLayout,
	dragStartInfo,
	handleMouseDown,
	handleMouseEnter,
	handleMouseLeave,
	handleMouseUp,
	handleMouseMove,
}: IDrawTasks  ) =>  {
		const output =
			//useMemo(			() =>
			taskDtl.map((taskItem, index) => {
				// taskIds.map((id, index) => {
				//if (id ===undefined) {returnnull)}
				//	console.log(`taskEnts, id`, taskEnts, taskEnts[id])
				// const taskItem = taskDtl.find(item=>item.id===id)
				//const taskItem = taskDtl[index]
				if (taskItem === undefined) {
					return <text>{`Undefined item at index ${index}`}</text>
				}
				const taskname: string = taskItem.name || ''
				// need to get start and end as xscale allows for left offsets and it gets double counted
				const xStart = xScale(taskItem.startTime)
				const xEnd = xScale(taskItem.duration + taskItem.startTime) || 0
				const ytop = index * iLayout.barSpacing + iLayout.barPad
				const barHeight = Math.round(iLayout.barSpacing - 2 * iLayout.barPad)
				const fillColor = 'pink'
const selInfo:ISelInfo={
	type: e_SeqDiagElement.TaskBar,
id:taskItem.id,
sname:`TaskBar ${taskItem.id}`,
}
     
   
				const handleLocalMouseDown = (
					e: React.MouseEvent,
					index: number,
					taskId: EntityId
				) =>
					handleMouseDown({
						e,
						selInfo: selInfo,
						index,	
					})

				const handleLocalMouseUp = (
			{		e ,
					selInfo
					}:IMouseOverInfo
				) => {
					// console.log(`Mouseup on taskbar `, selInfo)
					handleMouseUp({
						e,
						selInfo
					})
				}
				const handleLocalMouseEnter = (
					e: React.MouseEvent,
					index: number,
				
				): void => {
					// console.log(
					// 	'Seq Chart entered taskid ',
					// 	selInfo.id,
					// 	'dragInfo ',
					// 	dragStartInfo
					// )
					if (
						dragStartInfo?.selInfo?.id !== undefined &&
						dragStartInfo?.selInfo?.type === e_SeqDiagElement.TaskBar &&
						(taskDtl[index]?.inLinks?.filter(
							(link: ILinkOut) => link.fromTaskId === dragStartInfo.selInfo.id
						).length > 0 ||
							taskDtl[index]?.retFroms?.filter(
								(link: ILinkOut) => link.fromTaskId === dragStartInfo.selInfo.id
							).length > 0)
					)
						alert('link already exists')
				}
				const taskExtraClasses = 'nodrop'

				return (
					<TaskBar
						key={`TaskBar ${taskItem.id}`}
						taskDtl={taskItem}
						ytop={ytop}
						index={index}
						barHeight={barHeight}
						xEnd={xEnd}
						xStart={xStart}
						fill={fillColor}
						extraClasses={taskExtraClasses}
						onMouseDown={(e: React.MouseEvent) =>
							handleLocalMouseDown(e, index, taskItem.id)
						}
						// onMouseEnter={(e: React.MouseEvent) =>
						// 	handleLocalMouseEnter(e, index, taskItem.id)
						// }
						onMouseMove={(e: React.MouseEvent) =>
							handleMouseMove({
								e,
								selInfo,
							
							})
						}
						onMouseUp={(e: React.MouseEvent) =>
							handleLocalMouseUp(
							{	e,selInfo}
							)
						}
						iLayout={iLayout}
					></TaskBar>
				)
			})
		//		,[taskIds, xScale, taskEnts]
		//	)
		return <g>{output}</g>
	}

export default SeqDrawTaskBars
