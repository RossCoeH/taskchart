import React, { useState } from 'react'
import { Column, Table } from 'react-virtualized'
import Draggable from 'react-draggable'
import { selTasks } from '../features/seq/seqSlice'
import { Task } from '../features/seq/seqTypes'
import { useAppSelector } from '../app/hooks'
import {DraggableEvent}from'react-draggable'

const TOTAL_WIDTH = 500

enum eCellType {
	'id' = 'id',
	'text' = 'text',
	'number' = 'number',
	'dragBox' = 'dragBox',
}

interface IColDefs {
	ref: keyof Task | undefined
	title: string
	minWidth: number
	type: eCellType
	editable: boolean
	width: number
	minNumber?: number
}

const colDefs: IColDefs[] = [
	{
		ref: undefined,
		title: 'Drag',
		minWidth: 20,
		width: 20,
		type: eCellType.dragBox,
		editable: false,
	},
	{
		ref: 'id',
		title: 'ID',
		minWidth: 30,
		width: 30,
		type: eCellType.id,
		editable: false,
	},
	{
		ref: 'name',
		title: 'Task Name',
		minWidth: 200,
		width: 200,
		type: eCellType.text,
		editable: true,
	},
	{
		ref: 'duration',
		title: 'Time',
		minWidth: 60,
		width: 60,
		type: eCellType.number,
		editable: true,
	},
]

const vTableResize = () => {
	const list: Task[] = useAppSelector(selTasks.selectAll)

	// const initialState = {
	//   widths: {
	//     id: 0.1,
	//     name: 0.8,
	//     duration: 0.2
	//   }
	// };

	const [cdefs, setCdefs] = useState<IColDefs[]>(colDefs)
	interface IresizeRow {
		dataKey: keyof Task
		deltaX: number
	}

	const resizeRow = ({ dataKey, deltaX }: IresizeRow) => {
		setCdefs((prevState) => {
			const percentDelta = deltaX / TOTAL_WIDTH
			return prevState.map((col, idx) => {
				const newcol = { ...col }
				if (colDefs[idx].ref === dataKey)
					newcol.width = newcol.width + percentDelta
				// next line subtracts change form next column  if it exists
				if (idx > 0 && colDefs[idx - 1].ref === dataKey)
					newcol.width = newcol.width - percentDelta
				return newcol
			})
		})
	}

	const headerRenderer = ({
		dataKey,
		disableSort = true,
		label,
		
	}: IHeaderRenderer) => {
		return (
			<React.Fragment key={dataKey}>
				<div className='ReactVirtualized__Table__headerTruncatedText'>
					{label}
				</div>
				<Draggable
					axis='x'
					defaultClassName='DragHandle'
					defaultClassNameDragging='DragHandleActive'
					onDrag={(e:DraggableEvent, dragData)=>			resizeRow({
							dataKey,
							deltaX:dragData.deltaX}
						)
					}
					position={{ x: 0 ,y:0}}
				//	zIndex={999}
				>
					<span className='DragHandleIcon'>⋮</span>
				</Draggable>
			</React.Fragment>
		)
  }
		return (
			<Table
				width={TOTAL_WIDTH}
				height={300}
				headerHeight={20}
				rowHeight={30}
				rowCount={list.length}
				rowGetter={(info) => (typeof info ==='number') && list[info] || undefined}
			>
				<Column
					headerRenderer={headerRenderer}
					dataKey='id'
					label={cdefs[1].title}
					width={cdefs[1].width * TOTAL_WIDTH}
					disableSort={true}
				/>
				<Column
					headerRenderer={headerRenderer}
					dataKey:keyof Task='name'
					label={cdefs[2].title}
					width={cdefs[2].width * TOTAL_WIDTH}
					disableSort={true}
				/>
				<Column
					headerRenderer={headerRenderer}
					dataKey:keyof
					Tasks='duration'
					label={cdefs[3].title}
					width={cdefs[3].width * TOTAL_WIDTH}
					disableSort={true}
				/>
			</Table>
		)
	}

	interface IHeaderRenderer {
		dataKey: keyof Task
		disableSort: boolean
		label: string
	}
}

export default vTableResize
