import {
	createAsyncThunk,
	createEntityAdapter,
	createSlice,
	EntityId,
	EntityState,
	PayloadAction,
	current,
	Update,
} from '@reduxjs/toolkit'
import { RootState, AppThunk } from '../../app/store'
import { fetchCount } from './seqAPI'
import {
	Task,
	Link,
	IArrayOrderMove,
	e_SeqDiagElement,
	ISelDiagItem,
} from './seqTypes'
import { initTasksArray, initLinksArray } from './seqInitValues'
//import _ from 'lodash'

// The function below is called a thunk and allows us to perform async logic. It
// can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
// will call the thunk with the `dispatch` function as the first argument. Async
// code can then be executed and other actions can be dispatched. Thunks are
// typically used to make async requests.
export const incrementAsync = createAsyncThunk(
	'seq/fetchCount',
	async (amount: number) => {
		const response = await fetchCount(amount)
		// The value we return becomes the `fulfilled` action payload
		return response.data
	}
)
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

const tasksAdapter = createEntityAdapter<Task>()
const linksAdapter = createEntityAdapter<Link>()

export interface ISelItem {
	type: e_SeqDiagElement
	id: EntityId | undefined
	sname: string
	desc: string
}

export interface SeqState {
	value: number
	status: string
	tasks: EntityState<Task>
	links: EntityState<Link>
	isDragging: boolean
	mouseOverItem?: ISelDiagItem
	mouseDownInItem?: ISelDiagItem
	selectedItems: ISelDiagItem[]
	nextLinkId: number
	nextTaskId: number
	linkUpdateCount: number // used to watch for changes in logic
	taskUpdateCount: number // used to watch for changes in object
}

interface PartialHasId {
	id: string | number
}

export const EntArrayToAdapter = (ents: Array<PartialHasId>) => {
	const ids: (string | number)[] = ents
		.map((ent) => ent.id)
		.filter((id) => id !== undefined)
	let entities = ents.reduce((a, x) => ({ ...a, [x.id]: x }), {})
	// RJH tested and working
	// console.log(`Adapter convert import to `, {ids:ids,entities: entities})
	return { ids: ids, entities: entities }
}

export const seqSlice = createSlice({
	name: 'seq',
	initialState: <SeqState>{
		value: 0,
		status: 'idle',
		tasks: tasksAdapter.getInitialState(EntArrayToAdapter(initTasksArray)),
		links: linksAdapter.getInitialState(EntArrayToAdapter(initLinksArray)),
		isDragging: false,
		mouseOverItem: undefined,
		selectedItems: [],
		nextLinkId: 4,
		nextTaskId: 6,
		linkUpdateCount: 0,
		taskUpdateCount: 0,
	},

	// The `reducers` field lets us define reducers and generate associated actions
	reducers: {
		linksAddOne: (state, entity: PayloadAction<Link>) => {
			// check that id is not already used
			let proposedNewId: number = state.nextLinkId
			while (
				proposedNewId &&
				state.links.entities[proposedNewId] !== undefined
			) {
				proposedNewId++
				//	   console.log(`NextLinkId has been incremented to`, proposedNewId )
			}

			//	console.log(`input redux link`, entity)
			const newLink: Link = { ...entity.payload, id: proposedNewId }
			console.log(`adding into redux new link as`, proposedNewId, entity)
			linksAdapter.addOne(state.links, newLink)
			state.nextLinkId = proposedNewId + 1
			console.log('current state after LinksAddOne', current(state))
			state.linkUpdateCount++ //update to show link logic changed
		},

		linksUpsertOne: (state, entity: PayloadAction<Link>) => {
			console.log(`adding into redux link`, entity)
			linksAdapter.upsertOne(state.links, entity.payload)
			state.linkUpdateCount++ //update to show link logic changed
		},
		linksRemoveMany: (state, entities: PayloadAction<EntityId[]>) => {
			linksAdapter.removeMany(state.links, entities)
			state.linkUpdateCount++ //update to show link logic changed
		},

		tasksAddOne: (state, entity: PayloadAction<Task>) => {
			var newTaskId = state.nextTaskId
			// check that id is not already used - increment if already used
			while (newTaskId && state.tasks.entities[newTaskId] !== undefined) {
				newTaskId++
				console.log(`newTaskId added `, newTaskId)
			}

			// console.log(`input redux task`, entity)
			const newTask: Task = { ...entity.payload, id: newTaskId }
			//	console.log(`adding into redux new task`, entity)
			tasksAdapter.addOne(state.tasks, newTask)
			state.nextTaskId = newTaskId + 1
			state.taskUpdateCount++ //update to show link logic changed
		},
		tasksUpsertOne: (state, entity: PayloadAction<Task>) => {
			tasksAdapter.upsertOne(state.tasks, entity)
			state.taskUpdateCount++ //update to show link logic changed
		},
		tasksUpdateOne: (state, entity: PayloadAction<Update<Task>>) => {
			tasksAdapter.updateOne(state.tasks, entity)
			state.taskUpdateCount++ //update to show link logic changed
		},
		tasksAddMany: (state, entities: PayloadAction<Task[]>) => {
			tasksAdapter.addMany(state.tasks, entities)
			state.taskUpdateCount++ //update to show link logic changed
		},
		tasksSetAll: (state, entities: PayloadAction<Task[]>) => {
			tasksAdapter.setAll(state.tasks, entities)
			state.taskUpdateCount++ //update to show link logic changed
		},
		tasksRemoveMany: (state, entities: PayloadAction<EntityId[]>) => {
			tasksAdapter.removeMany(state.tasks, entities)
			state.taskUpdateCount++ //update to show link logic changed
		},

		tasksReorder: (state, entities: PayloadAction<IArrayOrderMove>) => {
			// const reorderRow = (fromRowIndex: number, toRowIndex: number)
			const {
				fromRowIndex,
				toRowIndex,
			}: { fromRowIndex: number; toRowIndex: number } = entities.payload
			console.log('TODO define row move', fromRowIndex, ' to ', toRowIndex)
			console.log('Ids before move: ', current(state.tasks.ids))
			const elementToMove = state.tasks.ids.splice(fromRowIndex, 1)[0]
			//removed 1 Id from array - therefore it is first element in array
			//const elementToMove =state.tasks.ids.splice(fromRowIndex,1,0)[0] //remove 1 Id from array
			console.log('mid id move', current(state.tasks.ids))
			state.tasks.ids.splice(toRowIndex, 0, elementToMove) //add element in new location without delete

			//TODO test reorder entities setData([...data])
			console.log('after id move', current(state.tasks.ids))
			state.taskUpdateCount++ //update to show link logic changed
		},
		setMouseOverItem: (state, action: PayloadAction<ISelDiagItem>) => {
			state.mouseOverItem = action.payload
		},
		setMouseDownInItem: (state, action: PayloadAction<ISelDiagItem>) => {
			state.mouseDownInItem = action.payload
		},

		resetMouseOverItem: (state, action: PayloadAction<ISelDiagItem>) => {
			if (
				action.payload.type === state.mouseOverItem?.type &&
				action.payload.id === state.mouseOverItem?.sname
			)
				// && action.payload.desc === state.mouseOverItem?.desc)
				// have checked that we are removing the right item
				state.mouseOverItem = undefined
		},
		setSelectedItem: (state, action: PayloadAction<ISelDiagItem>) => {
			state.selectedItems = [action.payload]
		},
		toggleDiagSelectedItem: (state, action: PayloadAction<ISelDiagItem>) => {
			const index = state.selectedItems.findIndex(
				(item) => item.sname === action.payload.sname
			)
			console.log(` toggleselectedItem sname, index`, action.payload, index)
			if (index >= 0) {
				console.log('Item already selected  ' + action.payload.sname)
				state.selectedItems.splice(index, 1)
			} else {
				state.selectedItems.push(action.payload)
			}
		},
		removeSelectedItem: (state, action: PayloadAction<ISelItem>) => {
			state.selectedItems.filter((item) => item.sname !== action.payload.sname)
			state.linkUpdateCount++ //update to show link logic changed
			state.taskUpdateCount++ //update to show link logic changed
		},
		removeAllSelectedItems: (state, action: PayloadAction<void>) => {
			state.selectedItems = []
			state.linkUpdateCount++ //update to show link logic changed
			state.taskUpdateCount++ //update to show link logic changed
		},

		// const tasksAddOne=(state,entity){tasksAdapter.addOne(state.tasks,entity)},
		// tasksUpsertOne((state,action)={tasksAdapter.upsertOne(state.tasks,payload.task)},
		setNextLinkId: (state) => {
			while (state.links.ids[state.nextLinkId]) state.nextLinkId++
		},
		increment: (state) => {
			// Redux Toolkit allows us to write "mutating" logic in reducers. It
			// doesn't actually mutate the state because it uses the Immer library,
			// which detects changes to a "draft state" and produces a brand new
			// immutable state based off those changes
			state.value += 1
		},
		decrement: (state) => {
			state.value -= 1
		},
		// Use the PayloadAction type to declare the contents of `action.payload`
		incrementByAmount: (state, action: PayloadAction<number>) => {
			state.value += action.payload
		},
		// ,
		// upsertTasks: tasksAdapter.upsertMany,
	},
	// The `extraReducers` field lets the slice handle actions defined elsewhere,
	// including actions generated by createAsyncThunk or in other slices.
	extraReducers: (builder) => {
		builder
			.addCase(incrementAsync.pending, (state) => {
				state.status = 'loading'
			})
			.addCase(incrementAsync.fulfilled, (state, action) => {
				state.status = 'idle'
				state.value += action.payload
			})
	},
})

export const {
	increment,
	decrement,
	incrementByAmount,
	setNextLinkId,
	linksAddOne,
	linksUpsertOne,
	linksRemoveMany,
	tasksAddOne,
	tasksUpsertOne,
	tasksUpdateOne,
	tasksReorder,
	tasksRemoveMany,
	resetMouseOverItem,
	setMouseOverItem,
	setMouseDownInItem,
	setSelectedItem,
	toggleDiagSelectedItem,
	removeSelectedItem,
	removeAllSelectedItems,
} = seqSlice.actions

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.seq.value)`

export const selectCount = (state: RootState) => state.seq.value
export const getNextLinkId = (state: RootState) => state.seq.nextLinkId
export const getNextTaskId = (state: RootState) => state.seq.nextTaskId
export const linkUpdateCount = (state: RootState) => state.seq.linkUpdateCount
export const taskUpdateCount = (state: RootState) => state.seq.taskUpdateCount
export const selectTasksAll = tasksAdapter.getSelectors(
	(state: RootState) => state.seq.tasks
).selectAll
export const selectLinksAll = linksAdapter.getSelectors(
	(state: RootState) => state.seq.links
).selectAll
// export const {
//   selectAll(): selectTodos,
//   selectById: selectTodoById
// } = tasksAdapter.getSelectors(state:SeqState=> state.tasks)
export const isDragging = (state: RootState) => state.seq.isDragging
export const mouseOverItem = (state: RootState) => state.seq.mouseOverItem
export const selectedItems = (state: RootState) => state.seq.selectedItems
export const mouseDownInItem = (state: RootState) => state.seq.mouseOverItem

export const selLinks = linksAdapter.getSelectors(
	(state: RootState) => state.seq.links
)
export const selTasks = tasksAdapter.getSelectors(
	(state: RootState) => state.seq.tasks
)

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
export const incrementIfOdd =
	(amount: number): AppThunk =>
	(dispatch, getState) => {
		const currentValue = selectCount(getState())
		if (currentValue % 2 === 1) {
			dispatch(incrementByAmount(amount))
		}
	}

export default seqSlice.reducer
// function Dispatch(
// 	arg0: string,
// 	dispatch: any,
// 	Dispatch: any,
// 	state: any,
// 	RootState: any
// ) {
// 	throw new Error('Function not implemented.')
// }
