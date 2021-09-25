  
import React, {PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState} from 'react';
// import forceNumber from 'force-number';
import clj from 'classnames'
import classes from './EditableCell.module.scss'
import { NumericLiteral } from 'typescript';

enum celltype{
 string='string',
 number='number',
}

type IeditableCell = {
 // type:celltype
  editable: boolean,
  value: number|string,
  validator: (value: number|string) => string|undefined,
  onChange: (value: number|string) => void,
  minNumber?: number|undefined,
}



const EditableCell = (
  {  editable,
  value,
  validator,
  onChange,
  minNumber=0}:IeditableCell,
  key:string
) =>{
  const [isEditing, setIsEditing] = useState(false);
  const [hasError, setHasError] = useState<string|undefined>();
  let errormsg = useRef<string|null>(null)


  function onValueChange(value: string|number) {
    const error= validator(value)
 //  console.log(`error in cell`, error)
  // errormsg= ref=>((error && error) ||null )=ref
   if (error !==undefined) {
     setHasError(prev=>error)
      onChange(value);
    } else {
      setHasError(undefined)
    }
  }
useEffect(() => {
 // do nothing but read latest state of errors 
// console.log(`hasError changed`, hasError )
}, [hasError])

 const valInput =useMemo(
   () => {

//console.log(`hasError`, hasError ,(hasError===undefined))
   if (typeof value ==='number' && isEditing) return    (
     <>
        <input type='number'
          min = {minNumber}
         key={key}
         defaultValue={value} onChange={event => onValueChange(event.target.value)}
        className={(validator(value)===undefined) ? classes.input : clj(classes.editableCell, classes.hasError) }
        onBlur={() => setIsEditing(false)}/>
        <p>error={hasError}</p>)
        </>)

    if (typeof value ==='string' && isEditing) return <>
         <input type='string'
         defaultValue={value} onChange={event => onValueChange(event.target.value)}
        className={(hasError===undefined) ? classes.input : clj(classes.editableCell, classes.hasError)}
       // onBlur={() => setIsEditing(false)}
        />
         <p>error={hasError}</p>)
        </>
   
  return (    //-non editing follows
         <div  onClick={() => setIsEditing(x => !x)} onFocus={() => setIsEditing(true)}
              //onBlur={() => setIsEditing(false)}
              >   {value}
  </div>
  )

    }, [value,isEditing,hasError])

return (valInput)
};

export default EditableCell