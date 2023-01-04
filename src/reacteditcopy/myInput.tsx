/* eslint-disable no-shadow, react/require-default-props */
import { type } from 'os';
import React, { InputHTMLAttributes ,KeyboardEvent, SyntheticEvent} from 'react';
import { FunctionDeclaration, JsxElement, TypeOfExpression } from 'typescript';
// import PropTypes from 'prop-types';
interface InProps extends InputHTMLAttributes<HTMLInputElement>{
onValue:Function
extraParameters:any
}

const myInput = (props:InProps) => {

  const onValue=props.onValue;
  const value=props.value||undefined;
  const inputCellType:string = props.type?.toString()||'string' // get cell type
  const Input = () => {
    const onKeyUp =(e:KeyboardEvent<HTMLInputElement>):void => {
       if (e.key === 'Enter') {
       const target = e.target as HTMLInputElement
        onValue(parseValue(target.value,inputCellType));
      }
    };
    const onBlur = (event: { nativeEvent?: any; target?: any; }) => { // eslint-disable-line react/prop-types
      const { target: { value } } = event;

      if (event.nativeEvent.explicitOriginalTarget &&
        event.nativeEvent.explicitOriginalTarget === event.nativeEvent.originalTarget) {
        return;
      }

      onValue(parseValue(value,inputCellType));
    };
    const parseValue= (value: string,inputCellType:string) => {
       if(inputCellType==='number'  && (typeof(value) === 'string')) {
      const  numberValue:number = parseFloat(value as string)
      return numberValue}
      return value}

    return (
      <input
        defaultValue={value}
        onKeyUp={onKeyUp}
        onBlur={onBlur}
        autoFocus
     {...props}
      />
    );
  };
  

  return Input;
};

export default myInput;