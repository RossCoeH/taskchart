import React,{PropsWithChildren, ReactChild , ReactChildren, ReactFragment, ReactNode} from 'react';
import logo from './logo.svg';
import { Counter } from './features/counter/Counter';
import {Seq} from './features/seq/Seq'
import './App.css';
//  imported viewport listener from:
// https://blog.logrocket.com/developing-responsive-layouts-with-react-hooks/
//--------------------

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
    </div>
    //  </ViewportProvider>
  );
}

export default App;
