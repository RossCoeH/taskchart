import React from 'react'

import 'react-tabulator/lib/styles.css';
import { ReactTabulator } from 'react-tabulator'
import "tabulator-tables/dist/css/tabulator.min.css"; //import Tabulator stylesheet
import { useAppSelector } from '../../app/hooks';
import { selTasks } from '../seq/seqSlice';
import { Task } from '../seq/seqTypes';



const rowButton=(cell, formatterParams, onRendered)=>{
  console.log(`getData`, cell)
  return (<div
   style={{backgroundColor:'rgb',height:'1em',minWidth:'30px',margin:'3px'}}>'#'</div>
  )}
// interface IcolTT<T>{
//   title:string
//   field:keyof T
//   width?:string
//  formatter?:string
//  hozAlign?:string
//  headerSort?:boolean
// }

const columns= [
   {title:'Row',formatter:"rownum", hozAlign:"center", width:'3em'},
    // {title:'M', rowHandle:true, formatter:"handle", headerSort:false, frozen:false, width:30, minWidth:30},
  // {formatter:rowButton, width:40, hozAlign:"center", cellClick:function(e:React.MouseEvent, cell:any){alert("Click row data for: " + cell.getRow().getData().id)}},
  //  { title: "id", field: "id", width: 150 ,  headerSort:false},
  // { title: "Task name", field: "name", hozAlign: "left",  headerSort:false},//editor:"input",
  { title: "Duration", field: "duration",formatter:"money",formatterParams:{precision:false}, headerSort:false} // ,editor:"input"},
];

// const rowFormatter=(row, data)=>{
//         var element = row.getElement(),
//         data = row.getData(),
//         width = element.outerWidth(),
//         table;
//         console.log(`rowdata`, data)
//         return data
// }

const TabulatorTable = () => {

const dataSliceVals= useAppSelector(selTasks.selectAll) // this collects an array of tasks from Redux Toolkit slIC
var data = (JSON.parse(JSON.stringify(dataSliceVals))); //Deep copy into a variable seems to be needed before table 
var options={
 headerSort:false,
 movableRows:true,

}
  return (
  <ReactTabulator
 data={data}
 columns={columns}
 options={options}
 tooltips={true}
 layout={"fitData"}

  rowMoved={(row)=>{
        // console.log("Row: " + row.getData().id + " has been moved")}}
        console.log("Row: " + " has been moved")}}

 />
  )
}

export default TabulatorTable
