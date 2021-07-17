import seqReducer, {
  SeqState,
  increment,
  decrement,
  incrementByAmount,
} from './seqSlice';

describe('seq reducer', () => {
  const initialState: SeqState = {
    value: 3,
    status: 'idle',
  };
  it('should handle initial state', () => {
    expect(seqReducer(undefined, { type: 'unknown' })).toEqual({
      value: 0,
      status: 'idle',
    });
  });

  it('should handle increment', () => {
    const actual = seqReducer(initialState, increment());
    expect(actual.value).toEqual(4);
  });

  it('should handle decrement', () => {
    const actual = seqReducer(initialState, decrement());
    expect(actual.value).toEqual(2);
  });

  it('should handle incrementByAmount', () => {
    const actual = seqReducer(initialState, incrementByAmount(2));
    expect(actual.value).toEqual(5);
  });
});
