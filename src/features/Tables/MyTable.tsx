import React, { PropsWithChildren, PropsWithRef, useCallback, useEffect, useRef, useState } from 'react'
import { selTasks } from '../seq/seqSlice'
import { useAppSelector } from '../../app/hooks'
import classes from './MyTable.module.scss'
import { Task } from '../seq/seqTypes'
import {useDebouncedState, useMeasure} from '@react-hookz/web'
import EditableCell from '../Editable/EditableCell'
import clj  from 'classnames'
import validate from 'namor/dist/validate'

 enum eCellType {
	'id'='id',
	'text'='text',
	'number'='number',
	'dragBox'='dragBox',
}

const MyTable= (props:Partial<PropsWithRef<HTMLElement>>) => {
	const tasks = useAppSelector(selTasks.selectAll)
	console.log(`MyTable tasks`, tasks)

	interface IColDefs {
		ref: keyof Task |undefined
		title: string
		minWidth: number
		type: eCellType
		editable: boolean
		width?:number
		minNumber?: number
	}

	const colDefs: IColDefs[] = [
		{
			ref: undefined,
			title: 'Drag',
			minWidth: 20,
			type: eCellType.dragBox,
			editable: false,
		},
		{
			ref: 'id',
			title: 'ID',
			minWidth: 30,
			type: eCellType.id,
			editable: false,
		},
		{
			ref: 'name',
			title: 'Task Name',
			minWidth: 200,
			type: eCellType.text,
			editable: true,
		},
		{
			ref: 'duration',
			title: 'Time',
			minWidth: 60,
			type: eCellType.number,
			editable: true,
		},
	]

	const DragCell:React.FC<{isHeader:boolean} > = (isHeader) => { 
		const handleClick=  () => {
			if(!isHeader)	alert('Drag Attempted')}

			return(
		<div 
			className={isHeader? clj(classes.dragCell):' '}
			onClick={handleClick}
		
		></div>)
		}
	
//|HTMLTableHeaderCellElement| HTMLTableCellElement
 
//const [curRef, setcurRef] = useState<React.RefObject<HTMLTableCellElement>|null>(null)

//const [refMeasure, curRef] = useMeasure< HTMLTableCellElement>();
const [isColDrag, setIsColDrag] = useState<number>(0)
const [activeColIdx, setActiveCol] = useState<number>(-1)  // use -1 for not active so inded 0 can be tested
const [ptMouseStart, setPosMouseStart] = useState<{x:number,y:number}|undefined>(undefined)
const [colWidths, setColWidths] = useState<number[]>([])
const [ptMouseNow, setPtMouseNow] = useDebouncedState<{x:number,y:number}|undefined>(undefined,300,0)
const [tableHeight, setTableHeight] = useState('auto')

const tableRef = useRef<HTMLTableElement>(null)
useEffect(() => {
	// set initial colwidths once
//	console.log(`running useEffect on tableRef`, tableRef.current)
	setColWidths(colDefs.map((item,idx)=> Math.max(item.minWidth, (colWidths[idx])||6)
//	tableRef.current?.style={grid-template-columns:{colDefs.map((item,idx)=>`minmax 10px , ${colWidths[idx].width}`}}

	)
	)
}, [tableRef.current])
// create table ref so we can get height

// create array of references
const colRefs= useRef< (HTMLTableCellElement|null)[]>(colDefs.map(item=>null)||[null,])

const mouseDownResize = (e:React.MouseEvent<HTMLDivElement>, idx:number)=>{
// 	if(colRefs ===null || activeColIdx<0 )return
// const	cref= colRefs.current[idx]
// if (cref ===null) return
// const ptStart = {x:e.clientX-cref.offsetLeft,y:e.clientY-cref.offsetTop}
const ptStart = {x:e.clientX,y:e.clientY}
console.log(`start resize on col ${idx} -current widths `,colWidths,`startX = ${ptStart.x}`,e)
 setPosMouseStart(ptStart)
  e.stopPropagation()
	setActiveCol(idx)
	}

const validateCell=(value:number|string,rowItem:Task,colIdx:number):string|undefined=>{
	switch( colDefs[colIdx].ref){
	case 'name':
	if (typeof value !=='string') return 'Name is not text'
	const matchList = tasks.filter(task=> task.id !==rowItem.id && 	 (task.name.toUpperCase().trim() ===value.toUpperCase().trim() ) )
//	console.log('matchList to value- count', matchList ,value, matchList.length)
 if(  matchList.length>0 )
	 return 'Name is already in use'
	break

	default:return undefined
  }
}


	const Header = () => {

			// const mouseNearEnds=(e:React.MouseEvent<HTMLTableCellElement>,idx:number)=>{
			// ///	console.log(`mousenear ends e`, e)
			// 	const cRef= colRefs.current[idx]
			// 	const boxDims=cRef?.getBoundingClientRect()
			// 		console.log(`ref`, boxDims, cRef?.offsetLeft,cRef)
		    
			// 	if (cRef!==null  && boxDims?.left !==undefined){
      //       console.log(`mousex ${e.clientX} dif left =`, (e.clientX-boxDims?.left ))
			// 			if ((e.clientX-boxDims?.left)<20) cRef.style.backgroundColor='green' 
			// 		else  cRef.style.backgroundColor='orange'
			// 	}	

			// }
        // if (e.target.ref ===null || ) return false
				//  if(e.target.ref?.current !==null  && (e.clientX-ref.current?.offsetLeft)<10) return(true)
				// else	return false
			//	if (e.clientX-e.target.left<10)
			//console.log(`tableHeight `, tableRef.current?.offsetHeight)			
		 const resizeStyle= {height:(activeColIdx>=0)&&tableRef.current?.offsetHeight||'100%'}
	   //console.log(`resizeStyle`, resizeStyle)
		return (   
			<thead className={clj(classes.thead)}>
			<tr className={clj(classes.tr)}>
				{colDefs.map((item,idx) => {
					 const cwidth:number = colWidths[idx]||6
					if (item.type === eCellType.dragBox)
							return <th className={classes.th} key={`dc_${idx}`}><DragCell isHeader={true} key={`col-${idx}`}	/></th>
					else 
           {
						// const ref : (HTMLTableCellElement|undefined) =colRefs.current!  colRefs.current[idx] || undefined
				      let ref= colRefs.current[idx]
							 return  (	


					 <th 
					 key={`col-${idx}-${item.ref}`}
					 className= {classes.table_th }
					style= {{width:cwidth,position:'relative'}}
					ref= {ref => colRefs.current[idx] = ref}
					//onMouseDown={e=>mouseNearEnds(e,idx)}
					// onClick={ ()=>{console.log(`click`, colRefs)
						//  console.log( `idx ${idx} is size: `,colRefs.current[idx]?.getBoundingClientRect())}}
					 >
					{/* 			== note specify width of span here so that the columns resize and first display honours size*/}
					<span	className={clj(classes.span,{width:cwidth})}> 
				{item.title}
					<div
					className= {classes.resizehandle }
			     style={resizeStyle}
					onMouseDown={e=>mouseDownResize(e,idx)}
					onMouseMove={mouseMoveHandler}
					></div>
		</span>
					 </th>	
				 
					 )
				}
				})
	}
			</tr>	
			 </thead> 
     
		)}

	// const colDragStart=useCallback(  (e:React.MouseEvent<HTMLTableElement>,idx:number)=>{
	// 	   if (activeColIdx<0 || activeColIdx != idx) {
  //   const mouseStart:{x:number,y:number}= {x:e.clientX,y:e.clientY}
  //  console.log(`dragstart`, e.clientX,e.clientY, )
	//  setActiveCol(idx)
	// // if (isColDrag === 0) setIsColDrag(1)
	//  setPosMouseStart(mouseStart)
  //     }
  //   },
  //   []
  // )

  const mouseMoveHandler = useCallback(
    e => {
			console.log(`mousemove event`,  e.clientX,e.clientY, activeColIdx,' diff',ptMouseStart &&(e.clientX-ptMouseStart.x) )
      if ( activeColIdx >-1) {
    const mousePt:{x:number,y:number}= {x:e.clientX,y:e.clientY}
    const cref =colRefs.current[activeColIdx]
		if(  cref!== null ){ 
		// console.log(e,`mouse at ${e.clientX},${e.clientY} , offset  ${colRefs.current[activeColIdx]?.offsetLeft}`)
		if (!ptMouseStart ) return
		let newColwidths ={...colWidths}
		const computedStyle=getComputedStyle(cref)
	//	console.log(`parseFloat(computedStyle.paddingLeft) , parseFloat(computedStyle.paddingRight)`, parseFloat(computedStyle.paddingLeft) , parseFloat(computedStyle.paddingRight))
		// const calcpadleft = window.getComputedStyle(cref)
		// console.log(`calcpadleft props`, calcpadleft)
	 // const newWidth = Math.max(Math.floor(e.clientX-cref.offsetLeft) ,10) //does not cater for padding
		const gridColWidth=Number(tableRef.current?.style.gridTemplateColumns[activeColIdx])
//		console.log(`gridColWidth padLeft`, gridColWidth, cref.style.paddingLeft)
		const newWidth = Math.max(Math.floor(e.clientX-cref.offsetLeft-parseFloat(computedStyle.paddingLeft) - parseFloat(computedStyle.paddingRight)) ,10)
	//	console.log(`newWidth  : e.clientX ptMouseStart.x `, newWidth, e.clientX,ptMouseStart.x)
//		console.log(`cref.offsetLeft, cref.offsetWidth`, cref.offsetLeft, cref.offsetWidth)
		//console.log('e.target.computedStyle',colRefs?.current[activeColIdx]?.getComputedStyle(paddingLeft))
	   newColwidths[activeColIdx]=newWidth
//		 console.log(`newColwidth  at ${activeColIdx} =`, newColwidths[activeColIdx],e.clientX,ptMouseStart.x,cref.clientLeft,cref.getBoundingClientRect())
		setColWidths(newColwidths)
		setPtMouseNow({x:e.clientX,y:e.clientY})
		}
			
	 if (activeColIdx>-1) {	   
	 setPtMouseNow(mousePt)}
      }
    },
    [activeColIdx,colDefs]
  );


  const mouseUpHandler = useCallback(
    (e) => {
				if (activeColIdx >-1)	{
      e.stopPropagation();
      if (activeColIdx>0) {
      //  setIsColDrag(0);
				setActiveCol(-1)
				console.log(`mouseUp -stopped tracking`)}
      }
    },
    [activeColIdx,mouseMoveHandler]
  );

  useEffect(() => {
		if(activeColIdx>=0){
    window.addEventListener("mousemove", mouseMoveHandler);
    window.addEventListener("mouseup", mouseUpHandler);
		 return () => {
      window.removeEventListener("mousemove", mouseMoveHandler);
      window.removeEventListener("mouseup", mouseUpHandler);
}
   
    };
  }, [mouseMoveHandler, mouseUpHandler]);

//console.log(`tableRef.current`, tableRef.current)

useEffect(() => {
   if (typeof tableRef.current === typeof HTMLTableElement ){ 
//	console.log(`${tableRef.current} -running tableHt effect`, tableRef.current!==null&& tableRef.current.offsetHeight, typeof tableRef.current)
  if (tableRef.current!==null){
	  if (tableRef.current!==null && tableRef.current?.offsetHeight!==undefined){
		 const tHeight =  tableRef.current.offsetHeight.toString()
		setTableHeight(tHeight)
		}
	 else setTableHeight('auto')
	 }}
}, [tableRef.current]);

 interface ICellValue{
	 rowItem:Task, 
	 colIdx:number
 }

	const GetCellValue=({rowItem, colIdx}:ICellValue)=> {
   // const {rowItem,colIdx} =props
		if (tasks === undefined || colDefs === undefined) return null// 'no data')
		if (colIdx === undefined  ) return null
			if (colDefs[colIdx].type === eCellType.dragBox) return <DragCell isHeader={false}/>
      const cref:keyof Task|undefined =colDefs[colIdx].ref ||undefined
    	// console.log(`cell rowId, colId`, rowItem, colIdx)
		// console.log(` cellValue`, rowItem, colDefs[colIdx]) 
    //  let value =undefined
    //  if (cref !== undefined) 		{ const pointer = colDefs && colDefs[colIdx]?.ref
		//   value =( pointer !== undefined  && cref.[colDefs[colIdx]][pointer]) || undefined


     const  value =(cref!==undefined)? rowItem[cref] : ((colDefs[colIdx].type===eCellType.text)?'':0)
		//	console.log(`Cell Value @ ${rowItem.id} ${colDefs[colIdx].ref} :`, value)
      return (<EditableCell 
			key={`cell ${rowItem.id}-col${colIdx}`}
			editable={true}	
			value={value}
			minNumber= {(typeof value ==='number' && colDefs[colIdx]?.minNumber)?0:undefined}
			validator={(value:number|string)=> validateCell(value,rowItem,colIdx)}
			onChange ={(e: any)=>true }//console.log(`editableCell change`, e)}
			/>)
   
      }
	
	

	return (
		<>
		<p>mouse start {JSON.stringify(ptMouseStart?.x)}</p>
		<p>mouse now {JSON.stringify(ptMouseNow?.x)} </p>
		<p> colwidths: {JSON.stringify(colWidths)}</p>
		<table 
		className={classes.table}
		ref = {tableRef}>
			<Header />
			<tbody>
			{tasks.map(item => {
    return ( <tr key={item.id} 
		    className={clj(classes.tr,classes.headerCell )}>
      { colDefs.map((col,colIdx)=>{
    
     // const cvalue =colIdx
     // console.log(`cell id, idc`, item.id, colIdx, cvalue)
			return (<td 
			key={`${item.id} -${colIdx}`} 
			
			className={clj(classes.td)}>
			  <GetCellValue rowItem={item} colIdx={colIdx} />
			</td>)}
      )
      }
    </tr>)
    })
    }
		</tbody>
		</table>
		</>
	)
}
export default MyTable
