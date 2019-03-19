import update from 'immutability-helper';

const API_BASE = '/api';

const setData = (retroSlug, archiveId, archive) => ({
  type: 'RETRO_ARCHIVE_SET',
  retroSlug,
  archiveId,
  archive,
});

const loadFailed = (retroSlug, archiveId) => ({
  type: 'RETRO_ARCHIVE_FAIL_LOAD',
  retroSlug,
  archiveId,
  error: 'Failed to load retro archive.',
});

export const loadArchive = (retroSlug, archiveId) => async (dispatch, getState) => {
  const retroData = getState().retros[retroSlug];
  const current = retroData.archives[archiveId];
  if (current) {
    return;
  }

  try {
    const archiveInfo = await global.fetch(`${API_BASE}/retros/${retroData.retro.id}/archives/${archiveId}`)
      .then((data) => data.json());

    dispatch(setData(retroSlug, archiveId, archiveInfo));
  } catch (e) {
    dispatch(loadFailed(retroSlug, archiveId));
  }
};

const initialState = {
  archive: null,
  error: null,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case 'RETRO_ARCHIVE_SET':
      return update(initialState, {
        archive: { $set: action.archive },
      });
    case 'RETRO_ARCHIVE_FAIL_LOAD':
      return update(initialState, {
        error: { $set: action.error },
      });
    default:
      return state;
  }
};
