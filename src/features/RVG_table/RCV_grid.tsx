/* eslint-disable jsx-a11y/accessible-emoji */
// init source = https://codesandbox.io/s/rcv-fixed-size-bowcu?fontsize=14&hidenavigation=1&theme=dark&file=/Grid.js:0-1634

import { Fragment, useEffect, useState } from "react";
import useVirtual from "react-cool-virtual";
import { useAppSelector } from "../../app/hooks/hooks";
import {selTasks} from '../seq/seqSlice'

import "./RCV_styles.scss";

import { EntityId ,Dictionary} from "@reduxjs/toolkit";
import { Task } from "../seq/seqTypes";



const RCV_TaskGrid = () => {

  const taskIds = useAppSelector(selTasks.selectIds)
  const taskEnts=useAppSelector(selTasks.selectEntities)
  console.log(`tasks`, taskEnts)

  interface IColDefs<Task>{
    ref:keyof Task
    title:string|undefined
    minWidth:Number
    editable?:boolean
    resizeable?:boolean 
  }

//  declare state for virtual rows so that insert or edit can occur without changing store
interface IcellError{
  cellref: keyof Task 
  error: string
}
interface ICellError{
   cellref: keyof Task 
   error: string}

interface IRowListItem  {
  id:EntityId
  isEdited:boolean
  errors:IcellError[]|undefined
}

const colDefs:IColDefs<Task>[]=[
  {ref:'id',title:'ID' ,minWidth:15, editable:false, resizeable:false},
  {ref:'name',title:'Task Name' ,minWidth:65, editable:true,resizeable:true},
  {ref:'duration',title:'Time' ,minWidth:15, editable:true,resizeable:true}
]

const [rowList , setRowList] = useState<IRowListItem[]>([])
const RowHeight =25

// initialise with useEffect whenever the store changes
useEffect(() => {
  if( taskIds === undefined)return
  if( taskIds.length< 1 )return
  setRowList(taskIds.map(item=>{return(
    {id:item,isEdited:false,errors:undefined}
    )}))
}, [taskIds])


//  declare state to include editable row for insertion
const [editRows, seteditRows] = useState<IRowListItem[]>([])

interface IcellValue{
  rowIndex:number
  colIndex:number
  rest:any
}
  
const CellValue=({rowIndex,colIndex}:IcellValue)=>{ 
 // debugger
 const colref=colDefs[colIndex].ref
const rowItem=  rowList[rowIndex].id
 const entry =taskEnts??[rowItem]??[colref]??undefined
  console.log(` grid rowIndex, colIndex, colId, entry`, rowIndex, colIndex,colref, entry)
 return <div>{entry}</div>
 
  }


  const row = useVirtual({
    itemCount: rowList.length //1000
  });
  const col = useVirtual({
    horizontal: true,
    itemCount: colDefs.length,
    itemSize: 100
  });

  return (
    <div
      className="outer"
      style={{ width: "400px", height: "400px", overflow: "auto" }}
      ref={(el) => {
        row.outerRef.current = el;
        col.outerRef.current = el;
      }}
    >
      <div
        style={{ position: "relative" }}
        ref={(el) => {
          row.innerRef.current = el;
          col.innerRef.current = el;
        }}
      >
 
        {rowList.map((rowItem,index) => (
          <Fragment key={rowItem.id}>
            {col.items.map((colItem) => (
              <div
                key={colItem.index}
                className={`item ${
                 ( index % 2 )      
                    ? "dark"
                    : ""
                }`}
                style={{
                  position: "absolute",
                  height: `${RowHeight}px`,
                  width: `${colItem.size}px`,
                //  transform: `translateX(${colItem.start}px) translateY(${rowItem.start}px)`
                }}
              >
              <CellValue  rowIndex={index} colIndex={colItem.index} rest={undefined} />
              </div>
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  );
};

export default RCV_TaskGrid;
