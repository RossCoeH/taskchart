import React, {
	Fragment,
	LegacyRef,
	PropsWithChildren,
	PropsWithRef,
	ReactComponentElement,
	ReactElement,
	ReactFragment,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react'
// import forceNumber from 'force-number';
import clj from 'classnames'
import classes from './EditableCell.module.scss'
import usePortal from 'react-cool-portal'
import { JsxElement } from 'typescript'


enum celltype {
	string = 'string',
	number = 'number',
}

type IeditableCell = {
	// type:celltype
	editable: boolean
	value: number | string
	validator: (value: number | string) => string | undefined
	onChange: (value: number | string) => void
	minNumber?: number | undefined
	mykey:string
}

 function EditableCell(props: IeditableCell) {

const  {editable, value, validator, onChange, minNumber , mykey} =props;

 
	const errormsg = useRef<string | null>(null)
		//let errormsg = useRef(null)
	const ToolTipPortal = usePortal({
		defaultShow: true,
		containerId: 'my-portal-root',
	})
		const [isEditing, setIsEditing] = useState(false)
	const [hasError, setHasError] = useState<string | undefined>(undefined) //()
  const inputRef = useRef<LegacyRef<HTMLInputElement>>();

	function onValueChange(value: string | number) {
	
		console.log(`edit value change`, value)
		errormsg.current = validator(value) || null
		 const error= validator(value)
		 console.log(`error in cell`, error)
	// errormsg= ref=>((error && error) ||null )=ref
		 if (error !==undefined) {
		   setHasError(error)
		    onChange(value);
		  } else {
		    setHasError(undefined)
		  }
	}

	function exitEditor(){
		setIsEditing(false)
	}
	


	useEffect(() => {
	errormsg.current=validator(value)||null
	 // do nothing but read latest state of errors
	// console.log(`hasError changed`, hasError )
	}, [value])
	console.log(`input error`, errormsg.current)

	interface ITtipPortal {
		msg: string 
	}



 const errmsg=errormsg.current?.toString()??"";
	const TtipPortal = (msg: ITtipPortal) : JSX.Element | null => {
		
	 if (msg === undefined || msg=== null) return null
		console.log(`portal`, errormsg.current)
		return (
			<div className='modal' tabIndex={-1}>
				<div
					className='modal-dialog'
					role='dialog'
					aria-labelledby='modal-label'
					aria-modal='true'
				>
					<div className='modal-header'>
						<h5 id='modal-label' className='modal-title'>
							Error: {msg}
						</h5>
					</div>
					<div className='modal-body'>
						<p>{msg.toString()}</p>
					</div>
				</div>
			</div>
		)
	}

	// const valInput = (value:string|number) => {
	// const valInput =  (value,isEditing, errormsg) => {
	console.log(`value `,value,` isEditing `, isEditing.toString())

function handleInputClick(e:React.FocusEvent<HTMLInputElement>) {

  // useEffect(() => {
	// 	if (inputRef.current)   inputRef.current.focus();
  // }, []);
  // return (
  //   <input 
  //     ref={inputRef} 
  //     type="text" 
  //   />
  // );
}

		if (typeof value === 'number' && isEditing)
		
		return (
				<React.Fragment>
					<input
						type='number'
						min={minNumber??0}
						key={mykey}
						
						onFocus={e=>handleInputClick(e)}
						defaultValue={value}
						onChange={(event) => onValueChange(event.target.value)}
						className={
							errormsg.current === undefined
								? classes.editableCell
								: clj(classes.editableCell, classes.hasError)
						}
						onBlur={() => setIsEditing(false)}
					/>
					{(errmsg.length >0) && <TtipPortal msg={errmsg} />}
	</React.Fragment>	)
			

		if (typeof value === 'string' && isEditing)
		
			return (
				<React.Fragment>
					<input
						type='string'
						defaultValue={value}
						onChange={(event) => onValueChange(event.target.value)}
						className={
							errormsg.current !== null
								? classes.input
								: clj(classes.editableCell, classes.hasError)
						}
            
						onBlur={() => exitEditor()}
					/>
          {errormsg.current && <p>{errormsg}</p>}
					{errormsg.current !== null && <TtipPortal msg={errormsg.current} />}
				</React.Fragment>
			)

		return (
			//-non editing follows
			<div
			 key={mykey}
				onClick={() => setIsEditing((x) => !x)}

			//	onFocus={() => setIsEditing(true)}
				onBlur={() => setIsEditing(false)}
			>
			
				{value.toString()}
			</div>
		)

	} // [value, isEditing, hasError,errormsg.current])

//	return (valInput(value,isEditing,errormsg)) // <div key ={mykey}>"Unknown Value</div>)


export default EditableCell
