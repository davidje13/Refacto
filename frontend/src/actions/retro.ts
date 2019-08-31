import { Spec } from 'json-immutability-helper';
import { Retro, RetroItem, UserProvidedRetroItemDetails } from 'refacto-entities';
import { DispatchSpec } from '../api/SharedReducer';
import uuidv4 from '../helpers/uuidv4';

const IRRELEVANT_WHITESPACE = /[ \t\v]+/g;
const PADDING = /^[ \r\n]+|[ \r\n]+$/g;

function sanitiseInput(value: string): string {
  return value
    .replace(IRRELEVANT_WHITESPACE, ' ')
    .replace(PADDING, '');
}

export const setRetroState = (delta: object): DispatchSpec<Retro> => ({
  state: { $merge: delta },
});

export const addRetroItem = (
  category: string,
  { message, ...rest }: Partial<UserProvidedRetroItemDetails>,
): DispatchSpec<Retro> => {
  const sanitisedMessage = sanitiseInput(message || '');
  if (!sanitisedMessage) {
    return null;
  }

  const item: RetroItem = {
    id: uuidv4(),
    category,
    created: Date.now(),
    message: sanitisedMessage,
    attachment: null,
    votes: 0,
    doneTime: 0,
    ...rest,
  };

  return {
    items: { $push: [item] },
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
  { message, ...rest }: Partial<UserProvidedRetroItemDetails>,
): DispatchSpec<Retro> => {
  const merge: Partial<RetroItem> = { ...rest };
  if (message !== undefined) {
    const sanitisedMessage = sanitiseInput(message);
    if (!sanitisedMessage) {
      return null;
    }
    merge.message = sanitisedMessage;
  }
  return updateItem(itemId, { $merge: merge });
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
