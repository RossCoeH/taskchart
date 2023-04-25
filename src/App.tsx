import React,{PropsWithChildren, ReactChild , ReactChildren, ReactFragment, ReactNode} from 'react'
import logo from './logo.svg';
import { Counter } from './features/counter/Counter';
import {Seq} from './features/seq/Seq'
import './App.css';
//  imported viewport listener from:
// https://blog.logrocket.com/developing-responsive-layouts-with-react-hooks/
//--------------------
import { useEffect } from 'react';
import TestHover from './features/seq/TestHover';
///import GrommetTable from './features/Tables/GrommetTable';

import Rectabular from './excluded/Rectabular'
//import TanTableDnD from './features/Tables/TanTable_DnD'
//import TanTableResize0 from './features/seq/Tantable_Resize0';
import TwoColorsInput from './features/Inputs/TwoColorsInput/TwoColorsInput';
import MyTsGrid from './features/MyTsGrid';
import MyTable from './features/Tables/MyTable';
import { ZoomXYChart } from './features/seq/ZoomXYChart';
import ZoomI from './features/seq/ZoomIExample';
// import GrommetTable from './features/Tables/GrommetTable';
//import FluentTable from './excluded/FluentUITable';

// import ReactTabTable from './features/Tables/ReactTabTable.xsx'

/**
 * useKeyPress
 * @param {string} key - the name of the key to respond to, compared against event.key
 * @param {function} action - the action to perform on key press
 */

//--------------------
function App() {
  //   const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
//   const [show, setShow] = useState(false); // hide menu

//   const handleContextMenu = useCallback(
//     (event) => {
//       event.preventDefault();
//       setAnchorPoint({ x: event.pageX, y: event.pageY });
//       setShow(true);
//     },
//     [setAnchorPoint]
//   );

//   const handleClick = useCallback(() => (show ? setShow(false) : null), [show]);



//   useEffect(() => {
//     document.addEventListener("click", handleClick);
//     document.addEventListener("contextmenu", handleContextMenu);
//     return () => {
//       document.removeEventListener("click", handleClick);
//       document.removeEventListener("contextmenu", handleContextMenu);
//     };
//   });
  return (


    <div className="App">
 
      <header className="App-header">
   
        <p>
          My Chart 4
        </p>
         </header> 
    {/*    <TwoColorsInput startChars="v" color='orange' endChars='e' value='value' 
         onChange ={(e)=>console.log(`( input change.target.value)`, e)}  
         /> 
         */}   
         <div className='TableGraphContainer'>
    
        <Seq/>
        {/* <ZoomXYChart />
        <ZoomI width={500} height={400} /> */}
         </div>
      
    </div>

  );
}

export default App;
