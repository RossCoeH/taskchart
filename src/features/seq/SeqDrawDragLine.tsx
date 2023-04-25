import React from 'react';
import { XY, e_SeqDiagElement } from './seqTypes';
import { EntityId } from '@reduxjs/toolkit';
import { ScaleLinear } from 'd3-scale';
import { dragAction } from './Seq';

interface ISeqDrawDragLine{
	dragActionActive: dragAction,
	dragStart: { x: number; y: number; startId: EntityId; senderType: e_SeqDiagElement; } |
		undefined,
	xScale:ScaleLinear<number,number,never>,
	yScale: ScaleLinear<number, number, never>,
	mousepos: XY | undefined,
	matchLinks: (dragStartTaskId: EntityId, dragEndTaskId: EntityId) => boolean,
	taskIds: EntityId[]
}

export const  SeqDrawDragLine= ({
	dragActionActive,
	dragStart,
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
		if (dragStart?.startId === undefined)
			return null;

		const dragToTaskIndex = Math.floor(yScale.invert(mousepos?.y || -1));
		const linkAlreadyExists = dragToTaskIndex === -1
			? false
			: matchLinks(dragStart?.startId, taskIds[ dragToTaskIndex ]);

		// console.log(
		// 	`mouse dragActionActive, ${dragActionActive} from indexY ${dragToTaskIndex} to mousepos.x`,
		// 	dragActionActive
		// )
		//	const startTaskId = dragStart?.startId
		if (dragStart !== undefined &&
			mousepos !== undefined &&
			dragActionActive === dragAction.dragLine) {
			//define cursor style
			const endSize = linkAlreadyExists ||
				dragStart.startId === (taskIds[ dragToTaskIndex ] ?? -1)
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
				taskIds.indexOf(dragStart.startId) > dragToTaskIndex
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
						x1={dragStart.x}
						y1={dragStart.y}
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

