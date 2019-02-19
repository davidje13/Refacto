import update from 'immutability-helper';

const API_BASE = '/api';

const beginLoad = () => ({
  type: 'RETRO_LIST_BEGIN_LOAD',
});

const setData = (retros) => ({
  type: 'RETRO_LIST_SET',
  retros,
});

const loadFailed = () => ({
  type: 'RETRO_LIST_FAIL_LOAD',
  error: 'Failed to load retros.',
});

export const reloadRetroList = () => (dispatch) => {
  dispatch(beginLoad());
  fetch(`${API_BASE}/retros`)
    .then((data) => data.json())
    .then((data) => dispatch(setData(data.retros)))
    .catch(() => dispatch(loadFailed()));
};

const initialState = {
  loading: false,
  retros: [],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case 'RETRO_LIST_BEGIN_LOAD':
      return update(state, {
        retros: { $set: [] },
        loading: { $set: true },
      });
    case 'RETRO_LIST_SET':
      return update(state, {
        retros: { $set: action.retros },
        loading: { $set: false },
      });
    case 'RETRO_LIST_FAIL_LOAD':
      return update(state, {
        loading: { $set: false },
      });
    default:
      return state;
  }
};
