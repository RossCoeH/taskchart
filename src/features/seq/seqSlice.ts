import { AsyncThunk, createAsyncThunk, createEntityAdapter, createSlice, Dictionary, EntityAdapter, EntityId, EntityState, PayloadAction, ThunkAction } from '@reduxjs/toolkit';
import { RootState, AppThunk, AppDispatch } from '../../app/store';
import { fetchCount } from './seqAPI';
import {SelActive,Task,Link} from './seqTypes'
import {initTasksArray,initLinksArray} from './initValues'
import { formatDiagnostic } from 'typescript';
import { useAppDispatch } from '../../app/hooks';

// export interface SeqState {
//   value: number;
//   status: 'idle' | 'loading' | 'failed';
// }



// export interface SeqState{
//   value:number,
//   status: string
//   tasks: EntityAdapter<Task>
//   links: EntityAdapter<Link>
// }





// const initialState : {
//   value:0,
//   status: 'idle',
//   tasks: tasksAdapter.getInitialState({}),
//   links linksAdapter.getInitialState([]),
// }

// The function below is called a thunk and allows us to perform async logic. It
// can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
// will call the thunk with the `dispatch` function as the first argument. Async
// code can then be executed and other actions can be dispatched. Thunks are
// typically used to make async requests.
export const incrementAsync = createAsyncThunk(
  'seq/fetchCount',
  async (amount: number) => {
    const response = await fetchCount(amount);
    // The value we return becomes the `fulfilled` action payload
    return response.data;
  }
);
/* 
export const incrementLinkId= createAsyncThunk(
  'seq/incrementLinkId',
  async(state:RootState)=>{
       let nextId:number = state.seq.nextLinkId
	  while (state.seq.links.ids.find(item=>item.toString===nextId.toString)) nextId++
  if (nextId>100)alert ('reached max links count of 100')
  return
  if (nextId !== state.seq.nextLinkId) useAppDispatch(setNextLinkId(nextId))}
  }
) */


const tasksAdapter= createEntityAdapter<Task>()
const linksAdapter= createEntityAdapter<Link>()

export interface ISelItem{type:string,id:EntityId,sname:string,desc:string} 

 export interface SeqState {
    value: number;
    status: string;
    tasks: EntityState<Task> 
    links: EntityState<Link>;
    isDragging:boolean,
    mouseOverItem: ISelItem  |undefined
    selectedItems:ISelItem[] 
    nextLinkId :number
    nextTaskId:EntityId
}

interface PartialHasId{id:string|number}

export const EntArrayToAdapter=(ents:Array< PartialHasId>)=>{ 
  const ids:(string|number)[]= ents.map(ent=>ent.id).filter(id=>(id !==undefined))
  let entities = ents.reduce((a,x) => ({...a, [x.id]: x}), {})
  // RJH tested and working 
  // console.log(`Adapter convert import to `, {ids:ids,entities: entities})
  return(
    {ids:ids,entities: entities}
  )
}

export const seqSlice = createSlice({
  name: 'seq',
  initialState: <SeqState>{
     value: 0,
  status: 'idle',
  tasks:tasksAdapter.getInitialState(EntArrayToAdapter(initTasksArray)),
  links: linksAdapter.getInitialState(EntArrayToAdapter(initLinksArray)),
  isDragging:false,
   mouseOverItem: undefined ,
    selectedItems:[],
    nextLinkId :4,
    nextTaskId:6,
  },




  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {

    linksAddOne:(state,entity:PayloadAction <Link>)=>{ 
      // check that id is not already used
      let newId= entity.payload.id 
      while (newId && state.links.entities[newId] !==undefined) {
         newId++
         console.log(`Updated`, newId )
         
       }

      console.log(`input redux link`, entity)
      const newLink:Link= {...entity.payload,id:newId}
      console.log(`adding into redux new link`, entity)
   linksAdapter.addOne(state.links, newLink)
  state.nextLinkId=newId+1
  },

  linksUpsertOne:(state,entity:PayloadAction <Link>)=>{ 
      console.log(`adding into redux link`, entity)
  linksAdapter.upsertOne(state.links, entity.payload)
},
    tasksUpsertOne:(state,entity:PayloadAction <Task>)=>{
  tasksAdapter.addOne(state.tasks, entity)
},
tasksAddMany:(state,entities:PayloadAction <Task[]>)=>{
  tasksAdapter.addMany(state.tasks, entities)
},
tasksSetAll:(state,entities:PayloadAction <Task[]>)=>{
  tasksAdapter.setAll(state.tasks, entities)
},
tasksRemoveMany:(state,entities:PayloadAction <EntityId[]>)=>{
  tasksAdapter.removeMany(state.tasks, entities)
},
setMouseOverItem:(state,action: PayloadAction<ISelItem>)=>{
  state.mouseOverItem=action.payload
},
resetMouseOverItem:(state,action: PayloadAction<ISelItem>)=>{
  if (action.payload.type === state.mouseOverItem?.type 
  && action.payload.id === state.mouseOverItem?.id 
  && action.payload.desc === state.mouseOverItem?.desc)
  // have checked that we are removing the right item
  state.mouseOverItem=undefined
},
toggleSelectedItem:(state,action: PayloadAction<ISelItem>)=>{
 const  index =state.selectedItems.findIndex(item=>item.sname===action.payload.sname)
 console.log(` toggleselectedItem sname, index`,   action.payload, index)
if (index>=0)
 { console.log('Item already selected  '+action.payload.sname)
   state.selectedItems.splice(index,1)
 }

  else
 { state.selectedItems.push(action.payload)}
},
removeSelectedItem:(state,action: PayloadAction<ISelItem>)=>{
  state.selectedItems.filter(item=>item.sname!==action.payload.sname)
},

// const tasksAddOne=(state,entity){tasksAdapter.addOne(state.tasks,entity)},
// tasksUpsertOne((state,action)={tasksAdapter.upsertOne(state.tasks,payload.task)},
 setNextLinkId:(state)=>{
     while (state.links.ids[state.nextLinkId])state.nextLinkId++
},
    increment: (state) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    // Use the PayloadAction type to declare the contents of `action.payload`
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
    },
    // ,
// upsertTasks: tasksAdapter.upsertMany,

  },
  // The `extraReducers` field lets the slice handle actions defined elsewhere,
  // including actions generated by createAsyncThunk or in other slices.
  extraReducers: (builder) => {
    builder
      .addCase(incrementAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(incrementAsync.fulfilled, (state, action) => {
        state.status = 'idle';
        state.value += action.payload;
      });
  },
  
});

export const { increment, decrement, incrementByAmount,setNextLinkId,linksAddOne ,linksUpsertOne,tasksUpsertOne,resetMouseOverItem,
setMouseOverItem ,toggleSelectedItem,removeSelectedItem} = seqSlice.actions;


// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.seq.value)`

export const selectCount =(state: RootState) => state.seq.value;
export const getNextLinkId =(state: RootState) => state.seq.nextLinkId;
export const getNextTaskId =(state: RootState) => state.seq.nextTaskId;
//export const selectorTasksAll=tasksAdapter.getSelectors((state:RootState)=>state.seq.tasks).selectAll
//export const selectorLinksAll=(state:RootState)=> linksAdapter.getSelectors((state:RootState)=>state.seq.links).selectAll
// export const {
//   selectAll(): selectTodos,
//   selectById: selectTodoById
// } = tasksAdapter.getSelectors(state:SeqState=> state.tasks)
export const isDragging=(state:RootState)=>state.seq.isDragging
export const mouseOverItem=(state:RootState)=>state.seq.mouseOverItem
export const selectedItems=(state:RootState)=>state.seq.selectedItems

export const selLinks=linksAdapter.getSelectors((state:RootState)=>state.seq.links)
export const selTasks=tasksAdapter.getSelectors((state:RootState)=>state.seq.tasks)



// We can also write thunks by hand, which may contain both sync and async logic.
// Here's an example of conditionally dispatching actions based on current state.

/*  export const getNextLinkId = createAsyncThunk('seq/getNextLinkId',
(dispatch:AppDispatch,getState):number=>{ 
  while (getState().seq.links?.ids[getState().seq?.nextLinkId] !==undefined)
  if (getState().seq.nextLinkId>100)alert ('reached max links count of 100')
  {await dispatch(setNextLinkId)}
 return state.seq.nextLinkId
  }
 )
 */
export const incrementIfOdd = (amount: number): AppThunk => (
  dispatch,
  getState
) => {
  const currentValue = selectCount(getState());
  if (currentValue % 2 === 1) {
    dispatch(incrementByAmount(amount));
  }
};


export default seqSlice.reducer;
function Dispatch(arg0: string, dispatch: any, Dispatch: any, state: any, RootState: any) {
  throw new Error('Function not implemented.');
}

