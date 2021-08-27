import React,{ RefObject, useEffect, useRef, useState } from 'react'
import { background } from './Seq'

export function useHover<T extends HTMLElement = HTMLElement>(
  elementRef: RefObject<T>,
): boolean {
  const [value, setValue] = useState<boolean>(false)

  const handleMouseEnter = () => setValue(true)
  const handleMouseLeave = () => setValue(false)

  useEffect(() => {
    const node = elementRef?.current
 console.log(`node elementRef`, elementRef.current)
    if (node) {
       console.log(`watch elementRef`, elementRef.current)
      node.addEventListener('mouseenter', handleMouseEnter)
      node.addEventListener('mouseleave', handleMouseLeave)
     
      return () => {
        node.removeEventListener('mouseenter', handleMouseEnter)
        node.removeEventListener('mouseleave', handleMouseLeave)
      }
    }
  }, [elementRef])

  return value
}

const TestHover =()=>{
   const hoverRef1 = useRef(null)
      const hoverRef2 = useRef(null)
  const isHover1 = useHover(hoverRef1)
    const isHover2 = useHover(hoverRef1)
  const divkey='divkey'
  const svgkey='svgKey'
  return (
    <div>
    <div ref={hoverRef1} >
      {`The current div is ${isHover1 ? `hovered` : `unhovered`}`}
    </div>
     <div>----</div>
    <svg width ='100' height='20'
    ref={hoverRef1}
    style={isHover2?{backgroundColor:'red'}:{backgroundColor:'orange'}}
    
    >
   
    </svg>
    </div>
  )
}

export default TestHover

