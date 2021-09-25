import React from 'react'
import { useTable, useBlockLayout, useResizeColumns } from 'react-table'
import { useAppSelector } from '../../app/hooks.ts'
//import makeData from './MakeData.js'
import { selTasks } from './seqSlice.ts'
import classes from './TanTableResize.module.scss'
import clx from 'classnames'

// function Table(props) {
const TanTableResize0 = (props) => {
	const data = useAppSelector(selTasks.selectAll) || []
	const [skipPageReset, setSkipPageReset] = React.useState(false)
	const [isEditing, setIsEditing] = React.useState(false)
	console.log(`tasks as data`, data)

	// Create an editable cell renderer
	const EditableCell = ({
		value: initialValue,
		row: { index },
		column: { id },
		updateMyData, // This is a custom function that we supplied to our table instance
		editable,
	}) => {
		// We need to keep and update the state of the cell normally
		const [value, setValue] = React.useState(initialValue)
		const [isEditing, setIsEditing] = React.useState(false)
		console.log(`Starting Cell edit -row ${index} column ${id} = ${value}`)
		// If the initialValue is changed external, sync it up with our state
		React.useEffect(() => {
			setValue(initialValue)
		}, [initialValue])

		const onMouseUp = () => {
			if (!isEditing) setIsEditing(true)
		}

		const onChange = (e) => {
			setValue(e.target.value)
		}

		// We'll only update the external data when the input is blurred
		const onBlur = () => {
			if (isEditing) {
				// updateMyData(index, id, value)
				console.log(`new value `, value, 'row', index, 'column', id)
				setIsEditing(false)
			}
		}
			if (!isEditing) 
				return <div onMouseUp={onMouseUp}>{value} </div>
			// return `${initialValue}`
			else 
				return <input value={value} onChange={onChange} onBlur={onBlur} />
			
		
	}

	//   editable cell updater here
	const updateMyData = (rowIndex, columnId, value) => {
		// We also turn on the flag to not reset the page
		// setSkipPageReset(true)
		console.log(
			`data changed at row ${rowIndex}, col ${columnId} - new value = ${value}`
		)
		// setData(old =>
		//   old.map((row, index) => {
		//     if (index === rowIndex) {
		//       return {
		//         ...old[rowIndex],
		//         [columnId]: value,
		//       }
		//     }
		//     return row
		//   })
		// )}
	}

	React.useEffect(() => {
		setSkipPageReset(false)
	}, [data])

	const columns = React.useMemo(
		() => [
			{
				Header: 'Id',
				accessor: 'id',
				width: 40,
				minWidth: 30,
				maxWidth: 50,
				style: { textAlign: 'right' },
			},
			{
				Header: 'Name',
				accessor: 'name',
				width: 100,
				Cell: EditableCell,
				minWidth: 150,
				maxWidth: 400,
			},
			{
				Header: 'Time',
				accessor: 'duration',
				width: 60,
				Cell: EditableCell,
				minWidth: 40,
				width: 60,
				maxWidth: 80,
				Cell: ({ value }) => <div style={{ textAlign: 'right' }}>{value}</div>,
			},
		],
		[]
	)

	const defaultColumn = React.useMemo(
		() => ({
			minWidth: 30,
			width: 200,
			maxWidth: 400,
		}),
		[]
	)

	const {
		getTableProps,
		getTableBodyProps,
		headerGroups,
		rows,
		prepareRow,
		state,
		resetResizing,
	} = useTable(
		{
			columns,
			data,
			defaultColumn,
			updateMyData,
		},
		useBlockLayout, // needed for resize columns
		useResizeColumns
		// use the skipPageReset option to disable page resetting temporarily
		//  autoResetPage: !skipPageReset,
		// // updateMyData isn't part of the API, but
		// // anything we put into these options will
		// // automatically be available on the instance.
		// // That way we can call this function from our
		// // cell renderer!
		//
	)

	return (
		<>
			<button onClick={resetResizing}>Reset Resizing</button>

			<div>
				<div {...getTableProps()} className={classes.table}>
					<div>
						{headerGroups.map((headerGroup) => (
							<div
								{...headerGroup.getHeaderGroupProps()}
								className={classes.tr}
							>
								{headerGroup.headers.map((column) => (
									<div {...column.getHeaderProps()} className={classes.th}>
										{column.render('Header')}
										{/* Use column.getResizerProps to hook up the events correctly */}
										<div
											{...column.getResizerProps()}
											className={[
												classes.resizer,
												column.isResizing ? classes.isResizing : '',
											].join(' ')}
										/>
									</div>
								))}
							</div>
						))}
					</div>

					<div {...getTableBodyProps()} className={`${classes.striped}`}>
						{rows.map((row, i) => {
							prepareRow(row)
							return (
								<div {...row.getRowProps()} className={`${classes.tr}`}>
									{row.cells.map((cell) => {
										return (
											<div
												{...cell.getCellProps()}
												className={clx(classes.tr, classes.td, cell.style)}
											>
												{cell.render('Cell')}
											</div>
										)
									})}
								</div>
							)
						})}
					</div>
				</div>
			</div>
			<pre>
				<code>{JSON.stringify(state, null, 2)}</code>
			</pre>
		</>
	)
}

export default TanTableResize0
