import { Spec } from 'json-immutability-helper';
import { Retro, RetroItem } from 'refacto-entities';
import { DispatchSpec } from '../api/SharedReducer';
import uuidv4 from '../helpers/uuidv4';

const IRRELEVANT_WHITESPACE = /[ \t\v]+/g;
const PADDING = /^[ \r\n]+|[ \r\n]+$/g;

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
    doneTime: 0,
  };
}

export const setRetroState = (delta: object): DispatchSpec<Retro> => ({
  state: { $merge: delta },
});

export const addRetroItem = (
  category: string,
  message: string,
): DispatchSpec<Retro> => {
  const sanitisedMessage = sanitiseInput(message);
  if (!sanitisedMessage) {
    return null;
  }
  return {
    items: { $push: [makeItem(category, sanitisedMessage)] },
  };
};

function updateItem(
  itemId: string | null,
  updater: Spec<RetroItem>,
): DispatchSpec<Retro> {
  if (itemId === null) {
    return null;
  }
  return { items: { $updateWhere: [['id', itemId], updater] } };
}

export const editRetroItem = (
  itemId: string,
  message: string,
): DispatchSpec<Retro> => {
  const sanitisedMessage = sanitiseInput(message);
  if (!sanitisedMessage) {
    return null;
  }
  return updateItem(itemId, {
    message: { $set: sanitisedMessage },
  });
};

export const setRetroItemDone = (
  itemId: string | null,
  done: boolean,
): DispatchSpec<Retro> => updateItem(itemId, {
  doneTime: { $set: done ? Date.now() : 0 },
});

export const upvoteRetroItem = (
  itemId: string,
): DispatchSpec<Retro> => updateItem(itemId, {
  votes: { $add: 1 },
});

export const deleteRetroItem = (
  itemId: string,
): DispatchSpec<Retro> => ({
  items: { $deleteWhere: ['id', itemId] },
});

export const clearCovered = (): DispatchSpec<Retro> => ({
  state: { $set: {} },
  items: {
    $seq: [
      { $deleteWhere: { key: 'category', not: 'action' } },
      { $deleteWhere: { key: 'doneTime', greaterThan: 0 } },
    ],
  },
});
