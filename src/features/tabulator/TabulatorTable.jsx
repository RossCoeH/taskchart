import React from 'react'

import 'react-tabulator/lib/styles.css'
import { ReactTabulator } from 'react-tabulator'
import 'tabulator-tables/dist/css/tabulator.min.css' //import Tabulator stylesheet
import { useAppSelector } from '../../app/hooks'
import { selTasks } from '../seq/seqSlice'
import { Task } from '../seq/seqTypes'
import { mergeClasses } from '@material-ui/styles'
import classes from './TabulatorTable.module.scss'

const rowButton = (cell, formatterParams, onRendered) => {
	console.log(`getData`, cell)
	return (
		<div
			style={{
				backgroundColor: 'rgb',
				height: '1em',
				minWidth: '30px',
				margin: '3px',
			}}
		>
			'#'
		</div>
	)
}
// interface IcolTT<T>{
//   title:string
//   field:keyof T
//   width?:string
//  formatter?:string
//  hozAlign?:string
//  headerSort?:boolean
// }
const decimalEditor = function (
	cell,
	onRendered,
	success,
	cancel,
	editorParams
) {
	//cell - the cell component for the editable cell
	//onRendered - function to call when the editor has been rendered
	//success - function to call to pass the successfuly updated value to Tabulator
	//cancel - function to call to abort the edit and return to a normal cell
	//editorParams - params object passed into the editorParams column definition property

	//create and style editor
	var editor = document.createElement('input')

	editor.setAttribute('type', 'number')
	const cssHideSpinArrows = `.input{
 
  border-radius: 3px;
  border-style: solid; 
  border-color:  rgb(61, 83, 61);
  
  :focus{border-color: dodgerblue;}
}

.input[type="number"]::-webkit-inner-spin-button,
.input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
`

	//create and style input
	// editor.style.padding = "3,3,3,3";
	editor.padding = '0.0em'
	editor.style.height = '100%'
	editor.style.textAlign = 'center'
	editor.style.width = '100%'
	editor.style.boxSizing = 'border-box'
	editor.style.borderStyle = 'solid'

	//Set value of editor to the current value of the cell
	editor.value = cell.getValue()
	editor.style.WebkitInnerSpinButton = { WebkitAppearance: 'none', margin: '0' }
	editor.style = { ...editor.style, ...cssHideSpinArrows } // add styles to hide spin arrows
	console.log(`editor.style`, editor.style)
	//set focus on the select box when the editor is selected (timeout allows for editor to be added to DOM)
	onRendered(function () {
		editor.focus()
		editor.style.css ="100%" 
      console.log(`editor rendered`, editor.value, editor, cell) //, editor.style)
	})

	//when the value has been set, trigger the cell to update
	function successFunc(cell) {
		console.log(`editor success value`, editor.value, editor)
		success(editor.value)
		// now move down to the next row using dame code as down arrow
	}

	function changeFunc(e) {
		 e.preventDefault()
		console.log(`editor change value`, editor.value, editor, e)
	}
 function keyUpFunc(e){
   e.preventDefault()
   console.log(`keyUp e.key`, e.key,cell)
  //  if (e.key ==="Enter")
   //TODO find how to navigate downon enter cell.navDown() does not exist on cell - need to check why the editable flag is not coming through
   successFunc()
 }

	editor.addEventListener('change', changeFunc)
	editor.addEventListener('blur', successFunc)
	editor.addEventListener("keyup",keyUpFunc)

	//return the editor element
	return editor
}

//validator to prevent duplicated names
const validatorUniqueName=function(cell, value, parameters){
	//cell - the cell component for the edited cell
	//value - the new input value of the cell
	//parameters - the parameters passed in with the validator
const cellRowPosn=cell.getRow().getPosition()
const otherCellsInColumn =cell.getColumn()._column.cells
console.log(`cellRow other cellColumns`, cellRowPosn ,otherCellsInColumn)


// only check uniqueness on non blank values
// convert each string from filterstrings and passedinstring to lowercase for case insenstive search
// use .some which returns a boolean and exits as soon as a match is found.
if(value && value.trim().length >1){
  const bArrayContains = otherCellsInColumn.some((item,index) => (index !==cellRowPosn && item.value.trim().toLowerCase()===(value.trim().toLowerCase() ) ) )
console.log(`bool`, bArrayContains)

if(bArrayContains)  return false
}

	return true; //don't allow values divisible by devisor ;
}

const columns = [
	{ title: 'Row', formatter: 'rownum', hozAlign: 'center', width: '3em' },
	// {title:'M', rowHandle:true, formatter:"handle", headerSort:false, frozen:false, width:30, minWidth:30},
	// {formatter:rowButton, width:40, hozAlign:"center", cellClick:function(e:React.MouseEvent, cell:any){alert("Click row data for: " + cell.getRow().getData().id)}},
	{
		title: 'valid',
		field: 'car',
		minWidth: 10,
		hozAlign: 'center',
		formatter: 'tickCross',
		sorter: 'boolean',
	},
	{ title: 'id', field: 'id', minWidth: 10, width: 40, headerSort: false },
	{
		title: 'Task name',
		field: 'name',
		hozAlign: 'left',
		minWidth: 250,
		headerSort: false,
		editor: true,
    editable: true, // editable is required to give cell navigation by arrows or tabs
    validator: validatorUniqueName,
	}, //editor:"input",
	{
		title: 'Time',
		field: 'duration',
		align: 'right',
		minWidth: 40,
		formatter: 'number',
		formatterParams: { precision: 1 },
		headerSort: false,
		editor: decimalEditor,
		editable: true,
		validator: ['min:0', 'max :100000', 'numeric'], // to set numeric requires a blank string for value
		cellEdited: (cell) => console.log(`cell edited`, cell),
		editorParams: {
			min: 0,
			max: 100000,
			step: 0.1,
			decimal: '.',
		},

		// elementAttributes:{
		//     maxlength:"10", //set the maximum character length of the input element to 10 characters
		// },
		// mask:"9.9",
		verticalNavigation: 'table', //up and down arrow keys navigate away from cell without changing value
	}, // ,editor:"input"},
]

// const rowFormatter=(row, data)=>{
//         var element = row.getElement(),
//         data = row.getData(),
//         width = element.outerWidth(),
//         table;
//         console.log(`rowdata`, data)
//         return data
// }

const TabulatorTable = () => {
	const dataSliceVals = useAppSelector(selTasks.selectAll) // this collects an array of tasks from Redux Toolkit slIC
	var data = JSON.parse(JSON.stringify(dataSliceVals)) //Deep copy into a variable seems to be needed before table
	var options = {
		headerSort: false,
		movableRows: true,
    keybindings: true , // {navDown:"Enter"}, // 13 is Enter key - add to get move down
		validationFailed: function (cell, value, validators) {
			console.log(`validation fail for cell`, value, cell)
			//cell - cell component for the edited cell
			//value - the value that failed validation
			//validators - an array of validator objects that failed

			//take action on validation fail
		},
	}
	return (
		<>
			<input
				type='number'
				className={classes.myinput}
				onChange={(e) => console.log(e.target.style, e.currentTarget)}
			/>
			<ReactTabulator
				data={data}
				columns={columns}
				options={options}
        tooltipGenerationMode="hover" //regenerate tooltip as users mouse enters the cell;
				tooltips={true}
				layout={'fitData'}
				cellEdited={(cell) => {
					console.log(`cell edited `, cell)
				}}
				rowMoved={(row) => {
					// console.log("Row: " + row.getData().id + " has been moved")}}

					console.log('Row: ' + ' has been moved')
				}}
			/>
		</>
	)
}

export default TabulatorTable
