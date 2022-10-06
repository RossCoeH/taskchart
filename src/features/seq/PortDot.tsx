import React, { ReactNode } from 'react'
import { useAppDispatch } from '../../app/hooks/hooks';
import {ILayout} from './seqTypes'


interface iPortDot{
  cx:number,
  cy:number,
  r:number,
className?:string,
fill?:string|undefined,
stroke?:string|undefined
iLayout:ILayout
onMouseEnter?: React.MouseEventHandler<SVGCircleElement>
onMouseLeave?: React.MouseEventHandler<SVGCircleElement>
}

const PortDot=(props:iPortDot  )=>{ 
 const{cx,cy,r,
className,fill,stroke,iLayout}=props

// console.log(`PortDot props`, props)
  const dispatch = useAppDispatch();

  return(
    <circle
    cx={cx}
    cy={cy}
    r={r}
    className={className}
    fill={fill}
    stroke={stroke}
    onMouseEnter={props.onMouseEnter}
    onMouseLeave={props.onMouseLeave}
    />
  )
}
export default PortDot