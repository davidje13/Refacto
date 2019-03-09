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
  global.fetch(`${API_BASE}/retros`)
    .then((data) => data.json())
    .then((data) => dispatch(setData(data.retros)))
    .catch(() => dispatch(loadFailed()));
};

const initialState = null;

export default (state = initialState, action) => {
  switch (action.type) {
    case 'RETRO_LIST_BEGIN_LOAD':
      return initialState;
    case 'RETRO_LIST_SET':
      return {
        retros: action.retros,
        error: null,
      };
    case 'RETRO_LIST_FAIL_LOAD':
      return {
        retros: null,
        error: action.error,
      };
    default:
      return state;
  }
};
