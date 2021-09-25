import * as React from 'react'
import { render } from 'react-dom'
import { ReactGrid ,Row,Column,DefaultCellTypes} from '@silevis/reactgrid'
import '@silevis/reactgrid/styles.css'
import { selTasks } from './seqSlice'
import { Task } from './seqTypes'
import { useAppSelector } from '../../app/hooks'

// interface Row {
// 	id: string
// 	height: number
// 	cells: { type: string; text: string }[]
// }
// interface Column {
//   id: string;
//   width: number;
// }

// interface IData {
// 	[key: (string|number)]: (string|number)
// }

// interface AppState {
//   columns: Column[];
//   rows: Row[];
// }

interface RGTProps {
	columns: number
	rows: number
	rowsHeight?: number
	columnsWidth?: number
}

interface ColumnProps {
	id: keyof Task
	width: number
	reorderable?: boolean
	resizeable?: boolean
	onResize?: () => void
}

const getData = () => {
	return selTasks.selectAll
}
interface IData {
	id: (number | string)
	name: string
	surname: string
  
}
const data :IData[] = [
	{ id: 1,  name: 'Thomas', surname: 'Goldman' },
	{ id: 2, name: 'Susie', surname: 'Quattro' },
	{ id: 7, name: '', surname: '' },
]





interface IColumnDefs {
	columnId: keyof IData
	width: number
	title: string
  type?: keyof DefaultCellTypes
}

const columnDefs: IColumnDefs[] = [
	{ columnId: 'name', width: 150, title: 'Name' },
	{ columnId: 'surname', width: 150, title: 'Surname'},
]

// const headerRow:unknown= {
//   rowId: "header",
//   cells:
//     { type: "header",
//     id:keyof data,
//     text: string }[]
// };
const headerRow = (columnDefs:IColumnDefs[]):Row=> 
{  return {rowId:'HeaderRow',
  height:20,
  cells: {...columnDefs.map(item => 
		{return { text: item.title }
  } )
  }  }
  } 
   const getBodyRows  = ((
	columnDefs: IColumnDefs[],	data: IData[]):Row[] => {
  const	dMap=data.map((item:IData, idx:number) =>  { return( 
       {rowId:item.id,
			 type:'TextCell' as keyof DefaultCellTypes,
       cells:{...columnDefs.map(idCol => {
	return(	{ text: item[idCol.columnId ]})
  }
  )}
       }
  )
  })
	   return(dMap))
      // if(item?.id ===undefined) return //exit if data does not have id field
      // else
  
  }


function ReactgridTest() {
	const [tasks] = useAppSelector(selTasks.selectAll)
  const header=headerRow(columnDefs)
	const bodyRows = getBodyRows(columnDefs,data)
	const columns = columnDefs
 const rows =[headerRow]
	return <div>
  <ReactGrid rows={rows} columns={columns} />
</div>}
export default ReactgridTest
