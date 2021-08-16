import React from 'react'
interface IPortTriangle{
x:number,y:number,height:number,width:number,
className:string,
fill?:string|undefined,
stroke?:string|undefined,
onMouseEnter?: React.MouseEventHandler<SVGPolygonElement>
onMouseLeave?: React.MouseEventHandler<SVGPolygonElement>
onMouseUp?: React.MouseEventHandler<SVGPolygonElement>
}
const PortTriangle =(props:IPortTriangle)=> {
  const {x,y,height,width,className,fill,stroke}=props
   // polygon uses x,y sequence in array
   debugger
   console.log(`PortTriangle props`, props)
   const  points = [x-width,y+height/2,x-width,y-height/2,x,y].toString()
   // console.log(`PortTriangle Path`, points)
  return(
   
<polygon 
className={className}
points= {points}
fill={fill}
stroke={stroke}
onMouseUp={props.onMouseUp}
/>
  )
}

export default PortTriangle
