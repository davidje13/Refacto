import update from 'immutability-helper';
import retroReducer from './retro';

const initialState = {};

export default (state = initialState, action) => {
  if (action.retroSlug) {
    return update(state, {
      [action.retroSlug]: { $apply: (retroState) => retroReducer(retroState, action) },
    });
  }

  return state;
};
