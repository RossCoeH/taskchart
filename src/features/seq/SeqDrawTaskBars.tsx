import { EntityId } from "@reduxjs/toolkit"
import TaskBar from "./TaskBar"
import {scaleLinear} from '@visx/scale'
import { ITaskDtl, ILayout, e_SeqDiagElement, ILinkOut, IHandleSeqMouseDownWithTaskId, IHandleSeqMouseUpWithSelId, ISeqStartMouseDrag, IHandleSeqMouseMovewithIdType, NumberScale } from "./seqTypes"


interface IDrawTaskBars{
  taskDtl: ITaskDtl[],
   xScale:NumberScale,
   iLayout: ILayout, 
   handleSvgMouseDown: IHandleSeqMouseDownWithTaskId,
    handleSvgMouseUp: IHandleSeqMouseUpWithSelId,
     seqDragStartInfo: ISeqStartMouseDrag | undefined,
      handleSvgMouseMove: IHandleSeqMouseMovewithIdType,
      dragStartInfo?: ISeqStartMouseDrag ,
}

const SeqDrawTaskBars = ({taskDtl, xScale, iLayout, handleSvgMouseDown , handleSvgMouseUp, handleSvgMouseMove,dragStartInfo}:IDrawTaskBars)=> {
	return () => {
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

				const handleLocalMouseDown = (
					e:React.MouseEvent,
					index:number,

    ) => 					handleSvgMouseDown({e, senderType: e_SeqDiagElement.TaskBar, senderId: taskItem.id, index})
				
				const handleLocalMouseUp = (
					e: React.MouseEvent,
					selType: (typeof e_SeqDiagElement)[ keyof typeof e_SeqDiagElement ],
					id: EntityId,
					index: number
				) => {
					// console.log(`Mouseup on taskbar `, selInfo)
					handleSvgMouseUp({e, selType:e_SeqDiagElement.TaskBar, id, index})
				}
				const handleLocalMouseEnter = (
					e: React.MouseEvent,
					index: number,
					taskId: EntityId
				): void => {
					// console.log(
					// 	'Seq Chart entered taskid ',
					// 	taskId,
					// 	'dragInfo ',
					// 	dragStartInfo
					// )
					if (dragStartInfo?.startId !== undefined &&
						(taskDtl[ index ]?.inLinks?.filter(
							(link: ILinkOut) => link.fromTaskId === dragStartInfo.startId
						).length > 0 ||
							taskDtl[ index ]?.retFroms?.filter(
								(link: ILinkOut) => link.fromTaskId === dragStartInfo.startId
							).length > 0))
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
						onMouseDown={(e: React.MouseEvent) => handleLocalMouseDown({e, index,taskId: taskItem.id})}
						// onMouseEnter={(e: React.MouseEvent) =>
						// 	handleLocalMouseEnter(e, index, taskItem.id)
						// }
						onMouseMove={(e: React.MouseEvent) => handleSvgMouseMove(
							e,
					e_SeqDiagElement.TaskBar,
					taskId,
							index
            )}
						onMouseUp={(e: React.MouseEvent) => handleLocalMouseUp(
							e,
							e_SeqDiagElement.TaskBar,
						taskItem.id,
							index
						)}
						iLayout={iLayout}
					></TaskBar>
				)
			})
		//		,[taskIds, xScale, taskEnts]
		//	)
		return <g>{output}</g>
	}
}
export default SeqDrawTaskBars