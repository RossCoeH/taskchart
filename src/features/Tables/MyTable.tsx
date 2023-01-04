import React, {
	PropsWithRef,
	useCallback,
	useEffect,
	useRef,
	useState,
} from 'react'
import { selTasks } from '../seq/seqSlice'
import usePortal from 'react-cool-portal'
import { useAppSelector } from '../../app/hooks/hooks'
import classes from './MyTable.module.scss'
import { Task } from '../seq/seqTypes'
import { useDebouncedState } from '@react-hookz/web'
import EditableCell from '../Editable/EditableCell'
import clx from 'classnames'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import  {faGripVertical, fas} from '@fortawesome/free-solid-svg-icons'
import { library } from '@fortawesome/fontawesome-svg-core'
import { background } from '../seq/Seq'
//  library.add(faGripVertical)

enum eCellType {
	'id' = 'id',
	'text' = 'text',
	'number' = 'number',
	'dragBox' = 'dragBox',
}

	interface IColDefs {
		ref: keyof Task | undefined
		title: string
		minWidth: number // miWidth required for drag limiting
		type: eCellType
		editable: boolean
		width?: number
		minNumber?: number
	}


const MyTable = (props: Partial<PropsWithRef<HTMLElement>>) => {
	const tasks = useAppSelector(selTasks.selectAll)
	console.log(`MyTable tasks`, tasks)
	 const { Portal } = usePortal({ containerId: "my-portal-root" });

	const colDefs: IColDefs[] = [
		{
			ref: undefined,
			title: 'Drag',
			minWidth: 50,
			width:50,
			type: eCellType.dragBox,
			editable: false,
		},
		{
			ref: 'id',
			title: 'ID',
			minWidth: 30,
			width:50,
			type: eCellType.id,
			editable: false,
		},
		{
			ref: 'name',
			title: 'Task Name',
			minWidth: 200,
			width:300,
			type: eCellType.text,
			editable: true,
		},
		{
			ref: 'duration',
			title: 'Time',
			minWidth: 60,
			width:80,
			type: eCellType.number,
			editable: true,
		},
	]

	const DragCell: React.FC<{ isHeader: boolean }> = (isHeader) => {
		const handleClick = () => {
			if (!isHeader) alert('Drag Attempted')
		}

		return (
			<div
				className={isHeader ? clx(classes.dragCell, classes.th) : ' '}
				onClick={handleClick}
		>
		"."
			</div>
		)
	}

	const [isColDrag, setIsColDrag] = useState<number>(0)
	const [activeColIdx, setActiveCol] = useState<number>(-1) // use -1 for not active so inded 0 can be tested
const [mouseMovePosible, setMouseMovePosible] = useState<boolean>(true)
const [activeEditCellKey, setActiveEditCellKey] = useState<string>("")
	const [ptMouseStart, setPosMouseStart] = useState<
		{ x: number; y: number } | undefined
	>(undefined)
	const [colWidths, setColWidths] = useState<number[]>([])
	const [ptMouseNow, setPtMouseNow] = useDebouncedState<
		{ x: number; y: number } | undefined
	>(undefined, 300, 0)
	const [tableHeight, setTableHeight] = useState('auto')

	const tableRef = useRef<HTMLTableElement>(null)
	useEffect(() => {
		// set initial colwidths once
		//	console.log(`running useEffect on tableRef`, tableRef.current)
		setColWidths(
			colDefs.map(
				(item, idx) => Math.max(item.minWidth, item.width || 150)
				//	tableRef.current?.style={grid-template-columns:{colDefs.map((item,idx)=>`minmax 10px , ${colWidths[idx].width}`}}
			)
		)
	}, [tableRef.current])

	// create array of references
	const colRefs = useRef<(HTMLTableCellElement | null)[]>(
		colDefs.map((item) => null) || [null]
	)

	const mouseDownResize = (
		e: React.MouseEvent<HTMLDivElement>,
		idx: number
	) => {
		const ptStart = { x: e.clientX, y: e.clientY }
		setPosMouseStart(ptStart)
		e.stopPropagation()
		setActiveCol(idx)
	}

	const validateCell = (
		value: number | string,
		rowItem: Task,
		colIdx: number
	): string | undefined => {
		switch (colDefs[colIdx].ref) {
			case 'name':
				if (typeof value !== 'string') return 'Name is not text'
				const matchList = tasks.filter(
					(task) =>
						task.id !== rowItem.id &&
						task.name.toUpperCase().trim() === value.toUpperCase().trim()
				)
				//	console.log('matchList to value- count', matchList ,value, matchList.length)
				if (matchList.length > 0) return 'Name is already in use'
				break

			default:
				return undefined
		}
	}

	const Header = () => {

		const resizeStyle = {
			height: (activeColIdx >= 0 && tableRef.current?.offsetHeight) || '100%',
			// check width incase it is at mimimum - if so add a class tochange cursor on drag
		}
		//console.log(`resizeStyle`, resizeStyle)
		return (
			<thead className={clx(classes.thead)}>
				<tr className={clx(classes.tr)}>
					{colDefs.map((item, idx) => {
						const cwidth: number = colWidths[idx] || 6
						if (item.type === eCellType.dragBox)
							return (
								<th
									className={clx(classes.theadcell)}
									key={`dc_${idx}`}
								>
									<DragCell isHeader={true} key={`col-${idx}`} />
								</th>
							)
						else { // retrun lower cell
						// const ref : (HTMLTableCellElement|undefined) =colRefs.current!  colRefs.current[idx] || undefined
							let colIsMinWidth: boolean = isColMinWidth(colRefs, idx, colDefs)

							return (
								<th
									key={`col-${idx}-${item.ref}`}
							style={{ width: cwidth, position: 'relative' }}	
										className={classes.theadcell}
										ref={(ref) => (colRefs.current[idx] = ref)}
						      
									>
									{/* 			== note specify width of span here so that the columns resize and first display honours size*/}
									<span className={clx(classes.span)}  >
										{item.title}
										<div
											className={clx(classes.resizehandle ,{[classes.resizeAtMin]:colIsMinWidth})}
											style={resizeStyle}
											onMouseDown={(e) => mouseDownResize(e, idx)}
											onMouseMove={mouseMoveHandler}
										></div>
									</span>
								</th>
							)
						}
					})}
				</tr>
			</thead>
		)
	}

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
		(e) => {
			console.log(
				`mousemove event`,
				e.clientX,
				e.clientY,
				activeColIdx,
				' diff',
				ptMouseStart && e.clientX - ptMouseStart.x
			)
			if (activeColIdx > -1) {
				const mousePt: { x: number; y: number } = { x: e.clientX, y: e.clientY }
				const cref = colRefs.current[activeColIdx]
				if (cref !== null) {
					// console.log(e,`mouse at ${e.clientX},${e.clientY} , offset  ${colRefs.current[activeColIdx]?.offsetLeft}`)
					if (!ptMouseStart) return
					let newColwidths = { ...colWidths }
					const computedStyle = getComputedStyle(cref)
					const gridColWidth = Number(
						tableRef.current?.style.gridTemplateColumns[activeColIdx]
					)

					const crefRect = cref.getClientRects()[0]
					console.log(
						`mousex vs clientrect`,
						e.clientX,
						crefRect.x + crefRect.width,
						crefRect.right
					) //.x+crefRect.width  )
					const calcNewWidth = e.clientX - crefRect.x
					const colMinAllowed =colDefs[activeColIdx].minWidth||60
					// now check if going past min value 
					if(calcNewWidth < colMinAllowed){
						console.log(`colresise is as Minimum already`)
						cref.style.cursor='not-allowed'
						cref.style.backgroundColor='Crimson'
					}
					const newWidth = Math.max(calcNewWidth, 15)
					//	console.log(`newWidth  : e.clientX ptMouseStart.x `, newWidth, e.clientX,ptMouseStart.x)
					//		console.log(`cref.offsetLeft, cref.offsetWidth`, cref.offsetLeft, cref.offsetWidth)
					//console.log('e.target.computedStyle',colRefs?.current[activeColIdx]?.getComputedStyle(paddingLeft))
					newColwidths[activeColIdx] = newWidth
					//		 console.log(`newColwidth  at ${activeColIdx} =`, newColwidths[activeColIdx],e.clientX,ptMouseStart.x,cref.clientLeft,cref.getBoundingClientRect())
					setColWidths(newColwidths)
					cref.style.width=`${newWidth}px`
					setPtMouseNow({ x: e.clientX, y: e.clientY })
				}

				if (activeColIdx > -1) {
					setPtMouseNow(mousePt)
				}
			}
		},
		[activeColIdx, colDefs]
	)

	const mouseUpHandler = useCallback(
		(e) => {
			if (activeColIdx > -1) {
				e.stopPropagation()
				if (activeColIdx > 0) {
					//  setIsColDrag(0);
					setActiveCol(-1)
					console.log(`mouseUp -stopped tracking`)
				}
			}
		},
		[activeColIdx, mouseMoveHandler]
	)

	// useEffect(() => {
	// 	if (activeColIdx >= 0) {
	// 		window.addEventListener('mousemove', mouseMoveHandler)
	// 		window.addEventListener('mouseup', mouseUpHandler)
	// 		return () => {
	// 			window.removeEventListener('mousemove', mouseMoveHandler)
	// 			window.removeEventListener('mouseup', mouseUpHandler)
	// 		}
	// 	}
	// }, [mouseMoveHandler, mouseUpHandler])

	//console.log(`tableRef.current`, tableRef.current)

	useEffect(() => {
		if (typeof tableRef.current === typeof HTMLTableElement) {
		console.log(`${tableRef.current} -running tableHt effect`, tableRef.current!==null&& tableRef.current.offsetHeight, typeof tableRef.current)
			if (tableRef.current !== null) {
				if (
					tableRef.current !== null &&
					tableRef.current?.offsetHeight !== undefined
				) {
					const tHeight = tableRef.current.offsetHeight.toString()
					setTableHeight(tHeight)
				} else setTableHeight('auto')
			}
		}
	}, [tableRef.current])

	interface ICellValue {
		rowItem: Task
		colIdx: number
	}

	const GetCellValue = ({ rowItem, colIdx }: ICellValue) => {
		// const {rowItem,colIdx} =props
		if (tasks === undefined || colDefs === undefined) return null // 'no data')
		if (colIdx === undefined) return null
		if (colDefs[colIdx].type === eCellType.dragBox)
			return <DragCell isHeader={false} />
		const cref: keyof Task | undefined = colDefs[colIdx].ref || undefined
		// console.log(`cell rowId, colId`, rowItem, colIdx)
		// console.log(` cellValue`, rowItem, colDefs[colIdx])
		//  let value =undefined
		//  if (cref !== undefined) 		{ const pointer = colDefs && colDefs[colIdx]?.ref
		//   value =( pointer !== undefined  && cref.[colDefs[colIdx]][pointer]) || undefined

		const value =
			cref !== undefined
				? rowItem[cref]
				: colDefs[colIdx].type === eCellType.text
				? ''
				: 0
		//	console.log(`Cell Value @ ${rowItem.id} ${colDefs[colIdx].ref} :`, value)

		const startEdit=(e:any):void=>{
			console.log("activecell set to")
			setActiveEditCellKey (e.target?.mykey)
			
		}
		const mykey:string=`cell ${rowItem.id}-col${colIdx}`
		const isEditing =(activeEditCellKey===mykey)

		return (
			<EditableCell
				mykey={mykey}
				editable={true}
				isediting={isEditing}
				setactive={()=>setActiveEditCellKey(mykey)}
				onClick={(e:any)=>startEdit(e)}
				value={value}
				minNumber={
					typeof value === 'number' && colDefs[colIdx]?.minNumber
						? 0
						: undefined
				}
				validator={(value: number | string) =>
					validateCell(value, rowItem, colIdx)
				}
				onChange={(e: any) => true} //console.log(`editableCell change`, e)}
			/>
		)
	}

	return (
		<>
			<p>my table mouse start {JSON.stringify(ptMouseStart?.x)}</p>
			<p>my table mouse now {JSON.stringify(ptMouseNow?.x)} </p>
			<p> colwidths: {JSON.stringify(colWidths)}</p>
			<table className={classes.table} ref={tableRef}>
				<Header />
				<tbody>
					{tasks.map((item) => {
						return (
							<tr key={item.id} className={clx(classes.tr, classes.th)}>
								{colDefs.map((col, colIdx) => {
									// const cvalue =colIdx
									// console.log(`cell id, idc`, item.id, colIdx, cvalue)
									return (
										<td
											key={`${item.id} -${colIdx}`}
											className={clx(classes.td)}
										>
											<GetCellValue rowItem={item} colIdx={colIdx} />
										</td>
									)
								})}
							</tr>
						)
					})}
					
				</tbody>
			</table>
		</>
	)
}
export default MyTable
function isColMinWidth(colRefs: React.MutableRefObject<(HTMLTableCellElement | null)[]>, idx: number, colDefs: IColDefs[]) {
	let ref = colRefs.current[ idx ]
	let colIsMinWidth: boolean = true
	if (ref instanceof HTMLElement) {
		const mWidth: number = colDefs[ idx ].minWidth || 15 // hardcoded min width - should not be needed
		colIsMinWidth = (ref.getClientRects()[ 0 ].width <= mWidth)
	}
	return colIsMinWidth
}

