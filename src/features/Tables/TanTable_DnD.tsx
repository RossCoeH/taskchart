import React, { FC, InputHTMLAttributes, useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import './TanTableDnD.css'

import {
	createColumnHelper,
	ColumnResizeMode,
	ColumnDef,
	Column,
	Cell,
	Row,
	RowData, // needed for editing extension
	getFilteredRowModel,
	getPaginationRowModel,
	flexRender,
	getCoreRowModel,
	useReactTable,
	ColumnMeta,
} from '@tanstack/react-table'

import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Task } from '../seq/seqTypes'
import { useAppDispatch, useAppSelector } from '../../app/hooks/hooks'
import { selTasks, tasksReorder, tasksUpdateOne } from '../seq/seqSlice'
import { relative } from 'path'
import { EntityId, getType } from '@reduxjs/toolkit'
import { tasksUpsertOne } from '../seq/seqSlice'
import { JsxElement, TypeOfExpression } from 'typescript'
import { assert } from 'console'

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
		const thisColumnDef = table.getColumn(id).columnDef
		const canEdit = thisColumnDef.meta?.enableColumnEdit ?? false

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
			const CustomInputWidth=(props:React.DOMAttributes<HTMLInputElement>& React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>) => {
				const [content, setContent] = useState<string | number|readonly string[]>('')
				const [width, setWidth] = useState(40)
				const span = useRef<HTMLSpanElement>(null)
						const inputRef = useRef<HTMLInputElement>(null)
				const {value,onChange,onBlur ,...rest}=props
		useEffect(() => {
			  
					//if((typeof value )==='number'|| (typeof value === 'string'))
					 if(value !== undefined){
					value && setContent(value)
					console.log ('input value ',value)
				}
			}, [value])

				useEffect(() => {
					console.log("useEffect content",content,' OffsetWidth ',span?.current?.offsetWidth)
				if(span.current !== null ) setWidth(Math.max(20,span?.current?.offsetWidth+35)) //35 used to allow for spin arrows
				else setWidth(35)
				}, [content])

				const changeHandler: React.ChangeEventHandler<HTMLInputElement> = (
					evt
				) => {
					setContent(evt.target.value)
				}

				return (
					<div is='custom' 
					className='custom_input'>
						<span id='hide' ref={span} style={{visibility:'hidden'}}>
							{content}
						</span>
						<input
						 className='custom_input'
               value={content}
              ref={inputRef}
							style={{ width  }}
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
			console.log('canEdit', canEdit, 'is of type', typeInput)

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
			const colWidth = table.getColumn(id).getSize()
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

const defaultColumns: ColumnDef<Task>[] = [
	{
		accessorKey: 'id',
		cell: (info) => info.getValue(),
		header: () => <span>id</span>,
		footer: (props) => props.column.id,
		minSize: 5,
		maxSize: 60,
	
 size:20,
		meta: {
			enableColumnEdit: false,
		},
	},
	{
		accessorKey: 'name',
		//cell: (info) => info.getValue(),
		header: () => <span>Name</span>,
		footer: (props) => props.column.id,
		enableResizing: true,
		
		minSize: 5,
		maxSize: 250,
   size:100,
		meta: {
			enableColumnEdit: true,
		},
	},
	{
		accessorFn: (row) => row.duration,
		id: 'duration',
		//cell: (info) => info.getValue(),
		header: () => <span>Duration</span>,
		footer: (props) => props.column.id,
	  enableResizing: true,
		minSize: 5,
		maxSize: 60,
 //size:80,
		meta: {
			enableColumnEdit: true,
		},
	},
]

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

function TanTableDnD() {
	const data = useAppSelector(selTasks.selectAll)
	const dispatch = useAppDispatch()

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

	const table = useReactTable({
		data,
		columns,
		defaultColumn, // used for editing cells
		getCoreRowModel: getCoreRowModel(),
		getRowId: (row) => row.id.toString(), //good to have guaranteed unique row ids/keys for rendering
		columnResizeMode,
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

	console.log('HeaderGroups ', table.getHeaderGroups())
	// note th needs style position is relative if colsizing is towork - else all resizers placed on top of each other at end of row.
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
				<table>
					<thead>
						{table.getHeaderGroups().map((headerGroup) => (
							<tr key={headerGroup.id}>
								<th />
								{headerGroup.headers.map((header) => (
									<th
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
					<tbody>
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
				{/* debug for col sizing 
				<pre>
        {JSON.stringify(
          {
						columnResizeMode:table.getState().columnOrder,
            columnSizing: table.getState().columnSizing,
            columnSizingInfo: table.getState().columnSizingInfo,
          },
          null,
          2
        )}
      </pre> */}
			</div>
		</DndProvider>
	)
}

export default TanTableDnD
