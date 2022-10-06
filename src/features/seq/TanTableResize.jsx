import React, { MouseEventHandler, PropsWithChildren, ReactElement, useMemo } from 'react'
import { useTable, useBlockLayout, useResizeColumns, ColumnWithLooseAccessor, TableInstance, Row, TableOptions, HeaderProps, useColumnOrder, usePagination, useRowSelect, Meta, HeaderGroup, useFlexLayout, ColumnInstance } from 'react-table'
import { useAppSelector } from '../../app/hooks/hooks'
//import makeData from './MakeData.js'
import { selTasks } from './seqSlice'
import { Task } from './seqTypes'
import styles from './TanTableResize.module.scss'
import TaskBar from './TaskBar'

// -- good ref for starting Typesript React-Table at https://codesandbox.io/s/github/ggascoigne/react-table-example?file=/src/Table/Table.tsx


// export interface TableProperties<T extends Record<string, unknown>> extends TableOptions<T> {
//  // accessor: string
//   onAdd?: (instance: TableInstance<T>) => MouseEventHandler
//   onDelete?: (instance: TableInstance<T>) => MouseEventHandler
//   onEdit?: (instance: TableInstance<T>) => MouseEventHandler
//   onClick?: (row: Row<T>) => void
// }


// export interface TableTypeMap<P = {}, D extends React.ElementType = 'table'> {
//   props: P & {
//     //padding?: Padding;
//     //size?: Size;
//     stickyHeader?: boolean;
//   };
//   defaultComponent: D;
//  // classKey: TableClassKey;
// }
// export interface TableHeadTypeMap<P = {}, D extends React.ElementType = 'thead'> {
//   props: P;
//   defaultComponent: D;
//   //classKey: TableHeadClassKey;
// }
// export interface TableBodyTypeMap<P = {}, D extends React.ElementType = 'tbody'> {
//   props: P;
//   defaultComponent: D;
//   //classKey: TableBodyClassKey;
// }
// interface CN { className?: string; 
// //styles?:
// }
// interface Icol extends ColumnInstance{
//   name:string

// }
// : React.FC<HeaderProps<any>>
const DefaultHeader = ({ column }) => (
  <>{column.id.startsWith('_') ? null : camelToWords(column.id)}</>
)
const getStyles = (props, disableResizing = false, align = 'left') => [
  props,
  {
    style: {
      justifyContent: align === 'right' ? 'flex-end' : 'flex-start',
      alignItems: 'flex-start',
      display: 'flex',
    },
  },

]

  // const headerProps = <T extends Record<string, unknown>>(props: any, { column }: Meta<T, { column:( HeaderGroup<T> &  {align?:string} )}>) =>

  const headerProps = (props,  column ) =>
  getStyles(props, column && column.disableResizing, column && column.align)

const TableHooks = [
  useColumnOrder,
  //useFlexLayout,
  usePagination,
  useResizeColumns,
  useRowSelect,
  //selectionHook,
]

  // =================Table===========================
// export function Table<T extends Record<string, unknown>>(props: PropsWithChildren<TableProperties<T>>): ReactElement {

export function Table(props) {
const{ columns,data}=props
  const defaultColumn = React.useMemo(
    () => ({
       Header: DefaultHeader,
       accessor:'id',
    // When using the useFlexLayout:
  minWidth: 30, // minWidth is only used as a limit for resizing
  width: 150, // width is used for both the flex-basis and flex-grow
  maxWidth: 200, // maxWidth is only used as a limit for resizing
    }),
    []
  )


  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state,
    resetResizing,
  } = useTable(
    {
      columns,
      data,
      defaultColumn,
    },
    useBlockLayout,
    useResizeColumns
  )

// const Header: React.FC<Partial<TableHeadTypeMap> & CN> = ({ children, className, ...rest })  =>{ 

const Header = ({ children, className, ...rest })  =>{ 
return(
<div className={styles.tableHeader}>
    {headerGroups.map(headerGroup => (
              <div {...headerGroup.getHeaderGroupProps()} className={styles.tr}>
                {headerGroup.headers.map(column => (
                  <div {...column.getHeaderProps()} className={styles.th}>
                    {column.render('Header')}
                    {/* Use column.getResizerProps to hook up the events correctly */}
                    <div
                      {...column.getResizerProps()}
                      className={[styles.resizer, 
                        column.isResizing ? styles.isResizing : ''].join (' ')
                      }
                    />
                  </div>
                ))}
              </div>
            )
)}
           
</div>
)}

const myPrepareRow=()=> {rows.map((row, i) => {  
            row.getRowProps()       
              prepareRow(row)
              console.log(`prepareRow,i,value`,i, row,prepareRow)
})}

  return (
    <>
      <button onClick={resetResizing}>Reset Resizing</button>
      <div>
        <div {...getTableProps()} className={styles.table}>
          <div>
           <Header /> 
           {/* // headerGroups={headerGroups}/> */}
          </div>

          <div {...getTableBodyProps()} className={`${styles.striped}`}>
            {rows.map((row, i) => {
              prepareRow(row)
              return (
                <div {...row.getRowProps()} className={`${styles.tr}`}>
               
                  {row.cells.map((cell,i) => {
                         console.log(`prepareRowCell,j,value`,i,cell ,cell.getCellProps())
                    return (
                      <div {...cell.getCellProps()} className={`${styles.tr}`}>
                        {    cell.render('Cell')}
                      </div>
                    )
                  })})
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <pre>
        <code>{JSON.stringify(state, null, 2)}</code>
      </pre>
    </>
  )
}

// interface IEditableCell{
//   initialValue:(number|string),
//   index:any,
//   id:(number|string),
//   updateMyData:()=>void,
//   editable:boolean
//   width:(number|string),
//   maxWidth?:number//|string,
//   minWidth?:number//|string
// }

// interface IColDefinitions{
//   Header:(string|object),
//   accessor: (keyof Task|string),
//   width:(number|string),
//   maxWidth?:number //|string,
//   minWidth?:number//|string
// }
// Create an editable cell renderer
//  const EditableCell = (props:Partial<IEditableCell>)=>{
const EditableCell = (props)=>{

  const {  id, index: colIndex,initialValue,updateMyData,editable}=props // This is a custom function that we supplied to our table instance

  // We need to keep and update the state of the cell normally
  const [value, setValue] = React.useState(initialValue)
  //const [isEditing, setIsEditing] = useState(false)

  // If the initialValue is changed external, sync it up with our state
  React.useEffect(() => {
    setValue(initialValue)
  }, [initialValue])


  if (!editable) {
    return `${initialValue}`
  }
  const onChange = e=>{ //(e: { target: { value: React.SetStateAction<string | number | undefined> } }) => {
  setValue(e.target.value)
  }

  // We'll only update the external data when the input is blurred
  const onBlur = () => {
    // if(isEditing){
   // updateMyData(index, id, value)
    console.log(`new value `,value,'row',colIndex,'column',id) 
    // setIsEditing(false)
    debugger
  }
  // const onMouseUp=()=>
  // {if (!isEditing)
  //   setIsEditing(true)
  // }

  return <input value={value} onChange={onChange} 
  onBlur={onBlur} />
}


const  TanTableResize=(props)=> {
  const columns= React.useMemo(
    () => 
      [
          {
            Header: 'Id',
            accessor: 'id',
            width: 35,
            minWidth: 30,
            maxWidth:40,
          },
          {
            Header: 'Name',
            accessor: 'name',
            width: 100,
            // Cell: EditableCell,
            minWidth: 150,
            maxWidth:300,
          },
          {
            Header: 'Duration',
            accessor: 'duration',
            width: 60,
            Cell: EditableCell,
            minWidth: 20,
            maxWidth:80,
          },
      
        ],
        [])
     

const tasks = useAppSelector(selTasks.selectAll)||[]
// const data:Record<(string|number),Task>[]=tasks.map(item=>(item.id,{item}))

const data=tasks.map(item=>(item.id,{item}))
//  const data:Array<Record<(string|number),unknown>>=useMemo(
//    ()=>{  
//      let taskRec:Array<Record<(string|number), unknown>>=[]
//       {if (tasks !== undefined)    (tasks.map (item=>{ 
//      if(item!==undefined && item.id !== undefined) 
//   taskRec.push({[item.id]:{item} }as Record<(string|number),unknown> ) 
//   }  
//   )  )}
//   console.log(`taskRec`, taskRec)
//   return taskRec
//    }
// ,[tasks])
  

  return (
      <Table 
      columns={columns} 
      data={data} />
  
  )
}
function camelToWords(id) {
  throw new Error('Function not implemented.')
}


export default TanTableResize


