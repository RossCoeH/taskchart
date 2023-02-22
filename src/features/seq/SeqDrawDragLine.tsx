import React from 'react';
import { XY, e_SeqDiagElement } from './seqTypes';
import { EntityId } from '@reduxjs/toolkit';
import { ScaleLinear } from 'd3-scale';
import { dragAction } from './Seq';

export function SeqDrawDragLine(
	dragActionActive: dragAction,
	dragStart: { x: number; y: number; startId: EntityId; senderType: e_SeqDiagElement; } |
		undefined,
	yScale: ScaleLinear<number, number, never>,
	mousepos: XY | undefined,
	matchLinks: (dragStartTaskId: EntityId, dragEndTaskId: EntityId) => boolean,
	taskIds: EntityId[]) {
	return () => {
		//	const [ drawdragStyle, setDrawdragStyle ] = useState<string>('orange')
		// early exit if dragAction is none
		if (dragActionActive === dragAction.none)
			return null;
		//earlyy exit if start task does not exist
		if (dragStart?.startId === undefined)
			return null;

		const dragToTaskIndex = Math.floor(yScale.invert(mousepos?.y || -1));
		const linkAlreadyExists = dragToTaskIndex == -1
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
			// define color for return loops
			const endColor = !linkAlreadyExists &&
				dragToTaskIndex >= 0 &&
				taskIds &&
				taskIds.indexOf(dragStart.startId) > dragToTaskIndex
				? 'purple'
				: 'green';
			// console.log(`endcolor ${endColor}`)
			return (
				<>
					<line
						className='dragLine'
						x1={dragStart.x}
						y1={dragStart.y}
						x2={mousepos.x}
						y2={mousepos.y}
						stroke={linkAlreadyExists === true ? 'red' : endColor}
						strokeDasharray={linkAlreadyExists == true ? '5,5' : '0,0'}
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
}
