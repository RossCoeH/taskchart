import {
    createEntityAdapter,
    createSlice,
    EntityId,
    EntityState,
    PayloadAction,
} from '@reduxjs/toolkit';
import { RootState } from '../../app/store';

export interface LogEntry {
    id: EntityId; // optional, will be assigned by adapter
    e_num: number; // severity
    message: string;
}

export interface LogState {
    logs: EntityState<LogEntry, string | number>
    visible: boolean;
    filterString: string;
    filterStringInclude: boolean;
    filterSeverity: number;
    nextLogId: number; //  next log entry
}

interface PartialHasId {
    id: string | number
}
const logsAdapter = createEntityAdapter<LogEntry>()

const initLogEntries: LogEntry[] = [
    { id: 1, e_num: 0, message: 'Error log example' },
    { id: 2, e_num: 1, message: 'Warning log example' },
    { id: 3, e_num: 2, message: 'Info log example' },
    { id: 4, e_num: 3, message: 'Debug log example' },
]

export const EntArrayToAdapter = (ents: Array<PartialHasId>) => {
    const ids: (string | number)[] = ents
        .map((ent) => ent.id)
        .filter((id) => id !== undefined)
    const entities = ents.reduce((a, x) => ({ ...a, [x.id]: x }), {})
    return { ids: ids, entities: entities }
}

export const logSlice = createSlice({
    name: 'log',
    initialState: {
        logs: logsAdapter.setAll(logsAdapter.getInitialState(), initLogEntries),
        visible: true,
        filterString: '',
        filterStringInclude: true,
        filterSeverity: 0,
        nextLogId: 0,
    } as LogState,

    reducers: {
        LogsAddOne: (state, entity: PayloadAction<LogEntry>) => {
            let proposedNewId: number =
                state.logs.ids.length > 0
                    ? Math.max(...(state.logs.ids as number[])) + 1
                    : 1
            while (
                proposedNewId &&
                state.logs.entities[proposedNewId] !== undefined
            ) {
                proposedNewId++
            }

            const newLog: LogEntry = { ...entity.payload, id: proposedNewId }
            logsAdapter.addOne(state.logs, newLog)
        },
        LogsRemoveAll: (state) => {
            logsAdapter.removeAll(state.logs)
        },
    },
})

export const {
    LogsAddOne,
    LogsRemoveAll,
} = logSlice.actions

export const selectLogsAll = logsAdapter.getSelectors(
    (state: RootState) => state.log.logs
).selectAll

export const selLogs = logsAdapter.getSelectors(
    (state: RootState) => state.log.logs
)
export default logSlice.reducer
