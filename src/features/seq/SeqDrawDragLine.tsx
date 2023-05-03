import React from 'react';
import { IDragStartItem, XY, e_SeqDiagElement } from './seqTypes';
import { EntityId } from '@reduxjs/toolkit';
import { ScaleLinear } from 'd3-scale';
import { dragAction } from './Seq';

interface ISeqDrawDragLine{
	dragActionActive: dragAction,
	dragStartItem: IDragStartItem,
	xScale:ScaleLinear<number,number,never>,
	yScale: ScaleLinear<number, number, never>,
	mousepos: XY | undefined,
	matchLinks: (dragStartTaskId: EntityId, dragEndTaskId: EntityId) => boolean,
	taskIds: EntityId[]
}

export const  SeqDrawDragLine= ({
	dragActionActive,
	dragStartItem,
	xScale,
	yScale,
	mousepos,
	matchLinks,
	taskIds}:ISeqDrawDragLine)  => {
		//	const [ drawdragStyle, setDrawdragStyle ] = useState<string>('orange')
		// early exit if dragAction is none
		if (dragActionActive === dragAction.none)
			return null;
		//earlyy exit if start task does not exist
		if (dragStartItem?.selInfo?.id === undefined)
			return null;

		const dragToTaskIndex = Math.floor(yScale.invert(mousepos?.y || -1));
		const linkAlreadyExists = dragToTaskIndex === -1
			? false
			: matchLinks(dragStartItem?.selInfo?.id, taskIds[ dragToTaskIndex ]);

		// console.log(
		// 	`mouse dragActionActive, ${dragActionActive} from indexY ${dragToTaskIndex} to mousepos.x`,
		// 	dragActionActive
		// )
		//	const startTaskId = dragStart?.startId
		if (dragStartItem !== undefined &&
			mousepos !== undefined &&
			dragActionActive === dragAction.dragLine) {
			//define cursor style
			const endSize = linkAlreadyExists ||
				dragStartItem.selInfo?.id === (taskIds[ dragToTaskIndex ] ?? -1)
				? 2
				: 5;
			// console.log(
			// 	`endsize ${endSize} startID ${dragStart.startId} endId ${
			// 		taskIds[dragToTaskIndex] ?? -1
			// 	} linkAlreadyExists ${linkAlreadyExists}`
			// )
			// define if return loop for colors
			const isReturnLoop= !linkAlreadyExists &&
				dragToTaskIndex >= 0 &&
				taskIds &&
				taskIds.indexOf(dragStartItem.selInfo.id) > dragToTaskIndex
			// define color for return loops
			var endColor = isReturnLoop
				? 'purple'
				: 'green';
				if (linkAlreadyExists) endColor='red'
		 console.log(`endcolor ${endColor}`)
			return (
				<>
					<line
						className='dragLine'
						x1={dragStartItem.x}
						y1={dragStartItem.y}
						x2={mousepos.x}
						y2={mousepos.y}
						stroke={ endColor}
						strokeDasharray={linkAlreadyExists === true ? '5,5' : '0,0'}
						strokeWidth='2' />
					<circle
						// cursor={(linkAlreadyExists===true  && dragStart.startId !== dragToTaskIndex) ? 'not-allowed' : 'crosshair'}
						className='dragCircle'
						cx={mousepos.x}
						cy={mousepos.y}
						stroke={endColor}
						fill={endColor}
						strokeWidth='2'
						// fill='none'
						r={endSize} />
				</>
			);
		} else {
			return null;
		}
	};

