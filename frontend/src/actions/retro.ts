import { Spec } from 'json-immutability-helper';
import { MutableRetro, RetroItem } from 'refacto-entities';
import uuidv4 from '../helpers/uuidv4';

const IRRELEVANT_WHITESPACE = /[ \t\v]+/g;
const PADDING = /^[ \r\n]+|[ \r\n]+$/g;

export type RetroSpec = Spec<MutableRetro>;

function sanitiseInput(value: string): string {
  return value
    .replace(IRRELEVANT_WHITESPACE, ' ')
    .replace(PADDING, '');
}

function makeItem(category: string, message: string): RetroItem {
  return {
    id: uuidv4(),
    category,
    created: Date.now(),
    message,
    votes: 0,
    done: false,
  };
}

export const setRetroState = (delta: object): RetroSpec => ({
  state: { $merge: delta },
});

export const addRetroItem = (category: string, message: string): RetroSpec | undefined => {
  const sanitisedMessage = sanitiseInput(message);
  if (!sanitisedMessage) {
    return undefined;
  }
  return {
    data: { items: { $push: [makeItem(category, sanitisedMessage)] } },
  };
};

function updateItem(itemId: string, updater: Spec<RetroItem>): RetroSpec {
  return { data: { items: { $updateWhere: [['id', itemId], updater] } } };
}

export const editRetroItem = (itemId: string, message: string): RetroSpec | undefined => {
  const sanitisedMessage = sanitiseInput(message);
  if (!sanitisedMessage) {
    return undefined;
  }
  return updateItem(itemId, {
    message: { $set: sanitisedMessage },
  });
};

export const setRetroItemDone = (itemId: string, done: boolean): RetroSpec => updateItem(itemId, {
  done: { $set: done },
});

export const upvoteRetroItem = (itemId: string): RetroSpec => updateItem(itemId, {
  votes: { $add: 1 },
});

export const deleteRetroItem = (itemId: string): RetroSpec => ({
  data: { items: { $deleteWhere: ['id', itemId] } },
});

export const clearCovered = (): RetroSpec => ({
  state: { $set: {} },
  data: {
    items: {
      $seq: [
        { $deleteWhere: { key: 'category', not: 'action' } },
        { $deleteWhere: { key: 'done', equals: true } },
      ],
    },
  },
});
