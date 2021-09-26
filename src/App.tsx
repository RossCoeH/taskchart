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
import MyTable from './features/Tables/MyTable';
import MuiGrid from './features/muiTable/MuiGrid';
import GrommetTable from './features/Tables/GrommetTable';
import TabulatorTable from './features/tabulator/TabulatorTable';
import TabulatorTableExample from './features/tabulator/TabulatorTable example';
import TabulatorGrid1 from './features/tabulator/TabulatorGrid1';
import Rectabular from './excluded/Rectabular'
import TanTableResize from './features/seq/TanTableResize';
import TanTableResize0 from './features/seq/Tantable_Resize0';
/**
 * useKeyPress
 * @param {string} key - the name of the key to respond to, compared against event.key
 * @param {function} action - the action to perform on key press
 */

//--------------------
function App() {
  return (
    // <ViewportProvider >
    <div className="App">
      <header className="App-header">
        <p>
          My Chart 4
        </p>
         </header> 
         <TabulatorGrid1/>
         {/* <TabulatorTableExample/> */}
         <TabulatorTable/>
         {/* <TanTableResize0/> */}
         	{/* <MyTable /> */}
        {/* <Seq></Seq> */}
         {/* <TestHover/> */}
    </div>
    //  </ViewportProvider>
  );
}

export default App;
