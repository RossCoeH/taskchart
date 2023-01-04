import React, {
	Attributes,
	ComponentPropsWithRef,
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
import useClickOutsideRef from '@pofo/click-outside';
import useOnclickOutside, { useClickOutside } from '@react-hookz/web' // https://github.com/react-hookz/web


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
	isediting:boolean
	setactive:Function
}

 const EditableCell=(props: IeditableCell & ComponentPropsWithRef<any>) =>{

const  { value, validator, onChange, minNumber , mykey ,isediting: isediting,setactive} =props;

 
	const errormsg = useRef<string | null>(null)
	
	const ToolTipPortal = usePortal({
		defaultShow: true,
		containerId: 'my-portal-root',
	})
	const [hasError, setHasError] = useState<string | undefined>(undefined) //()
const [isEditing, setIsEditing] = useState(false)
const editRef = useRef(null);

 function onValueChange(value: string | number) {
	
		console.log(`edit value change`, value)
		errormsg.current = validator(value) || null
		 const error= validator(value)
		//  console.log(`error in cell`, error)
	// errormsg= ref=>((error && error) ||null )=ref
		 if (error !==undefined) {
		   setHasError(error)
		    onChange(value);
		  } else {
		    setHasError(undefined)
		  }
	}



    useClickOutside(editRef, (e) => {
      console.log ('useclickOutside event', e)
		
      // window.alert('told ya! - time to stop editing')
				editRef.current=null
  setIsEditing(false)

    });

const clickOutRef = useRef<any>(()=>{
	setactive("");
 })
	const startEdit=(e:any):void=>{
		console.log("starting edit with value ",e.target.value)
		setactive(mykey)
	// if(!isEditing)	setIsEditing(true)
//clickOutRef.current=(()=>())
	}

// const stopEdit=():void =>{
// 	setIsEditing(false)
// 	}
// const inputRef=useOnclickOutside(()=>stopEdit())
	//(React.RefObject<HTMLElement>|null)[]
	useEffect(() => {
	errormsg.current=validator(value)||null
	 // do nothing but read latest state of errors
	// console.log(`hasError changed`, hasError )
	}, [value,isediting])
	// console.log(`input error`, errormsg.current)

	interface ITtipPortal {
		msg: string 
	}



//  const errmsg=errormsg.current?.toString()??"";
// 	const TtipPortal = (msg: ITtipPortal) : JSX.Element | null => {
		
// 	 if (msg === undefined || msg=== null) return null
// 		console.log(`portal`, errormsg.current)
// 		return (
// 			<div className='modal' tabIndex={-1}>
// 				<div
// 					className='modal-dialog'
// 					role='dialog'
// 					aria-labelledby='modal-label'
// 					aria-modal='true'
// 				>
// 					<div className='modal-header'>
// 						<h5 id='modal-label' className='modal-title'>
// 							Error: {msg}
// 						</h5>
// 					</div>
// 					<div className='modal-body'>
// 						<p>{msg.toString()}</p>
// 					</div>
// 				</div>
// 			</div>
// 		)
// 	}

 const valInput = (value:string|number,isEditing:boolean )=> {
	// const valInput =  (value,isEditing, errormsg) => {
	console.log(`value `,value,` isEditing `, isEditing.toString())
 }

function handleStartInputClick(e:React.MouseEvent<HTMLElement>):void {
console.log ("Non EditableCell Clicked - change to editable", e.target)
handleStartEdit()
// setactive(mykey)

}

const handleStartEdit=()=>setIsEditing(true)
const handleStopEdit=()=>setIsEditing(false)

  // useEffect(() => {
		
	// //	if (inputRef !=null)  
	// 	// const inRef = inputRef[0]
	// 	//  inputRef.focus();
  // }, [inputRef]);
  // return (
  //   <input 
  //     ref={inputRef} 
  //     type="text" 
  //   />
  // );



		if (typeof value === 'number' && isEditing)		
		return (
				<React.Fragment>
					<input
						type='number'
						min={minNumber??0}
						key={mykey}
				    ref={editRef}
						onClickCapture={(e)=>startEdit(e)}
					 
						defaultValue={value}
						onChange={(event) => onValueChange(event.target.value)}
						className={
							errormsg.current === undefined
								? classes.editableCell
								: clj(classes.editableCell, classes.hasError)
						}
					onBlur={() => handleStopEdit()}
					/>
					{/* {(errmsg.length >0) && <TtipPortal msg={errmsg} />} */}
	</React.Fragment>	)
			

		if (typeof value === 'string' && isEditing)
		
			return (
				<React.Fragment>
					<input
						type='string'
						defaultValue={value}
					  ref={editRef}
						onChange={(event) => onValueChange(event.target.value)}
						className={
							errormsg.current !== null
								? classes.input
								: clj(classes.editableCell, classes.hasError)
						}
            
							onBlur={() => handleStopEdit()}
					/>
          {errormsg.current && <p>{errormsg}</p>}
				{/* {errormsg.current !== null && <TtipPortal msg={errormsg.current} />} */}
				</React.Fragment>
			)

		return (
			//-non editing follows
			<div 
			
			// onPointerEnterCapture={e=>startEdit(e)}
			 key={mykey}
			  onClick={(e)=>handleStartInputClick(e)}// setIsEditing((x) => !x)}
			//	onBlur={(e) => stopEdit()}
			>
			
				{value.toString()}
			</div>
		)

	} // [value, isEditing, hasError,errormsg.current])

//	return (valInput(value,isEditing,errormsg)) // <div key ={mykey}>"Unknown Value</div>)


export default EditableCell



