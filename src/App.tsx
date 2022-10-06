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
import TanTableResize from './features/seq/TanTableResize';
import TanTableResize0 from './features/seq/Tantable_Resize0';
import RdgCommonFeatures from './features/Tables/reactDataGrid/RDGCommonFeatures'
import RCV_Grid from './features/RVG_table/RCV_grid';
import TwoColorsInput from './features/Inputs/TwoColorsInput/TwoColorsInput';
import MyTsGrid from './features/MyTsGrid';
import MyTable from './features/Tables/MyTable';

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
    // <ViewportProvider >
    <div className="App">
 
      <header className="App-header">
        <p>
          My Chart 4
        </p>
         </header> 
         <TwoColorsInput startChars="v" color='orange' endChars='e' value='value' 
         onChange ={(e)=>console.log(`( input change.target.value)`, e)}  
         />
 <div
      tabIndex={1}
      onFocus={(e:React.FocusEvent<HTMLDivElement | EventTarget>) => {
        if (e.currentTarget === e.target) {
          console.log('focused self');
        } else {
          console.log('focused child', e.target);
        }
        // if (!e.currentTarget.contains(e.relatedTarget)) {
        //   // Not triggered when swapping focus between children
        //   console.log('focus entered self');
        // }
      }}
      onBlur={(e:React.FocusEvent<HTMLDivElement>) => {
        if (e.currentTarget === e.target) {
          console.log('unfocused self');
          
        } else {
          console.log('unfocused child', e.target);
        }
        // if (!e.currentTarget.contains(e.relatedTarget)) {
        //   // Not triggered when swapping focus between children
        //   console.log('focus left self');
        // }
      }}
    >
      <input id="1" value="Click 1"/>
      <input id="2" />
    </div>

         <MyTable/>

        <Seq></Seq>
         {/* <TestHover/> */}
        {/* <RdgMoveableRows/> */}
<p> common features</p>
         {/* <RdgCommonFeatures/> */}
         
    </div>
    //  </ViewportProvider>
  );
}

export default App;
