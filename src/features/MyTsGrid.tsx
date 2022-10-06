import { useEffect, useRef, useState } from 'react'
import classes from './MyTsGrid.module.css'
import clx from 'classnames'
import { object, string } from 'prop-types'
import { useAppSelector } from '../app/hooks/hooks'
import { selTasks } from './seq/seqSlice'
import { Task } from './seq/seqTypes'
import { EntityId } from '@reduxjs/toolkit'
import { NamedTupleMember } from 'typescript'
import { useDebouncedState } from '@react-hookz/web'

// based on https://codepen.io/adam-lynch/pen/GaqgXP
// https://adamlynch.com/flexible-data-tables-with-css-grid/

// Our real web app uses Vue.js but I'll stick to plain JavaScript here
const MyTsGrid = () => {
	const minColWidth = 50
	// The max (fr) values for grid-template-columns
	enum columnTypeToRatioMap {
		numeric = 1,
		textShort = 1.67,
		textLong = 3.33,
	}

	const tableRef = useRef<HTMLTableElement>(null)
	//  replaced with useRef const table = document.querySelector('table');
	/*
  The following will soon be filled with column objects containing
  the header element and their size value for grid-template-columns 
*/
	const taskIds = useAppSelector(selTasks.selectIds)
	const taskEnts = useAppSelector(selTasks.selectEntities)
	console.log(`tasks`, taskEnts)

	interface IColDefs<Task> {
		ref: keyof Task
		title: string | undefined
		minWidth: number
		width?: number
		editable?: boolean
		resizeable?: boolean
		type?: 'number' | 'text'
	}

	//  declare state for virtual rows so that insert or edit can occur without changing store
	interface IcellError {
		cellref: keyof Task
		error: string
	}
	interface ICellError {
		cellref: keyof Task
		error: string
	}

	interface IRowListItem {
		id: EntityId
		isEdited: boolean
		errors: IcellError[] | undefined
	}

	const colDefs: IColDefs<Task>[] = [
		{
			ref: 'id',
			title: 'ID',
			minWidth: 15,
			width: 30,
			editable: false,
			resizeable: false,
		},
		{
			ref: 'name',
			title: 'Task Name',
			minWidth: 65,
			width: 150,
			editable: true,
			resizeable: true,
		},
		{
			ref: 'duration',
			title: 'Time',
			minWidth: 15,
			width: 60,
			editable: true,
			resizeable: true,
			type: 'number',
		},
	]

	const [rowList, setRowList] = useState<IRowListItem[]>([])
	const RowHeight = 25

	// initialise with useEffect whenever the store changes
	useEffect(() => {
		if (taskIds === undefined) return
		if (taskIds.length < 1) return
		setRowList(
			taskIds.map((item) => {
				return { id: item, isEdited: false, errors: undefined }
			})
		)
	}, [taskIds])

	//  declare state to include editable row for insertion
	const [editRows, seteditRows] = useState<IRowListItem[]>([])

	interface IcellValue {
		rowIndex: number
		colIndex: number
	}

	const CellValue = ({ rowIndex, colIndex }: IcellValue) => {
		// debugger
		const colref = colDefs[colIndex].ref
		const rowItem = rowList[rowIndex].id
		const entryCheck =  taskEnts[rowItem] 
    const  entry = entryCheck && entryCheck[colref] || undefined
		// console.log(
		// 	` grid rowIndex, colIndex, colId, entry`,
		// 	rowIndex,
		// 	colIndex,
		// 	colref,
		// 	entry
		// )
		return <td>{entry}</td>
	}

	const HeaderRow = () => {
    
const [ptMouseStart, setPosMouseStart] = useState<{x:number,y:number}|undefined>(undefined)
const [colWidths, setColWidths] = useState<number[]>([])
const [ptMouseNow, setPtMouseNow] = useDebouncedState<{x:number,y:number}|undefined>(undefined,300,0)
		const handleMouseMove = () => {}
	// 	const handleResizeStart = (e: React.MouseEvent, index: number) => {
	// 		e.target.addEventListener('mousedown', initResize)
	// 	}
  // console.log(`header Titles`,  colDefs.map(item=>item.title))
		const inner =  colDefs.map((item, index) => {
      console.log(`item.title, item.ref,item = `, item.title, item.ref,item )
      return (
			<th key ={item.ref} className={clx(headerBeingResized)}>
				<span>
					{item.title}
					<div
						// onMouseDown={(e: React.MouseEvent) => handleResizeStart(e, index)}
						className={classes.resizeHandle}
            
					>|</div>
				</span>
			</th>
		)}
    )
console.log(`header Inner`, inner)
    return <tr key ='head'>{inner}</tr>
	}
interface IRowItem{
  rowIndex:number
}

	const RowItem = ({rowIndex}:IRowItem) => (
		<tr >
			{colDefs.map((item, colIndex) => CellValue({  rowIndex, colIndex }))}
		</tr>
	)


	const headerBeingResized = useRef<HTMLTableCellElement|null>(null)

	// The next three functions are mouse event callbacks

	// Where the magic happens. I.e. when they're actually resizing
	// const onMouseMove = (e: React.MouseEvent) =>
	// 	requestAnimationFrame(() => {
	// 		console.log('onMouseMove', e)

	// 		// Calculate the desired width
	// 		// if (tableRef && tableRef.current) {
	// 		// 	const horizontalScrollOffset = tableRef.current.scrollLeft
	// 		// 	const width =
	// 		// 		horizontalScrollOffset + e.clientX - headerBeingResized.offsetLeft
	// 		}

			// // Update the column object with the new size value
			// const column = columns.find(({ header }) => header === headerBeingResized)
			// column.size = Math.max(min, width) + 'px' // Enforce our minimum

			// // For the other headers which don't have a set width, fix it to their computed width
			// columns.forEach((column) => {
			// 	if (column.size.startsWith('minmax')) {
			// 		// isn't fixed yet (it would be a pixel value otherwise)
			// 		column.size = parseInt(column.header.clientWidth, 10) + 'px'
			// 	}
			// })

			/* 
    Update the column sizes
    Reminder: grid-template-columns sets the width for all columns in one value
  */
		// 	tableRef.current.style.gridTemplateColumns = columns
		// 		.map(({ header, size }) => size)
		// 		.join(' ')
		// })

	// Clean up event listeners, classes, etc.
	// const onMouseUp = () => {
	// 	console.log('onMouseUp')

	// 	window.removeEventListener('mousemove', onMouseMove)
	// 	window.removeEventListener('mouseup', onMouseUp)
	// 	// headerBeingResized.classList.remove('header--being-resized')
	// 	headerBeingResized ( null)
	// }

	// Get ready, they're about to resize
	const initResize = (target: HTMLElement) => {
		console.log('initResize on ', target.parentNode)
		const headerBeingResized = target.parentNode
		// window.addEventListener('mousemove', onMouseMove)
		// window.addEventListener('mouseup', onMouseUp)
		// headerBeingResized.classList.add('header--being-resized');
	}

	// // Let's populate that columns array and add listeners to the resize handles
	// document.querySelectorAll('th').forEach((header) => {
	// 	const max = columnTypeToRatioMap[header.dataset.type] + 'fr'
	// 	columns.push({
	// 		header,
	// 		// The initial size value for grid-template-columns:
	// 		size: `minmax(${min}px, ${max})`,
	// 	})
	// 	//header.querySelector('.resize-handle').addEventListener('mousedown', initResize);
	// })

	interface IHeaderCell {
		dataType: string
		value: string | number
	}

  const initGridTemplateColumns= (
    
    colDefs.map(item =>
  {if (item.minWidth) return `minmax(${item.minWidth}px, auto)`
    return 'minmax(15px, 350px) '
  }) ||['minmax(150px,auto) '])

  const [gridTemplateCols, setGridTemplateCols] = useState<string[]>(initGridTemplateColumns)
 const joinedGridtemplateCols = gridTemplateCols.join(' ')
 console.log(`joinedGridtemplateCols`, joinedGridtemplateCols)
	return (
		<table ref={tableRef} className={clx(classes.table,)} style={{gridTemplateColumns:joinedGridtemplateCols}}>
			<thead>
			
					<HeaderRow/>
				   {rowList.map((item,index)=><RowItem rowIndex={index} key={ rowList[index].id}/>)}
			</thead>
			    
		</table>
	)
}
export default MyTsGrid
