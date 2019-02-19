import update from 'immutability-helper';

const API_BASE = '/api';

const beginLoad = () => ({
  type: 'RETRO_BEGIN_LOAD',
});

const setData = (retro) => ({
  type: 'RETRO_SET',
  retro,
});

const loadFailed = () => ({
  type: 'RETRO_FAIL_LOAD',
  error: 'Failed to load retro.',
});

export const setActiveRetro = (slug) => (dispatch) => {
  dispatch(beginLoad());
  fetch(`${API_BASE}/retros/${slug}`)
    .then((data) => data.json())
    .then((data) => dispatch(setData(data)))
    .catch(() => dispatch(loadFailed()));
};

const initialState = {
  slug: '',
  name: '',
  loading: false,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case 'RETRO_BEGIN_LOAD':
      return update(initialState, {
        loading: { $set: true },
      });
    case 'RETRO_SET':
      return update(state, {
        $merge: action.retro,
        loading: { $set: false },
      });
    case 'RETRO_FAIL_LOAD':
      return update(state, {
        loading: { $set: false },
      });
    default:
      return state;
  }
};
