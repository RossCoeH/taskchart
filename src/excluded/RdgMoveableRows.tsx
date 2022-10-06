import React from "react";
import ReactDOM from 'react-dom'
import ReactDataGrid, { Column } from "react-data-grid";
import { useAppSelector } from "../app/hooks";
import { selTasks } from "../features/seq/seqSlice";
import { Row } from "react-data-grid";
import { Task } from "../features/seq/seqTypes";
import { IfMaybeUndefined } from "@reduxjs/toolkit/dist/tsHelpers";


// const {
//   Draggable: {
//     Container: DraggableContainer,
//     RowActionsCell,
//     DropTargetRowContainer
//   }
//   // Data: { Selectors }
// //} = require("react-data-grid-addons");

// // import PropTypes from "prop-types";

//  RowRenderer = DropTargetRowContainer(ReactDataGrid.Row)
interface ICol<T>{
  key: keyof T,
 name : string,
 width:number,
 frozen?:boolean,
 resizeable?:boolean,
 //editor?:ComponentType<EditorProps<Task, unknown>>>;
// summaryFormatter?: Function;

}
const  RDGExample =()=> {

    const columns:  ICol<Task>[] = [
      {
        key: "id",
        name: "ID",
        width :80
      },
      {
        key: "name",
        name: "Title",
        width :80
      },
      {
        key: "duration",
        name: "Time",
        width :80
      },
     
    ]


const rows= useAppSelector(selTasks.selectAll)
const rowKeyGetter=(row:Task)=>row.id

  if (rows === undefined|| columns === undefined) return null
   if ( columns === undefined) return null
  return <ReactDataGrid 
  columns={columns} 
  rows={rows} 
  rowkeyGetter={rowKeyGetter}/>;

  // createRows = numberOfRows => {
  //   let rows = [];
  //   for (let i = 1; i < numberOfRows; i++) {
  //     rows.push({
  //       id: i,
  //       task: "Task " + i,
  //       complete: Math.min(100, Math.round(Math.random() * 110)),
  //       priority: ["Critical", "High", "Medium", "Low"][
  //         Math.floor(Math.random() * 3 + 1)
  //       ],
  //       issueType: ["Bug", "Improvement", "Epic", "Story"][
  //         Math.floor(Math.random() * 3 + 1)
  //       ],
  //       startDate: this.getRandomDate(new Date(2015, 3, 1), new Date()),
  //       completeDate: this.getRandomDate(new Date(), new Date(2016, 0, 1))
  //     });
  //   }
  //   return rows;
  // };


  // rowGetter = i => {
  //   return this.state.rows[i];
  // };

  // isDraggedRowSelected = (selectedRows, rowDragSource) => {
  //   if (selectedRows && selectedRows.length > 0) {
  //     let key = this.props.rowKey;
  //     return (
  //       selectedRows.filter(r => r[key] === rowDragSource.data[key]).length > 0
  //     );
  //   }
  //   return false;
  // };

  // reorderRows = e => {
  //   let selectedRows = Selectors.getSelectedRowsByKey({
  //     rowKey: this.props.rowKey,
  //     selectedKeys: this.state.selectedIds,
  //     rows: this.state.rows
  //   });
  //   let draggedRows = this.isDraggedRowSelected(selectedRows, e.rowSource)
  //     ? selectedRows
  //     : [e.rowSource.data];
  //   let undraggedRows = this.state.rows.filter(function(r) {
  //     return draggedRows.indexOf(r) === -1;
  //   });
  //   let args = [e.rowTarget.idx, 0].concat(draggedRows);
  //   Array.prototype.splice.apply(undraggedRows, args);
  //   this.setState({ rows: undraggedRows });
  // };

  // onRowsSelected = rows => {
  //   this.setState({
  //     selectedIds: this.state.selectedIds.concat(
  //       rows.map(r => r.row[this.props.rowKey])
  //     )
  //   });
  // };

  // onRowsDeselected = rows => {
  //   let rowIds = rows.map(r => r.row[this.props.rowKey]);
  //   this.setState({
  //     selectedIds: this.state.selectedIds.filter(i => rowIds.indexOf(i) === -1)
  //   });
  // };

 
  //   return (
  //     <DraggableContainer>
  //       <ReactDataGrid
  //         enableCellSelection={true}
  //         rowActionsCell={RowActionsCell}
  //         columns={this._columns}
  //         rowGetter={this.rowGetter}
  //         rowsCount={this.state.rows.length}
  //         minHeight={500}
  //         rowRenderer={<RowRenderer onRowDrop={this.reorderRows} />}
  //         rowSelection={{
  //           showCheckbox: true,
  //           enableShiftSelect: true,
  //           onRowsSelected: this.onRowsSelected,
  //           onRowsDeselected: this.onRowsDeselected,
  //           selectBy: {
  //             keys: {
  //               rowKey: this.props.rowKey,
  //               values: this.state.selectedIds
  //             }
  //           }
  //         }}
  //       />
  //     </DraggableContainer>
  //   );
  }

export default   RDGExample

