import update from 'immutability-helper';
import './immutabilityHelperAddons';

const IRRELEVANT_WHITESPACE = /[ \t\v]+/g;
const PADDING = /^[ \r\n]+|[ \r\n]+$/g;

function sanitiseInput(value) {
  return value
    .replace(IRRELEVANT_WHITESPACE, ' ')
    .replace(PADDING, '');
}

export const addRetroItem = (retroSlug, category, message) => {
  const sanitisedMessage = sanitiseInput(message);
  return {
    type: sanitisedMessage ? 'RETRO_ADD_ITEM' : 'RETRO_ADD_ITEM_INVALID',
    retroSlug,
    category,
    message: sanitisedMessage,
  };
};

export const editRetroItem = (retroSlug, itemId, message) => {
  const sanitisedMessage = sanitiseInput(message);
  return {
    type: sanitisedMessage ? 'RETRO_EDIT_ITEM' : 'RETRO_EDIT_ITEM_INVALID',
    retroSlug,
    itemId,
    message: sanitisedMessage,
  };
};

export const setRetroItemDone = (retroSlug, itemId, done) => ({
  type: 'RETRO_SET_ITEM_DONE',
  retroSlug,
  itemId,
  done,
});

export const upvoteRetroItem = (retroSlug, itemId) => ({
  type: 'RETRO_UPVOTE_ITEM',
  retroSlug,
  itemId,
});

export const deleteRetroItem = (retroSlug, itemId) => ({
  type: 'RETRO_DELETE_ITEM',
  retroSlug,
  itemId,
});

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

function itemReducer(state, action) {
  switch (action.type) {
    case 'RETRO_EDIT_ITEM':
      return update(state, {
        message: { $set: action.message },
      });
    case 'RETRO_SET_ITEM_DONE':
      return update(state, {
        done: { $set: action.done },
      });
    case 'RETRO_UPVOTE_ITEM':
      return update(state, {
        votes: { $apply: (votes) => (votes + 1) },
      });
    case 'RETRO_DELETE_ITEM':
      return undefined;
    default:
      return state;
  }
}

const initialState = [];

export default (state = initialState, action) => {
  switch (action.type) {
    case 'RETRO_ADD_ITEM':
      return update(state, {
        $push: [makeItem(action.category, action.message)],
      });
    default:
      if (action.itemId) {
        return update(state, {
          $applyToFirst: [
            (item) => (item.id === action.itemId),
            (itemState) => itemReducer(itemState, action),
          ],
        });
      }
      return state;
  }
};
