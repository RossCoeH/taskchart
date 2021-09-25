import React, { useState } from 'react'
import { Table, Column, HeaderCell, Cell } from 'rsuite-table';
import  'rsuite-table/dist/css/rsuite-table.css' //or 'rsuite-table/lib/less/index.less'; // 
import { useAppSelector } from '../app/hooks'
import { selTasks } from '../features/seq/seqSlice'
import { Task } from '../features/seq/seqTypes'

// interface IEditCell  {
//     rowData:  <T>,
//      dataKey:< keyof T>,
//   index:number
//   }



export const EditCell =(props:any ) => {
  const {rowData,dataKey,index} = props
   console.log(`EditCell props`, rowData, dataKey ,index ,props)

  return (
    <Cell {...props}>
    <p>{dataKey}</p>
    
      {rowData?.status === 'EDIT' ? (
        <input
          className="input"
          defaultValue={rowData[dataKey as keyof Task]}
          // onChange={event => {
          //   onChange && onChange(rowData.id, dataKey, event.target.value);
          // }}
        />
      ) : (
        rowData[dataKey]
      )}
    </Cell>
  );
};

const ActionCell = (props:any ) => {
const { rowData, dataKey, onClick}=props
  return (
    <Cell {...props}>
      <a
        onClick={() => {
          onClick && onClick(rowData.id);
        }}
      >
        {rowData.status === 'EDIT' ? 'Save' : 'Edit'}
      </a>
    </Cell>
  );
};

const  EditTable =()=> {
 
    const tasks = useAppSelector(selTasks.selectAll)

    interface IactiveState {
      status:(null|'Edit');
      newValues:Task|undefined;
    }
  const [activeItem, setActiveItem] = useState<IactiveState>({status:null, newValues:undefined})

  const handleChange= (id:number|string, key:keyof Task, value:number|string) =>{
    console.log(`change request id,key,value`,  id,key,value)
    // const newState= 
    // setActiveItem(({...activeItem,status:null}) // reset change flag
    // // const { data } = this.state;
    // const nextData = clone(data);
    // nextData.find(item => item.id === id)[key] = value;
    // this.setState({
    //   data: nextData
    // });
  }
  const handleEditState=(id:string|number) =>{
    // const { data } = this.state;
    // const nextData = clone(data);
    // const activeItem = nextData.find(item => item.id === id);
    //  const icell = activeItem[id] 
    // if (icell == undefined) return
    //   if (icell !==activeItem.status ) setActiveItem({status:'Edit',newValues:{tasks[id] as keyof tasks)}})

    // tsetState({
    //   data: nextData
    // });
  }
    return (
      <div>
        <Table
          height={400}
          minHeight ={300}
          headerHeight={50}
          data={tasks} 
          rowHeight={20}
          locale ={loading:"loading"}
          rowKey='id'
          hover={true}
            
        >
        
          <Column width={30}>
            <HeaderCell width ={20} depth={10}  >'First Name'</HeaderCell>
            <EditCell dataKey="id" onChange={handleChange} />
          </Column>

          <Column flexGrow={1}>
            <HeaderCell width={50} depth ={20}>'Last Name'</HeaderCell>
            <EditCell dataKey="name" onChange={handleChange} />
          </Column>

          <Column width={30} >
            <HeaderCell width={50} depth={30}>'Email'</HeaderCell>
            <EditCell dataKey="duration" onChange={handleChange} />
          </Column>

          <Column flexGrow={1}>
            <HeaderCell width={50} depth={30}>Action</HeaderCell>
            {/* <ActionCell dataKey="id" onClick={handleEditState} /> */}
          </Column>
        </Table>
      </div>
    );
  }


export default EditTable