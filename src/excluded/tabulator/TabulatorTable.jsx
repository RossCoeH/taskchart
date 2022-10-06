import React from 'react'

import 'react-tabulator/lib/styles.css' //import Tabulator stylesheet
import { ReactTabulator } from 'react-tabulator'
//import 'tabulator-tables/dist/css/tabulator.min.css'
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
	editor.margin = '0,0,0,0'
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
		console.log(`editor rendered`, editor.value, editor, cell) //, editor.style)
	})

	//when the value has been set, trigger the cell to update
	function successFunc(cell) {
	//	console.log(`editor success value`, editor.value, editor)
		success(editor.value)
		//TODO now move down to the next row using same code as down arrow
	}

	// function changeFunc(e) {
	// 	e.preventDefault()
	// 	console.log(`editor change value`, editor.value, editor, e)
	// }
	// function keyUpFunc(e) {
	// 	e.preventDefault()
	// 	console.log(`keyUp e.key`, e.key, cell)
	// 	//  if (e.key ==="Enter")
	// 	//TODO find how to navigate downon enter cell.navDown() does not exist on cell - need to check why the editable flag is not coming through
	// 	successFunc()
	// }

//	editor.addEventListener('change', changeFunc) not needed for numbers now I have no arrows
	editor.addEventListener('blur', successFunc)
	// editor.addEventListener('keyup', keyUpFunc)
	//return the editor element

	return editor
}


const textValidateEditor = function (
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
  let etype='text'
	editor.setAttribute('type', 'text')
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
}`

	// create and style input
	editor.style.padding = "4,3,3,3";
	// editor.padding = '4'
	editor.margin = '0,0,0,0'
	editor.style.height = '100%'
//	editor.style.textAlign = 'center'
	editor.style.width = '100%'
	editor.style.boxSizing = 'border-box'
	editor.style.borderStyle = 'solid'
	//Set value of editor to the current value of the cell
	editor.value = cell.getValue()
	// editor.style.WebkitInnerSpinButton = { WebkitAppearance: 'none', margin: '0' }
	// editor.style = { ...editor.style, ...cssHideSpinArrows } // add styles to hide spin arrows
	console.log(`editor.style`, editor.style)
	//set focus on the select box when the editor is selected (timeout allows for editor to be added to DOM)
	onRendered(function () {
		editor.focus()
		editor.style.css = '100%'
		console.log(`editor rendered`, editor.value, editor, cell) //, editor.style)
	})

	//when the value has been set, trigger the cell to update
	function successFunc(cell) {
		console.log(`editor success value`, editor.value, editor)
		success(editor.value)
		//TODO now move down to the next row using dame code as down arrow
	}

	function changeFunc(e) {
		e.preventDefault()
	cell.validate()
		console.log(`editor change value`, editor.value, editor, e)
	
	}
	// function onKeyUpFunc(e) {
	// 	e.preventDefault()
	// 	console.log(`keyUp e.key`, e.key, cell)
	// 	//  if (e.key ==="Enter")
	// 	//TODO find how to navigate downon enter cell.navDown() does not exist on cell - need to check why the editable flag is not coming through
	// 	successFunc()
	// }

	editor.addEventListener('change', changeFunc)
	// editor.addEventListener('blur', successFunc)
	// editor.addEventListener('keyup', onKeyUpFunc) causes exit of edit
	//return the editor element
  let msgline = document.createElement('div')
	let msg='Error message here'
	msgline.innerText=msg
	// cell.tooltipstooltips=function(cell){
  //       //cell - cell component

  //       //function should return a string for the tooltip of false to hide the tooltip
  //       return  cell.getColumn().getField() + " -Error " + cell.getValue(); //return cells "field - value";
  //   },
	msgline.className=classes.cellErrorMsg
 editor.append(msgline)
	return (editor  )
}





//validator to prevent duplicated names
const validatorUniqueName = function (cell, value, parameters) {
	//cell - the cell component for the edited cell
	//value - the new input value of the cell
	//parameters - the parameters passed in with the validator
	const cellRowPosn = cell.getRow().getPosition()
	const otherCellsInColumn = cell.getColumn()._column.cells
	var errors=[] // clear errors on cell
	// console.log(`cellRow other cellColumns`, cellRowPosn, otherCellsInColumn)

	// only check uniqueness on non blank values
	// convert each string from filterstrings and passedinstring to lowercase for case insenstive search
	// use .some which returns a boolean and exits as soon as a match is found.
	if (value && value.trim().length > 1) {
		const bArrayContains = otherCellsInColumn.some(
			(item, index) =>
				index !== cellRowPosn &&
				item.value.trim().toLowerCase() === value.trim().toLowerCase()
		)
		//console.log(`bool`, bArrayContains,`cell`,cell)
		// create a span element ith marker at end
		// const 	tick ='<svg enable-background="new 0 0 24 24" height="14" width="14" viewBox="0 0 24 24"  ><path fill="#2DC214" clip-rule="evenodd" d="M21.652,3.211c-0.293-0.295-0.77-0.295-1.061,0L9.41,14.34  c-0.293,0.297-0.771,0.297-1.062,0L3.449,9.351C3.304,9.203,3.114,9.13,2.923,9.129C2.73,9.128,2.534,9.201,2.387,9.351  l-2.165,1.946C0.078,11.445,0,11.63,0,11.823c0,0.194,0.078,0.397,0.223,0.544l4.94,5.184c0.292,0.296,0.771,0.776,1.062,1.07  l2.124,2.141c0.292,0.293,0.769,0.293,1.062,0l14.366-14.34c0.293-0.294,0.293-0.777,0-1.071L21.652,3.211z" /></svg>'
		// const 	cross =document.createElement(<svg enable-background="new 0 0 24 24" height="14" width="14"  viewBox="0 0 24 24"  ><path fill="#CE1515" d="M22.245,4.015c0.313,0.313,0.313,0.826,0,1.139l-6.276,6.27c-0.313,0.312-0.313,0.826,0,1.14l6.273,6.272  c0.313,0.313,0.313,0.826,0,1.14l-2.285,2.277c-0.314,0.312-0.828,0.312-1.142,0l-6.271-6.271c-0.313-0.313-0.828-0.313-1.141,0  l-6.276,6.267c-0.313,0.313-0.828,0.313-1.141,0l-2.282-2.28c-0.313-0.313-0.313-0.826,0-1.14l6.278-6.269  c0.313-0.312,0.313-0.826,0-1.14L1.709,5.147c-0.314-0.313-0.314-0.827,0-1.14l2.284-2.278C4.308,1.417,4.821,1.417,5.135,1.73  L11.405,8c0.314,0.314,0.828,0.314,1.141,0.001l6.276-6.267c0.312-0.312,0.826-0.312,1.141,0L22.245,4.015z"/></svg>)
		// var span=document.createElement('span')
		//TODO retry tick cross
		// add div to the document
		// span.appendChild(editor)
		// span.appendChild(tick)
		console.log(`validate value, valid`,  value, bArrayContains,cell)
		if (bArrayContains) {
			return false
		}
	}

	return true //don't allow values divisible by devisor ;
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
		editor: textValidateEditor,
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
		keybindings: true, // {navDown:"Enter"}, // 13 is Enter key - add to get move down
		validationFailed: function (cell, value, validators) {
			console.log(`validation fail for cell`, value, cell)
			//cell - cell component for the edited cell
			//value - the value that failed validation
			//validators - an array of validator objects that failed

			//take action on validation fail
		},
		tooltips:function(cell){
        //cell - cell component

        //function should return a string for the tooltip of false to hide the tooltip
        return  cell.getColumn().getField() + " - " + cell.getValue(); //return cells "field - value";
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
				tooltipGenerationMode='hover' //regenerate tooltip as users mouse enters the cell;
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
