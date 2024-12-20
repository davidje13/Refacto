import {
  type Retro,
  type RetroItem,
  type UserProvidedRetroItemDetails,
} from '../shared/api-entities';
import { type Spec } from '../api/reducer';

const IRRELEVANT_WHITESPACE = /[ \t\v]+/g;
const PADDING = /^[ \r\n]+|[ \r\n]+$/g;

function sanitiseInput(value: string): string {
  return value.replace(IRRELEVANT_WHITESPACE, ' ').replace(PADDING, '');
}

export const setRetroState = (
  group: string | undefined,
  delta: Record<string, unknown>,
): Spec<Retro>[] => {
  if (!group) {
    return [{ state: ['merge', delta] }];
  }
  return [{ groupStates: { [group]: ['merge', delta, {}] } }];
};

export const addRetroItem = (
  category: string,
  group: string | undefined,
  { message, ...rest }: Partial<UserProvidedRetroItemDetails>,
): Spec<Retro>[] => {
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

  return [{ items: ['if', ['none', { id: ['=', item.id] }], ['push', item]] }];
};

const updateItem = (
  itemId: string,
  updater: Spec<RetroItem>,
): Spec<Retro>[] => [
  { items: ['update', ['first', { id: ['=', itemId] }], updater] },
];

export const editRetroItem = (
  itemId: string,
  { message, ...rest }: Partial<UserProvidedRetroItemDetails>,
): Spec<Retro>[] => {
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
  itemId: string,
  done: boolean,
): Spec<Retro>[] =>
  updateItem(itemId, { doneTime: ['=', done ? Date.now() : 0] });

export const upvoteRetroItem = (itemId: string): Spec<Retro>[] =>
  updateItem(itemId, { votes: ['+', 1] });

export const deleteRetroItem = (itemId: string): Spec<Retro>[] => [
  { items: ['delete', ['all', { id: ['=', itemId] }]] },
];

export const clearCovered = (preserveNotDone: boolean): Spec<Retro>[] => [
  {
    state: ['=', {}],
    groupStates: ['=', {}],
    items: [
      'delete',
      [
        'all',
        preserveNotDone
          ? { doneTime: ['>', 0] }
          : ['or', { category: ['!=', 'action'] }, { doneTime: ['>', 0] }],
      ],
    ],
  },
];
