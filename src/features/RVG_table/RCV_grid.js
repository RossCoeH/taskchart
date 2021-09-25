/* eslint-disable jsx-a11y/accessible-emoji */
// init source = https://codesandbox.io/s/rcv-fixed-size-bowcu?fontsize=14&hidenavigation=1&theme=dark&file=/Grid.js:0-1634

import { Fragment } from "react";
import useVirtual from "react-cool-virtual";
import { useRowSelect } from "react-table";
import { useAppSelector } from "../../app/hooks";
import {selTasks} from '../seq/seqSlice'

import "./RCV_styles.scss";




const RCV_Grid = () => {

  const tasks=useAppSelector(selTasks.selectAll)
  console.log(`tasks`, tasks)
const colDefs=[
  {ref:'id',title:'ID' ,minWidth:15},
  {ref:'name',title:'Task Name' ,minWidth:65},
  {ref:'duration',title:'Time' ,minWidth:15}
]
  
const CellValue=({rowIndex,colIndex,tasks,colDefs,...rest})=>{ 
 // debugger
   if((tasks ===undefined)||(colDefs === undefined ))return  (`${rowIndex}, ${colIndex}` )// 'no data')
  console.log(` grid rowIndex, colIndex, ColDef`, rowIndex, colIndex,colDefs[colIndex]?.ref)
console.log(` grid ,task`,tasks[rowIndex],colDefs[colIndex])
//debugger
 
if (rowIndex ==0 &&(colIndex < colDefs.length))
return (colDefs[colIndex].title)

if (tasks.length && colDefs.length &&(rowIndex <= tasks.length) &&(colIndex < colDefs.length)){
 const  value= tasks[rowIndex-1][colDefs[colIndex].ref] //use -1 index to get header in front
  console.log(`returning cell value`, value )
    return(value) }
    else 
    console.log(`Oustide bounds-failed to get item row: ${rowIndex} , col: ${colIndex} `)
    return(
 <> ♻️ {rowIndex}, {colIndex} </>
    )
  }


  const row = useVirtual({
    itemCount: tasks.length+1 //1000
  });
  const col = useVirtual({
    horizontal: true,
    itemCount: 4,
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
 
        {row.items.map((rowItem) => (
          <Fragment key={rowItem.index}>
            {col.items.map((colItem) => (
              <div
                key={colItem.index}
                className={`item ${
                 ( rowItem.index % 2 )      
                    ? "dark"
                    : ""
                }`}
                style={{
                  position: "absolute",
                  height: `${rowItem.size}px`,
                  width: `${colItem.size}px`,
                  transform: `translateX(${colItem.start}px) translateY(${rowItem.start}px)`
                }}
              >
              <CellValue colDefs={colDefs}
              rowIndex={rowItem.index} colIndex={colItem.index} tasks={tasks}/>
              </div>
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  );
};

export default RCV_Grid;
