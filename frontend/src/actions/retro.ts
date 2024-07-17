import {
  type RetroItem,
  type UserProvidedRetroItemDetails,
} from '../shared/api-entities';
import { type RetroDispatchSpec } from '../api/RetroTracker';
import { type Spec } from '../api/reducer';

const IRRELEVANT_WHITESPACE = /[ \t\v]+/g;
const PADDING = /^[ \r\n]+|[ \r\n]+$/g;

function sanitiseInput(value: string): string {
  return value.replace(IRRELEVANT_WHITESPACE, ' ').replace(PADDING, '');
}

export const setRetroState = (
  group: string | undefined,
  delta: Record<string, unknown>,
): RetroDispatchSpec => {
  if (!group) {
    return [{ state: ['merge', delta] }];
  }
  return [{ groupStates: { [group]: ['merge', delta, {}] } }];
};

export const addRetroItem = (
  category: string,
  group: string | undefined,
  { message, ...rest }: Partial<UserProvidedRetroItemDetails>,
): RetroDispatchSpec => {
  const sanitisedMessage = sanitiseInput(message || '');
  if (!sanitisedMessage) {
    return [];
  }

  const item: RetroItem = {
    id: crypto.randomUUID(),
    category,
    group,
    created: Date.now(),
    message: sanitisedMessage,
    attachment: null,
    votes: 0,
    doneTime: 0,
    ...rest,
  };

  return [{ items: ['push', item] }];
};

function updateItem(
  itemId: string | null,
  updater: Spec<RetroItem>,
): RetroDispatchSpec {
  if (itemId === null) {
    return [];
  }
  return [{ items: ['updateWhere', ['id', itemId], updater] }];
}

export const editRetroItem = (
  itemId: string,
  { message, ...rest }: Partial<UserProvidedRetroItemDetails>,
): RetroDispatchSpec => {
  const merge: Partial<RetroItem> = { ...rest };
  if (message !== undefined) {
    const sanitisedMessage = sanitiseInput(message);
    if (!sanitisedMessage) {
      return [];
    }
    merge.message = sanitisedMessage;
  }
  return updateItem(itemId, ['merge', merge]);
};

export const setRetroItemDone = (
  itemId: string | null,
  done: boolean,
): RetroDispatchSpec =>
  updateItem(itemId, {
    doneTime: ['=', done ? Date.now() : 0],
  });

export const upvoteRetroItem = (itemId: string): RetroDispatchSpec =>
  updateItem(itemId, {
    votes: ['+', 1],
  });

export const deleteRetroItem = (itemId: string): RetroDispatchSpec => [
  { items: ['deleteWhere', ['id', itemId]] },
];

export const clearCovered = (): RetroDispatchSpec => [
  {
    state: ['=', {}],
    groupStates: ['=', {}],
    items: [
      'seq',
      ['deleteWhere', { key: 'category', not: 'action' }],
      ['deleteWhere', { key: 'doneTime', greaterThan: 0 }],
    ],
  },
];
