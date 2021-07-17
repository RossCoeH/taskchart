import { createAsyncThunk, createEntityAdapter, createSlice, Dictionary, EntityAdapter, EntityId, EntityState, PayloadAction } from '@reduxjs/toolkit';
import { RootState, AppThunk } from '../../app/store';
import { fetchCount } from './seqAPI';
import {SelActive,Task,Link} from './seqTypes'
import {initTasksArray,initLinksArray} from './initValues'

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



const tasksAdapter= createEntityAdapter<Task>()
const linksAdapter= createEntityAdapter<Link>()

export interface ISelItem{type:string,id:EntityId,name:string} 

 export interface SeqState {
    value: number;
    status: string;
    tasks: EntityState<Task> 
    links: EntityState<Link>;
    mouseOverItem: ISelItem  |undefined
    selectedItems:ISelItem[] |undefined
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
   mouseOverItem: undefined ,
    selectedItems:undefined,
  },



  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    tasksAddOne:(state,entity)=>{
  tasksAdapter.addOne(state.tasks, entity)
},
tasksAddMany:(state,entities)=>{
  tasksAdapter.addMany(state.tasks, entities)
},
tasksSetAll:(state,entities)=>{
  tasksAdapter.setAll(state.tasks, entities)
},
tasksRemoveMany:(state,entities)=>{
  tasksAdapter.removeMany(state.tasks, entities)
},
setMouseOverItem:(state,action: PayloadAction<ISelItem>)=>{
  state.mouseOverItem=action.payload
},
resetMouseOverItem:(state,action: PayloadAction<ISelItem>)=>{
  if (action.payload.type === state.mouseOverItem?.type 
  && action.payload.id === state.mouseOverItem?.id 
  && action.payload.name === state.mouseOverItem?.name)
  // have checked that we are removing the right item
  state.mouseOverItem=undefined
},

// const tasksAddOne=(state,entity){tasksAdapter.addOne(state.tasks,entity)},
// tasksUpsertOne((state,action)={tasksAdapter.upsertOne(state.tasks,payload.task)},

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

export const { increment, decrement, incrementByAmount,resetMouseOverItem,setMouseOverItem } = seqSlice.actions;


// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.seq.value)`

export const selectCount =(state: RootState) => state.seq.value;
//export const selectorTasksAll=tasksAdapter.getSelectors((state:RootState)=>state.seq.tasks).selectAll
//export const selectorLinksAll=(state:RootState)=> linksAdapter.getSelectors((state:RootState)=>state.seq.links).selectAll
// export const {
//   selectAll(): selectTodos,
//   selectById: selectTodoById
// } = tasksAdapter.getSelectors(state:SeqState=> state.tasks)
export const mouseOverItem=(state:RootState)=>state.seq.mouseOverItem
export const selectedItem=(state:RootState)=>state.seq.selectedItems

export const selLinks=linksAdapter.getSelectors((state:RootState)=>state.seq.links)
export const selTasks=tasksAdapter.getSelectors((state:RootState)=>state.seq.tasks)
// We can also write thunks by hand, which may contain both sync and async logic.
// Here's an example of conditionally dispatching actions based on current state.
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
