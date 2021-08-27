import { IUseResizeObserverCallback, useDebouncedCallback, useMeasure, useResizeObserver } from '@react-hookz/web'
import React, { useState, ReactHTMLElement, CSSProperties, useRef, useDebugValue, useEffect, useCallback, LegacyRef } from 'react'
import { useSelector } from 'react-redux'
// import { Container, Section, Bar } from 'react-simple-resizer'
import { useAppSelector } from '../../app/hooks'
import { selTasks } from './seqSlice'
import { Task } from './seqTypes'
import './TaskList.scss'

interface Icol {
	Header: String
	accessor: keyof Task
	width: string
  minWidthPx:number
}
const InitColumns: Icol[] = [
	{
		Header: 'Id',
		accessor: 'id',
		width: '5em',
    minWidthPx:5
	},
	{
		Header: 'Task Name',
		accessor: 'name',
		width: '15em',
    minWidthPx:5,
	},
	{
		Header: 'Duration',
		accessor: 'duration',
		width: '5em',
    minWidthPx:5,
	},
]

const CreateHeaders = ((colOrder:(keyof Task)[],columns:Icol[])=>{
   const newRef=useRef<any>()
  if(Array.isArray(colOrder))  return (
   colOrder.map((col, index: number)  => {
     const matchCol = columns.find(column=>(col===column.accessor))
     const matchText =  matchCol && matchCol['Header'] || "?"
     return( {
    text: matchText,
    minWidthPx:(matchCol && matchCol.minWidthPx) ||5,
    ref: newRef,
  })
   })
  )
  else 
  return (typeof colOrder === 'number')?[{
    text: columns[colOrder]['Header']||"?",
    minWidthPx:(columns[colOrder].minWidthPx) ||5,
    ref: newRef,
  }]:[]

})

const TaskList = () => {
	const tasks = useAppSelector(selTasks.selectAll)
	const [columns, setColumns] = useState(InitColumns)
	const colOrder: (keyof Task)[]= ['id' as const,'name' as const ,'duration' as const] 
	const [measurements, ref] = useMeasure()
  const [activeColIndex, setActiveColIndex] = useState<number|undefined>(undefined)
  useDebugValue(activeColIndex ,activeColIndex=>{return `activeCellIndex ${activeColIndex}`})
  const tableElement = useRef<any|null>(null)

// trying rect-hookz
const [rect, setRect] = useState<DOMRectReadOnly>();
  useResizeObserver(ref, (e) => setRect(e.contentRect))
const cb = useDebouncedCallback(
    ((e) => setRect(e.contentRect)) as IUseResizeObserverCallback,
    [setRect],
    500
  );
  useResizeObserver(ref, cb)
const getHeaders =  CreateHeaders(colOrder,columns)
// react-hooks

	const HeaderRow= columns &&(
    <thead>
    <tr> 
    
			{
       getHeaders.map((item, index) => {
        // console.log(`header index vs activeCellIndex`,  index,activeColIndex)
        return(
				<th   
        className='tableList header'  
        key = {`${index}=${item.text}`}
        ref={item.ref}
        

        >
         <span>{columns[index]['Header']||"?"} </span>
	      <div className={`tableList resize-handle ${activeColIndex === index ? 'active' : 'idle'}`}
        style={{width:"1em",height:'0.5em' , cursor:'col-resize'}}
        // onMouseDown ={()=>handle_mouseDown_resize(index)}
       >
      </div>
        </th>
			) }   )
}

		</tr></thead>
	)

	const tRows = (columns: Icol[]) => {
	
		if (columns === undefined) return null
		return tasks.map((task: Task) => (
				<tr className='taskList row'>
				{columns.map((col, index) => (
								<tr className= 'tableList'>
									<td className= 'tableList' key={`${task.id}-${index}`}>
										<p>{task[(colOrder[index])]} </p>
									</td>
								</tr>
	
				))}
			</tr>
		))
	}
  const containerStyle :CSSProperties= {
  height: "500px",
  userSelect: "none",
  fontSize: "16px",
  fontFamily: "sans-serif",
  textAlign: "center",
  whiteSpace: "nowrap"
};

// const ColMouseMove_resize= useCallback((e:MouseEvent) => {

// 	const gridColumns = colOrder.map((col, i:number) => {
//     // console.log(`activeColIndex ${activeColIndex} - getHeaders[i].ref.current.offsetLeft`, getHeaders[i].ref.current.offsetLeft)
// 	  if (i === activeColIndex && getHeaders && getHeaders[i].ref.current !== null) {
// 	    // Calculate the column width

// 	    const width = e.clientX - (getHeaders && getHeaders[i].ref.current.offsetLeft);

// 	    if (width >= 5) {
//         console.log(`newWidth= `, width )
// 	      return `${width}px`;
// 	    }
// 	  }

// 		// Otherwise return the previous width (no changes)
// 	  return `${getHeaders &&getHeaders[i].ref.current.offsetWidth}px`;
// 	})


// 	// Assign the px values to the table
// 	 if (tableElement.current)  {tableElement.current.style.gridTemplateColumns =
//     `${gridColumns.join(' ')}`}

// }, [activeColIndex, columns, colOrder]);


// const handle_mouseDown_resize= (index:number)=>{
//   console.log(`mouseDown on resize index ${index}`)
//   setActiveColIndex(index)
// }

// function ColMouseUp_resize() {return useCallback(() => {
//   setActiveColIndex(-1);
//   RemoveListeners();
// }, [setActiveColIndex, RemoveListeners])};

// function RemoveListeners(){useCallback(() => {
//   window.removeEventListener('mousemove', ColMouseMove_resize);
//   window.removeEventListener('mouseup', RemoveListeners);
// }, [ColMouseMove_resize])}

// console.log(`activeColIndex`, activeColIndex)
// useEffect(() => {
//   // console.log(`inside useEffect activeColIndex=`, activeColIndex)
//   if (activeColIndex !== undefined) {
//     console.log(`window mousemove, mouseup watch started`)
//     window.addEventListener('mousemove', ColMouseMove_resize);
//     window.addEventListener('mouseup', ColMouseUp_resize);
//   }
// },[activeColIndex,ColMouseMove_resize,ColMouseUp_resize])

	return (

		// <pre>{JSON.stringify(measurements)}</pre> 
	<table 
  ref={tableElement}
  className= 'tableList-wrapper tableList'>
			{HeaderRow}
			{tRows}
		</table>
		
	)
}

export default TaskList
