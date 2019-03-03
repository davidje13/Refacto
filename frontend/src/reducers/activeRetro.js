import update from 'immutability-helper';

const API_BASE = '/api';

const IRRELEVANT_WHITESPACE = /[ \t\v]+/g;
const PADDING = /^[ \r\n]+|[ \r\n]+$/g;

function sanitiseInput(value) {
  return value
    .replace(IRRELEVANT_WHITESPACE, ' ')
    .replace(PADDING, '');
}

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

export const addItem = (category, message) => ({
  type: 'RETRO_ADD_ITEM',
  category,
  message,
});

export const editItem = (uuid, message) => ({
  type: 'RETRO_EDIT_ITEM',
  uuid,
  message,
});

export const deleteItem = (uuid) => ({
  type: 'RETRO_DELETE_ITEM',
  uuid,
});

export const setItemDone = (uuid, done) => ({
  type: 'RETRO_SET_ITEM_DONE',
  uuid,
  done,
});

export const upvoteItem = (uuid) => ({
  type: 'RETRO_UPVOTE_ITEM',
  uuid,
});

const initialState = {
  retro: {
    slug: '',
    name: '',
    format: '',
    state: {},
    items: [],
  },
  loading: false,
};

function makeItem(category, message) {
  return {
    uuid: `temp-local-uuid-${Date.now()}`,
    category,
    created: Date.now(),
    message,
    votes: 0,
    done: false,
  };
}

function itemIndexByUuid(state, uuid) {
  return state.retro.items.findIndex((item) => (item.uuid === uuid));
}

function updateItemByUuid(state, uuid, delta) {
  const index = itemIndexByUuid(state, uuid);
  if (index === -1) {
    return state;
  }

  return update(state, {
    retro: {
      items: {
        [index]: delta,
      },
    },
  });
}

function removeItemByUuid(state, uuid) {
  const index = itemIndexByUuid(state, uuid);
  if (index === -1) {
    return state;
  }

  return update(state, {
    retro: {
      items: { $splice: [[index, 1]] },
    },
  });
}

export default (state = initialState, action) => {
  switch (action.type) {
    case 'RETRO_BEGIN_LOAD':
      return update(initialState, {
        loading: { $set: true },
      });
    case 'RETRO_SET':
      return update(state, {
        retro: { $set: action.retro },
        loading: { $set: false },
      });
    case 'RETRO_FAIL_LOAD':
      return update(state, {
        loading: { $set: false },
      });
    case 'RETRO_ADD_ITEM': {
      const message = sanitiseInput(action.message);
      if (!message) {
        return state;
      }
      return update(state, {
        retro: {
          items: { $push: [makeItem(action.category, message)] },
        },
      });
    }
    case 'RETRO_EDIT_ITEM': {
      const message = sanitiseInput(action.message);
      if (!message) {
        return state;
      }
      return updateItemByUuid(state, action.uuid, {
        message: { $set: message },
      });
    }
    case 'RETRO_DELETE_ITEM':
      return removeItemByUuid(state, action.uuid);
    case 'RETRO_SET_ITEM_DONE':
      return updateItemByUuid(state, action.uuid, {
        done: { $set: action.done },
      });
    case 'RETRO_UPVOTE_ITEM':
      return updateItemByUuid(state, action.uuid, {
        votes: { $apply: (votes) => (votes + 1) },
      });
    default:
      return state;
  }
};
