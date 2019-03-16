import update from 'immutability-helper';
import subscriptionTrackerMiddleware from './subscriptionTrackerMiddleware';
import SlugTracker from './SlugTracker';
import archiveReducer from './archive';

const IRRELEVANT_WHITESPACE = /[ \t\v]+/g;
const PADDING = /^[ \r\n]+|[ \r\n]+$/g;

function sanitiseInput(value) {
  return value
    .replace(IRRELEVANT_WHITESPACE, ' ')
    .replace(PADDING, '');
}

function makeItem(category, message) {
  return {
    id: `temp-local-id-${Date.now()}`,
    category,
    created: Date.now(),
    message,
    votes: 0,
    done: false,
  };
}

const API_BASE = '/api';
const WS_BASE = `ws://${document.location.host}${API_BASE}`;

const slugTracker = new SlugTracker(API_BASE);

const setRetroData = (retroSlug, retro) => ({
  type: 'RETRO_SET',
  retroSlug,
  retro,
});

const setRetroError = (retroSlug) => ({
  type: 'RETRO_FAIL_LOAD',
  retroSlug,
  error: 'Failed to load retro.',
});

export const retroMiddleware = subscriptionTrackerMiddleware(
  async (slug) => {
    const { id } = await slugTracker.getSlugInfo(slug);
    return `${WS_BASE}/retros/${id}`;
  },
  setRetroData,
  setRetroError,
);

export const beginConsumingRetro = retroMiddleware.subscribe;
export const endConsumingRetro = retroMiddleware.unsubscribe;

export const setRetroState = (retroSlug, delta) => retroMiddleware.action(
  retroSlug,
  { state: { $merge: delta } },
);

export const addRetroItem = (retroSlug, category, message) => {
  const sanitisedMessage = sanitiseInput(message);
  if (!sanitisedMessage) {
    return { type: 'RETRO_ADD_ITEM_INVALID' };
  }
  return retroMiddleware.action(retroSlug, {
    data: { items: { $push: [makeItem(category, sanitisedMessage)] } },
  });
};

function updateItem(itemId, updater) {
  return { data: { items: { $updateWhere: ['id', itemId, updater] } } };
}

export const editRetroItem = (retroSlug, itemId, message) => {
  const sanitisedMessage = sanitiseInput(message);
  if (!sanitisedMessage) {
    return { type: 'RETRO_EDIT_ITEM_INVALID' };
  }
  return retroMiddleware.action(retroSlug, updateItem(itemId, {
    message: { $set: sanitisedMessage },
  }));
};

export const setRetroItemDone = (retroSlug, itemId, done) => retroMiddleware.action(
  retroSlug,
  updateItem(itemId, {
    done: { $set: done },
  }),
);

export const upvoteRetroItem = (retroSlug, itemId) => retroMiddleware.action(
  retroSlug,
  updateItem(itemId, {
    votes: { $add: 1 },
  }),
);

export const deleteRetroItem = (retroSlug, itemId) => retroMiddleware.action(
  retroSlug,
  { data: { items: { $deleteWhere: ['id', itemId] } } },
);

const initialState = {
  retro: null,
  archives: {},
  error: null,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case 'RETRO_SET':
      return update(state, {
        retro: { $set: action.retro },
        error: { $set: null },
      });
    case 'RETRO_FAIL_LOAD':
      return update(initialState, {
        error: { $set: action.error },
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

      return state;
  }
};
