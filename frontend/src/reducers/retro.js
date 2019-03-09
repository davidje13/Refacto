import update from 'immutability-helper';
import retroItemsReducer from './retroItems';
import archiveReducer from './archive';

const API_BASE = '/api';

const setData = (retroSlug, retro) => ({
  type: 'RETRO_SET',
  retroSlug,
  retro,
});

const loadFailed = (retroSlug) => ({
  type: 'RETRO_FAIL_LOAD',
  retroSlug,
  error: 'Failed to load retro.',
});

export const beginConsumingRetro = (retroSlug) => async (dispatch, getState) => {
  const current = getState().retros[retroSlug];
  if (current) {
    return;
  }

  try {
    const slugInfo = await global.fetch(`${API_BASE}/slugs/${retroSlug}`)
      .then((data) => data.json());

    const retroInfo = await global.fetch(`${API_BASE}/retros/${slugInfo.id}`)
      .then((data) => data.json());

    dispatch(setData(retroSlug, retroInfo));
  } catch (e) {
    dispatch(loadFailed(retroSlug));
  }
};

export const endConsumingRetro = (retroSlug) => ({
  type: 'RETRO_CONSUME_END',
  retroSlug,
});

export const setRetroState = (retroSlug, delta) => ({
  type: 'RETRO_SET_STATE',
  retroSlug,
  delta,
});

const initialState = {
  retro: {
    id: '',
    slug: '',
    name: '',
    state: {},
    data: {
      format: '',
      items: [],
    },
    archives: [],
  },
  archives: {},
  error: null,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case 'RETRO_SET':
      return update(initialState, {
        retro: { $set: action.retro },
      });
    case 'RETRO_FAIL_LOAD':
      return update(initialState, {
        error: { $set: action.error },
      });
    case 'RETRO_SET_STATE':
      return update(state, {
        retro: {
          state: { $merge: action.delta },
        },
      });
    default:
      if (action.archiveId) {
        return update(state, {
          archives: {
            [action.archiveId]: {
              $apply: (archiveState) => archiveReducer(archiveState, action),
            },
          },
        });
      }

      return update(state, {
        retro: {
          data: {
            items: { $apply: (itemsState) => retroItemsReducer(itemsState, action) },
          },
        },
      });
  }
};
