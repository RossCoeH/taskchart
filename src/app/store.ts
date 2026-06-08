import { Action, configureStore, ThunkAction } from '@reduxjs/toolkit';



import counterReducer from '../features/counter/counterSlice';
import logSliceReducer from '../features/logItem/logSlice';
import seqReducer from '../features/seq/seqSlice';


export const store = configureStore({
  reducer: {
    counter: counterReducer,
        seq: seqReducer,
        log:logSliceReducer,
  },

    }
    
);

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
