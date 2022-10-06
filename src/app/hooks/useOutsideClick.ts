//from https://gist.github.com/anthowen/e2a50f506bd6fb29f16bc898286ecac5
// github anthowen/useOutsideClick.ts
import { useEffect, RefObject } from 'react';

/**
 * Hook that handles outside click event of the passed refs
 *
 * @param refs array of refs
 * @param handler a handler function to be called when clicked outside
 */
export default function useOutsideClick(
  refs: Array<RefObject<HTMLElement> | undefined>,
  handler?: () => void,
) {
  useEffect(() => {
    function handleClickOutside(event: any) {
      if (!handler) return;

      // Clicked browser's scrollbar
      if (
        event.target === document.getElementsByTagName('html')[0] &&
        event.clientX >= document.documentElement.offsetWidth
      )
        return;

      let containedToAnyRefs = false;
      for (const rf of refs) {
        if (rf && rf.current && rf.current.contains(event.target)) {
          containedToAnyRefs = true;
          break;
        }
      }

      // Not contained to any given refs
      if (!containedToAnyRefs) {
        handler();
      }
    }

    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [refs, handler]);
}


/*

//   Custom Hook from
//   https://stackoverflow.com/questions/32553158/detect-click-outside-react-component
// */
// function useOuterClick(callback: Array<React.MutableRefObject<JsxElement>[]>| undefined) {
//   const InnerRef = useRef<JsxElement[]>();
//   const callbackRef = useRef<JsxElement[]>();

//   // set current callback in ref, before second useEffect uses it
//   useEffect(() => { // useEffect wrapper to be safe for concurrent mode
//     callbackRef.current = callback;
//   });

//   useEffect(() => {
//     document.addEventListener("click", handleClick);
//     return () => document.removeEventListener("click", handleClick);

//     // read most recent callback and innerRef dom node from refs
//     function handleClick(e:MouseEvent) {
//      const  innerCurrent= InnerRef.current
//      const callRef= callbackRef.current
//       if (
//         innerCurrent && 
//         callRef &&
//         !innerCurrent.find(e.target)
//       ) {
//         callRef(e);
//       }
//     }
//   }, []); // no need for callback + innerRef dep
  
//   return InnerRef; // return ref; client can omit `useRef`
// }

// /*
//   Usage 
// */
// const Client = () => {
//   const [counter, setCounter] = useState(0);
//   const innerRef = useOuterClick(e:MouseEvent) => {
//     // counter state is up-to-date, when handler is called
//     alert(`Clicked outside! Increment counter to ${counter + 1}`);
//     setCounter(c => c + 1);
//   });
//   return (
//     <div>
//       <p>Click outside!</p>
//       <div id="container" ref={innerRef}>
//         Inside, counter: {counter}
//       </div>
//     </div>
//   )
// }

