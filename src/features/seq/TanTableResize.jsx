import React from 'react'
import { useTable, useBlockLayout, useResizeColumns } from 'react-table'
import { useAppSelector } from '../../app/hooks.ts'
//import makeData from './MakeData.js'
import { selTasks } from './seqSlice.ts'
import styles from './TanTableResize.module.scss'




function Table({ columns,data }) {
  const defaultColumn = React.useMemo(
    () => ({
      minWidth: 30,
      width: 150,
      maxWidth: 400,
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
const Header = (headerGroups=> { return(
    headerGroups.map(headerGroup => (
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
            ))
           )
} )




  return (
    <>
      <button onClick={resetResizing}>Reset Resizing</button>
      <div>
        <div {...getTableProps()} className={styles.table}>
          <div>
           <Header headerGroups={headerGroups}/>
          </div>

          <div {...getTableBodyProps()} className={`${styles.striped}`}>
            {rows.map((row, i) => {
              prepareRow(row)
              return (
                <div {...row.getRowProps()} className={`${styles.tr}`}>
                  {row.cells.map(cell => {
                    return (
                      <div {...cell.getCellProps()} className={`${styles.tr}`}>
                        {cell.render('Cell')}
                      </div>
                    )
                  })}
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

// Create an editable cell renderer
const EditableCell = ({
  value: initialValue,
  row: { index },
  column: { id },
  updateMyData, // This is a custom function that we supplied to our table instance
  editable
}) => {
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
  const onChange = e => {
  setValue(e.target.value)
  }

  // We'll only update the external data when the input is blurred
  const onBlur = () => {
    // if(isEditing){
   // updateMyData(index, id, value)
    console.log(`new value `,value,'row',index,'column',id) 
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

function TanTableResize() {
  const columns = React.useMemo(
    () => 
      [
          {
            Header: 'Id',
            accessor: 'id',
            width: 50,
          },
          {
            Header: 'Task',
            accessor: 'name',
            width: 60,
            Cell: EditableCell,
          },
          {
            Header: 'Duration',
            accessor: 'duration',
            Cell: EditableCell,
          },
          
        ],
        [])
     


 const data=useAppSelector(selTasks.selectAll)
  

  return (
      <Table columns={columns} data={data} />
  
  )
}

export default TanTableResize
