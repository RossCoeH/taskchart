import React,{PropsWithChildren, ReactChild , ReactChildren, ReactFragment, ReactNode} from 'react';
import logo from './logo.svg';
import { Counter } from './features/counter/Counter';
import {Seq} from './features/seq/Seq'
import './App.css';
//  imported viewport listener from:
// https://blog.logrocket.com/developing-responsive-layouts-with-react-hooks/
//--------------------
import { useEffect } from 'react';
import TestHover from './features/seq/TestHover';
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
        {/* <img src={logo} className="App-logo" alt="logo" />
        <Counter /> */}
        <p>
          My Chart 4
        </p>
         </header>
         <Seq></Seq>
         <TestHover/>
    </div>
    //  </ViewportProvider>
  );
}

export default App;
