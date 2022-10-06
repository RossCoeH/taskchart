import React from 'react'

import 'react-tabulator/lib/styles.css';
import { ReactTabulator } from 'react-tabulator'
import "tabulator-tables/dist/css/tabulator.min.css"; //import Tabulator stylesheet

const rowButton=(cell:any, formatterParams:any, onRendered:any)=>{
  console.log(`getData`, cell)
  return (<div
   style={{backgroundColor:'rgb',height:'1em',minWidth:'30px',margin:'3px'}}>'#'</div>
  )}
const columns = [
   {title:'Row',formatter:"rownum", hozAlign:"center", width:'3em'},
    {title:'move', rowHandle:true, formatter:"handle", headerSort:false, frozen:false, width:30, minWidth:30},
  {formatter:rowButton, width:40, hozAlign:"center", cellClick:function(e:React.MouseEvent, cell:any){alert("Click row data for: " + cell.getRow().getData().name)}},
  { title: "Name", field: "name", width: 150 , editor:"input", headerSort:false},
  { title: "Age", field: "age", hozAlign: "left", formatter: "progress" , headerSort:false},
  { title: "Favourite Color", field: "col" },
  { title: "Date Of Birth", field: "dob", hozAlign: "center" },
  { title: "Rating", field: "rating", hozAlign: "center", formatter: "star" },
  { title: "Passed?", field: "passed", hozAlign: "center", formatter: "tickCross" }
];

var data = [
   {id:1, name:"Oli Bob", age:"12", col:"red", dob:""},
  {id:2, name:"Mary May", age:"1", col:"blue", dob:"14/05/1982"},
  {id:3, name:"Christine Lobowski", age:"42", col:"green", dob:"22/05/1982"},
  {id:4, name:"Brendon Philips", age:"125", col:"orange", dob:"01/08/1980"},
  {id:5, name:"Margret Marmajuke", age:"16", col:"yellow", dob:"31/01/1999"},
];
var options={
 headerSort:false,
 movableRows:true,
}

const TabulatorTable = () => {
  return (
  <ReactTabulator
 data={data}
 columns={columns}
 options={options}
 tooltips={true}
 layout={"fitData"}
  rowMoved={(row:any)=>{
        console.log("Row: " + row.getData().name + " has been moved")}}
 />
  )
}

export default TabulatorTable
