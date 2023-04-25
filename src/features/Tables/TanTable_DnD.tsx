import React, { FC,  useEffect, useRef, useState } from 'react'
import './TanTableDnD.css'

import {
	createColumnHelper,
	ColumnResizeMode,
	ColumnDef,
//	Column,
// Cell,
	Row,
	RowData, // needed for editing extension
//	getFilteredRowModel,
	getPaginationRowModel,
	flexRender,
	getCoreRowModel,
	useReactTable,
//	ColumnMeta,
	CellContext,
	ColumnSizingState,
} from '@tanstack/react-table'

import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { ILayout, ITaskDtl, Task } from '../seq/seqTypes'
import { useAppDispatch } from '../../app/hooks/hooks'
import {  tasksReorder, tasksUpdateOne } from '../seq/seqSlice'
import { EntityId } from '@reduxjs/toolkit'
import { AxisScale, AxisScaleOutput } from '@visx/axis'
import {scaleLinear } from '@visx/scale'
import { SeqDrawTopAxis } from '../seq/SeqDrawTopAxis'

// add an interface for row update editing
declare module '@tanstack/react-table' {
	interface TableMeta<TData extends RowData> {
		updateData: (
			rowIndex: number,
			columnId: string,
			value: unknown
			// editRow:number,
			// editCol:number,
		) => void
	}
}

declare module '@tanstack/table-core' {
	interface ColumnMeta<TData extends RowData, TValue> {
		enableColumnEdit: boolean
		// iLayout:ILayout,
		// xScale:typeof scaleLinear,
	}
}

// Give our default column cell renderer editing superpowers!
// now extended with meta in columnDef to enable or disable column editing
// if typeof(initialValue is a number then input is limited to be numeric input only
const defaultColumn: Partial<ColumnDef<Task>> = {
	cell: function Cell({ getValue, row: { index }, column: { id }, table }) {
		const initialValue = getValue()
		const [isEditing, setIsEditing] = useState<boolean>(false)
		// We need to keep and update the state of the cell normally
		const [value, setValue] = React.useState(initialValue)
		// get the column def for the cell and then check if the columnEnableEdit is true
		const thisColumnDef = table?.getColumn(id)?.columnDef
		const canEdit = thisColumnDef?.meta?.enableColumnEdit ?? false

		// When the input is blurred, we'll call our table meta's updateData function
		const onBlur = () => {
			value !== initialValue && table.options.meta?.updateData(index, id, value)
			// const tableRow= table.getRo
			// const newTask:Task= {id:row.id,name:
			setIsEditing(false)
		}
		interface ICustomInputWidth {
			value: number | string
			onChange?: Function
			onBlur?: Function
		}
		// add special handling for input so we can control width
		// from JS @ https://jsfiddle.net/cabralpinto/h32wob50/1/
		const CustomInputWidth = (
			props: React.DOMAttributes<HTMLInputElement> &
				React.DetailedHTMLProps<
					React.InputHTMLAttributes<HTMLInputElement>,
					HTMLInputElement
				>
		) => {
			const [content, setContent] = useState<
				string | number | readonly string[]
			>('')
			const [width, setWidth] = useState(40)
			const span = useRef<HTMLSpanElement>(null)
			const inputRef = useRef<HTMLInputElement>(null)
			const { value, onChange, onBlur, ...rest } = props
			useEffect(() => {
				//if((typeof value )==='number'|| (typeof value === 'string'))
				if (value !== undefined) {
					value && setContent(value)
					console.log('input value ', value)
				}
			}, [value])

			useEffect(() => {
				console.log(
					'useEffect content',
					content,
					' OffsetWidth ',
					span?.current?.offsetWidth
				)
				if (span.current !== null)
					setWidth(Math.max(20, span?.current?.offsetWidth + 35))
				//35 used to allow for spin arrows
				else setWidth(35)
			}, [content])

			const changeHandler: React.ChangeEventHandler<HTMLInputElement> = (
				evt
			) => {
				setContent(evt.target.value)
			}

			return (
				<div is='custom' className='custom_input'>
					<span id='hide' ref={span} style={{ visibility: 'hidden' }}>
						{content}
					</span>
					<input
						className='custom_input'
						value={content}
						ref={inputRef}
						style={{ width }}
						autoFocus={true}
						onChange={changeHandler}
						onBlur={onBlur}
						type={typeof props.value}
					/>
				</div>
			)
		}

		const handleStartEdit = (e: React.MouseEvent<HTMLElement>): void => {
			const typeInput = typeof initialValue
			console.log('canEdit', canEdit, ' is of type ', typeInput)

			if (canEdit === true) setIsEditing(true)
		}

		const handleEditValue = (e: React.ChangeEvent<HTMLInputElement>): void => {
			if (typeof initialValue === 'number') {
				// covert to number as e.target.value is a string
				const numValue = parseFloat(e.target.value)
				setValue(numValue)
			} else {
				setValue(e.target.value)
			}

			setIsEditing(false)
		}

		// If the initialValue is changed external, sync it up with our state
		React.useEffect(() => {
			setValue(initialValue)
		}, [initialValue])

		if (
			isEditing === true &&
			(typeof value === 'string' || typeof value === 'number')
			//input can only be used with string or number type
		) {
			// get column width
			const colWidth = table?.getColumn(id)?.getSize()
			console.log('colWidth ', colWidth)
			//setting the input type flag restricts numbers to being numeric input
			return (
				<CustomInputWidth
					value={value}
					//	onChange={handleEditValue}
					onBlur={onBlur}
					autoFocus={true}
					//	type={typeof value}
				/>

				// <input
				// 	value={value}
				// 	onChange={handleEditValue}
				// 	onBlur={onBlur}
				// 	autoFocus={true}
				// 	type={typeof value}
				// />
			)
		} else if (typeof value === 'number') {
			const displayValue = value as number
			return (
				<span onClick={handleStartEdit} className='td input'>
					{value}
				</span>
			)
		} else if (typeof value === 'string') {
			const displayValue = value as string
			return (
				<span onClick={handleStartEdit} className='td input'>
					{value}
				</span>
			)
		}
	},
}

const columnHelper = createColumnHelper<Task>()

const DraggableRow: FC<{
	row: Row<Task>
	reorderRow: (draggedRowIndex: number, targetRowIndex: number) => void
}> = ({ row, reorderRow }) => {
	const [, dropRef] = useDrop({
		accept: 'row',
		drop: (draggedRow: Row<Task>) => reorderRow(draggedRow.index, row.index),
	})

	const [{ isDragging }, dragRef, previewRef] = useDrag({
		collect: (monitor) => ({
			isDragging: monitor.isDragging(),
		}),
		item: () => row,
		type: 'row',
	})

	return (
		<tr
			ref={previewRef} //previewRef could go here
			style={{ opacity: isDragging ? 0.5 : 1 }}
		>
			<td ref={dropRef}>
				<button ref={dragRef}>🟰</button>
			</td>
			{row.getVisibleCells().map((cell) => (
				<td key={cell.id}>
					{flexRender(cell.column.columnDef.cell, cell.getContext())}
				</td>
			))}
		</tr>
	)
}

export interface ITanTableDND {
	data: ITaskDtl[]
	iLayout: ILayout
	xScale: AxisScale<AxisScaleOutput>
}
export interface IgraphInfo {
	xScale: typeof scaleLinear
	yScale: Function
	iLayout: ILayout
}

const TanTableDnD: React.FC<ITanTableDND> = ({ data, iLayout, xScale }) => {
	//const data = useAppSelector(selTasks.selectAll)
	const dispatch = useAppDispatch()
  const bodyRef= useRef<HTMLDivElement> (null)
	const DrawGanttAxisHeader = (item: unknown,key:string) => (
		<svg key = {key} width={iLayout.graphWidth} height={45}>
			<SeqDrawTopAxis
				iLayout={iLayout}
				 xScale={xScale}/>
		</svg>
	)
	// js example of custom render
	// function MyCell({ value, columnProps: { rest: { someFunc } } }) {
	//   return <a href="#" onClick={someFunc}>{value}</a>
	// }
	const cellGanttValue = (cellItem: CellContext<Task, unknown>): any => {
		const startTime: number = cellItem.row.getValue('startTime') ?? 0
		const endTime: number = cellItem.row.getValue('endTime') ?? 10
		const rStart: number = (xScale(startTime) as number) ?? 10
		const rEnd: number = (xScale(endTime) as number) ?? 10
		const rWidth: number = rEnd - rStart
		const rHeight = iLayout.barSpacing - 2 * iLayout.barPad-4
		return (
			<svg 
			width={iLayout.graphWidth}
			height={iLayout.barSpacing-4}>
				<rect
					x={rStart}
					y={iLayout.barPad}
					height={rHeight}
					width={rWidth}
					color='purple'
					stroke='1'
					fill='green'
				></rect>
			</svg>
		)
		// end of "gantt item"
	}
// draw svg lines:
const DrawTablepath=():any=>
{
	return 		(	<rect
	        className='tableOverlayRect'
					x={0}
					y={200}
					height={200}
					width={700}
					color='purple'
					stroke='1'
					fill='green'
					opacity={0.2}
					
				></rect>
	)
}

	//put default columns her so ILayout and xScale are accessible in scope
	const defaultColumns: ColumnDef<Task>[] = [
		{
			accessorKey: 'id',
			cell: (info) => info.getValue(),
			header: () => <span key='id'>id</span>,
			footer: (props) => props.column.id,
			minSize: 5,
			maxSize: 60,
			size: 20,
			meta: {
				enableColumnEdit: false,
			},
		},
		{
			accessorKey: 'name',
			//cell: (info) => info.getValue(),
			header: () => <span key="name">Name</span>,
			footer: (props) => props.column.id,
			enableResizing: true,
			minSize: 5,
			maxSize: 250,
			size: 100,
			meta: {
				enableColumnEdit: true,
			},
		},
		{
			accessorFn: (row) => row.duration,
			id: 'duration',
			//cell: (info) => info.getValue(),
			header: () => <span key="duration">Duration</span>,
			footer: (props) => props.column.id,
			enableResizing: true,
			minSize: 5,
			maxSize: 60,
			//size:80,
			meta: {
				enableColumnEdit: true,
			},
		},
		{
			accessorKey: 'cycleTime',
			cell: (info) => info.getValue() ?? '-',
			header: () => <span key="cycleTime">Cycle Time</span>,
			footer: (props) => props.column.id,
			enableResizing: true,
			minSize: 5,
			maxSize: 250,
			size: 100,
			meta: {
				enableColumnEdit: false,
			},
		},
		{
			accessorKey: 'startTime',
			cell: (info) => info.getValue() ?? '-',
			header: () => <span key= "startTime">Start Time</span>,
			footer: (props) => props.column.id,
			enableResizing: true,
			minSize: 5,
			maxSize: 250,
			size: 100,
			meta: {
				enableColumnEdit: false,
			},
		},
		{
			accessorKey: 'endTime',
			cell: (info) => info.getValue() ?? '-',
			header: () => <span key="endtime">End Time</span>,
			footer: (props) => props.column.id,
			enableResizing: true,
			minSize: 5,
			maxSize: 250,
			size: 100,
			meta: {
				enableColumnEdit: false,
			},
		},
		{
			accessorKey: 'floatTime',
			cell: (info) => info.getValue() ?? '-',
			header: () => <span key="floatTime">Float</span>,
			footer: (props) => props.column.id,
			enableResizing: true,
			minSize: 5,
			maxSize: 250,
			size: 100,
			meta: {
				enableColumnEdit: false,
			},
		},
		// {
		// 	accessorKey: 'gantt',
		// 	cell: (item) => cellGanttValue(item),
		// 	header: (item) => DrawGanttAxisHeader(item,"gantt"),
		// 	footer: (props) => props.column.id,
		// 	enableResizing: true,
		// 	minSize: 5,
		// 	maxSize: 700,
		// 	size: 100,
		// 	meta: {
		// 		enableColumnEdit: false,
		// 	},
		// },
	]

	const [columns] = React.useState<typeof defaultColumns>(() => [
		...defaultColumns,
	])

	//store current editing col and row (if active)
	const [editingCol, setEditingCol] = useState<keyof Task | null>(null)
	const [editingRow, setEditingRow] = useState<EntityId | null>(null)

	//#region column resize - onEnd| onChange -onEnd waits until cursor lifted so
	// so use onChange which is immediate
	const [columnResizeMode, setColumnResizeMode] =
		React.useState<ColumnResizeMode>('onChange')
	const rerender = React.useReducer(() => ({}), {})[1]
	//#endregion

	//#region pagination
	function useSkipper() {
		const shouldSkipRef = React.useRef(true)
		const shouldSkip = shouldSkipRef.current
		// Wrap a function with this to skip a pagination reset temporarily
		const skip = React.useCallback(() => {
			shouldSkipRef.current = false
		}, [])

		React.useEffect(() => {
			shouldSkipRef.current = true
		})

		return [shouldSkip, skip] as const
	}
	//#endregion pagination

	const reorderRow = (fromRowIndex: number, toRowIndex: number) => {
		console.log('TODO define row move', fromRowIndex, ' to ', toRowIndex)

		dispatch(tasksReorder(Object.assign({ fromRowIndex, toRowIndex })))
		// data.splice(targetRowIndex, 0, data.splice(draggedRowIndex, 1)[0] as Task)
		// setData([...data])
	}

	// const rerender = () => setData(() => makeData(20))
	const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});



	const table = useReactTable({
		data,
		columns,
		defaultColumn, // used for editing cells
		getCoreRowModel: getCoreRowModel(),
		getRowId: (row) => row.id.toString(), //good to have guaranteed unique row ids/keys for rendering
		columnResizeMode: "onChange" as ColumnResizeMode,
    state: {
      columnSizing,
    },
    onColumnSizingChange: setColumnSizing,
		getPaginationRowModel: getPaginationRowModel(),
		debugTable: true,
		debugHeaders: true,
		debugColumns: true,

		// Provide our updateData function to our table meta
		meta: {
			updateData: (rowIndex, columnId, value) => {
				const dataRowId = data[rowIndex].id
				var newData = { [columnId]: value }
				dispatch(
					tasksUpdateOne({
						id: dataRowId,
						changes: {
							[columnId]: value,
						},
					})
				)

				console.log('olddata ', newData, columnId, value)
				//	alert('data changed to ' + [value, rowIndex, columnId].join(' - '))
			},
		},
	})

// update columnsize with actuals as per discussion:Tanstack/table: getSize returning the wrong value? #3947
useEffect(() => {
    const headcells: NodeListOf<HTMLElement> = document.querySelectorAll(
      ".tanTable thead th"
    );
    let newColumnSizing = {};
 
    headcells.forEach((headcell): void => {
      headcell.style.width = `${headcell.clientWidth}px`;

      newColumnSizing = {
        ...newColumnSizing,
        [headcell.dataset.id as string]: headcell.clientWidth,
      };
    });
  console.log("useEffect newColumnsSizing", newColumnSizing)
    table.setColumnSizing(newColumnSizing);  // here I updated the table columnSizing state
  }, [table.options.data]); // it is table data, or, you can use the data hook passed into table instance as well

	//	console.log('HeaderGroups ', table.getHeaderGroups())
	// note th needs style position is relative if colsizing is towork - else all resizers placed on top of each other at end of row.
	console.log("Table total:",table) 
	console.log("table State",table.getState())
//debugger
	return (
		<DndProvider backend={HTML5Backend}>
			<div className='p-2'>
				<div className='h-4' />
				<div className='flex flex-wrap gap-2'>
					<button
						onClick={() => alert('you clicked me')}
						className='border p-1'
					>
						Do nothing
					</button>
				</div>
				<div className='h-4' />
				<table className='tanTable'>
					<thead>
						{table.getHeaderGroups().map((headerGroup) => (
							<tr key={headerGroup.id}>
								<th />
								{headerGroup.headers.map((header) => (
									<th id={header.id}
										{...{
											key: header.id,
											colSpan: header.colSpan,
											style: {
												width: header.getSize(),
												position: 'relative',
											},
										}}
									>
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef.header,
													header.getContext()
											  )}
										<div
											{...{
												onMouseDown: header.getResizeHandler(),
												onTouchStart: header.getResizeHandler(),
												className: `resizer ${
													header.column.getIsResizing() ? 'isResizing' : ''
												}`,
												style: {
													transform:
														columnResizeMode === 'onEnd' &&
														header.column.getIsResizing()
															? `translateX(${
																	table.getState().columnSizingInfo.deltaOffset
															  }px)`
															: '',
												},
											}}
										/>
									</th>
								))}
							</tr>
						))}
					</thead>
					
					<tbody >
				
						{table.getRowModel().rows.map((row) => (
							<DraggableRow key={row.id} row={row} reorderRow={reorderRow} />
						))}
				
				
					</tbody>
			
					<tfoot>
						{table.getFooterGroups().map((footerGroup) => (
							<tr key={footerGroup.id}>
								<th></th>
								{footerGroup.headers.map((header) => (
									<th key={header.id} colSpan={header.colSpan}>
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef.footer,
													header.getContext()
											  )}
									</th>
								))}
							</tr>
						))}
					</tfoot>
				</table>
				{/* debug for data */}
				{/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
			{/* 	debug for col sizing 
				<pre>
        {JSON.stringify(
          {
						columnResizeMode:table.getState(),
            // columnSizing: table.getState().columnSizing,
            // columnSizingInfo: table.getState().columnSizingInfo,
          },
          null,
          2
        )}
      </pre> */}
			<pre>
			<p>BodyRef Ht : {(bodyRef.current?.clientHeight)??"-"}</p>
			<p>Table {table.getCenterTotalSize()}</p>
			<p>Colwidth Gantt { table?.getColumn("gantt")?.getSize()} </p>
			</pre>
			</div>
		</DndProvider>
	)
}	


export default TanTableDnD
