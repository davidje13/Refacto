import update from 'immutability-helper';

const API_BASE = '/api';

const beginLoad = () => ({
  type: 'RETRO_ARCHIVE_BEGIN_LOAD',
});

const setData = (retro) => ({
  type: 'RETRO_ARCHIVE_SET',
  retro,
});

const loadFailed = () => ({
  type: 'RETRO_ARCHIVE_FAIL_LOAD',
  error: 'Failed to load retro archive.',
});

export const setCurrentArchive = (slug, archiveId) => async (dispatch) => {
  dispatch(beginLoad());

  try {
    const slugInfo = await fetch(`${API_BASE}/slugs/${slug}`)
      .then((data) => data.json());

    const archiveInfo = await fetch(`${API_BASE}/retros/${slugInfo.uuid}/archives/${archiveId}`)
      .then((data) => data.json());

    dispatch(setData(archiveInfo));
  } catch (e) {
    dispatch(loadFailed());
  }
};

const initialState = {
  archive: {
    uuid: '',
    created: 0,
    retro: {
      uuid: '',
      slug: '',
      name: '',
    },
    data: {
      format: '',
      items: [],
    },
  },
  loading: false,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case 'RETRO_ARCHIVE_BEGIN_LOAD':
      return update(initialState, {
        loading: { $set: true },
      });
    case 'RETRO_ARCHIVE_SET':
      return update(state, {
        archive: { $set: action.retro },
        loading: { $set: false },
      });
    case 'RETRO_ARCHIVE_FAIL_LOAD':
      return update(state, {
        loading: { $set: false },
      });
    default:
      return state;
  }
};
