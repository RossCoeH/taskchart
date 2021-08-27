import * as React from "react";
import { useTable } from 'react-table';
import "./styles.css";
import namor from 'namor';

const range = (len: number) => {
  const arr = [];
  for (let i = 0; i < len; i++){
    arr.push(i);
  }
  return arr;
}

const newPerson = () => {
  const statusChange = Math.random();
  return {
    firstName: namor.generate({ words: 1, numbers: 0}), 
    lastName: namor.generate({ words: 1, numbers: 0}),
    age: Math.floor(Math.random() * 30),
    visits: Math.floor(Math.random() * 100),
    progress: Math.floor(Math.random() * 100),
    status:
      statusChange > 0.66 ?
        'relationship' : statusChange > 0.33 ?
        'complicated' : 'single'
  }
}

 function makeData(...lens:any) {
  const makeDataLevel = (depth: number = 0):any => {
    const len = lens[depth];
    return range(len).map(d => {
      return {
        ...newPerson(),
        subRows: lens[depth + 1] ? makeDataLevel(depth + 1) : undefined,
      }
    })
  }

  return makeDataLevel();
}

// const Styles = styled.div`
//   padding: 1rem;

//   table {
//     border-spacing: 0;
//     border: 1px solid black;

//     tr {
//       :last-child {
//         td {
//           border-bottom: 0;
//         }
//       }
//     }

//     th,
//     td {
//       margin: 0;
//       padding: 0.5rem;
//       border-bottom: 1px solid black;
//       border-right: 1px solid black;

//       :last-child {
//         border-right: 0;
//       }
//     }
//   }
// `
interface ITaskListRT{
  columns:any,
  data:any
}
 const TaskListRT=( columns:any, data:any )=> {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow
  } = useTable({
    columns, data
  })
  // Render the UI for your table
  return (
    <table {...getTableProps()}>
      <thead>
        {headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => (
              <th {...column.getHeaderProps()}>{column.render('Header')}</th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row, i) => {
          prepareRow(row)
          return (
            <tr {...row.getRowProps()}>
              {row.cells.map(cell => {
                return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
              })}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}


export default function TableRT() {
  const columns:any = React.useMemo(
    () => [
      {
        Header: 'Name',
        columns: [
          {
            Header: 'First Name',
            accessor: 'firstName',
          },
          {
            Header: 'Last Name',
            accessor: 'lastName',
          },
        ],
      },
      {
        Header: 'Info',
        columns: [
          {
            Header: 'Age',
            accessor: 'age',
          },
          {
            Header: 'Visits',
            accessor: 'visits',
          },
          {
            Header: 'Status',
            accessor: 'status',
          },
          {
            Header: 'Profile Progress',
            accessor: 'progress',
          },
        ],
      },
    ],
    []
  )

  const data:any = React.useMemo(() => makeData(20), []);
  return (
    

}
