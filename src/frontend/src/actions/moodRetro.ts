import type { Retro, RetroItem } from 'refacto-entities';
import type { DispatchSpec } from 'shared-reducer-frontend';
import {
  setRetroItemDone,
  setRetroState,
  addRetroItem,
} from './retro';
import autoFacilitate from './autoFacilitate';

export interface MoodRetroStateT {
  focusedItemId?: string | null;
  focusedItemTimeout?: number;
}

const INITIAL_TIMEOUT = (5 * 60 * 1000 + 999);

export const addRetroActionItem = addRetroItem.bind(null, 'action');

const moodItem = (group: string | undefined) => (item: RetroItem): boolean => (
  (!group || !item.group || item.group === group) &&
  item.category !== 'action'
);

function pickNextItem(
  group: string | undefined,
  items: RetroItem[],
): RetroItem | undefined {
  return autoFacilitate(items.filter(moodItem(group)), ['happy', 'meh']);
}

function pickPreviousItem(
  group: string | undefined,
  items: RetroItem[],
): RetroItem | undefined {
  const history = items
    .filter(moodItem(group))
    .filter((item) => item.doneTime > 0)
    .sort((a, b) => b.doneTime - a.doneTime);
  return history[0];
}

function getState<T>(retro: Retro<T>, group?: string): T {
  if (!group) {
    return retro.state;
  }
  return retro.groupStates[group] || ({} as T);
}

export const allItemsDoneCallback = (
  callback?: () => void,
): DispatchSpec<Retro> => [
  ({ items }: Retro<MoodRetroStateT>): null => {
    if (callback && !pickNextItem(undefined, items)) {
      callback();
    }
    return null;
  },
];

export const setItemTimeout = (
  group: string | undefined,
  duration: number,
): DispatchSpec<Retro> => setRetroState(group, {
  focusedItemTimeout: Date.now() + duration,
});

export const focusItem = (
  group: string | undefined,
  id: string | null,
): DispatchSpec<Retro> => [
  ...setRetroItemDone(id, false),
  ...setRetroState(group, { focusedItemId: id }),
];

export const switchFocus = (
  group: string | undefined,
  markPreviousDone: boolean,
  id: string | null,
): DispatchSpec<Retro> => [
  (retro): DispatchSpec<Retro> => {
    const { focusedItemId = null } = getState<MoodRetroStateT>(retro, group);

    return [
      ...((markPreviousDone && focusedItemId) ? setRetroItemDone(focusedItemId, true) : []),
      ...focusItem(group, id),
      ...setItemTimeout(group, INITIAL_TIMEOUT),
    ];
  },
];

const focusNextItem = (group: string | undefined) => (
  { items }: Retro<MoodRetroStateT>,
): DispatchSpec<Retro> => {
  const next = pickNextItem(group, items);
  return focusItem(group, next?.id ?? null);
};

const focusPreviousItem = (group: string | undefined) => (
  { items }: Retro<MoodRetroStateT>,
): DispatchSpec<Retro> => {
  const next = pickPreviousItem(group, items);
  return focusItem(group, next?.id ?? null);
};

export const goNext = (
  group: string | undefined,
  expectedFocusedItemId?: string,
): DispatchSpec<Retro> => [
  (retro): DispatchSpec<Retro> => {
    const { focusedItemId = null } = getState<MoodRetroStateT>(retro, group);

    if (expectedFocusedItemId && focusedItemId !== expectedFocusedItemId) {
      return [];
    }

    return [
      ...setRetroItemDone(focusedItemId, true),
      focusNextItem(group),
      ...setItemTimeout(group, INITIAL_TIMEOUT),
    ];
  },
];

export const goPrevious = (
  group: string | undefined,
  expectedFocusedItemId?: string,
): DispatchSpec<Retro> => [
  (retro): DispatchSpec<Retro> => {
    const { focusedItemId = null } = getState<MoodRetroStateT>(retro, group);

    if (expectedFocusedItemId && focusedItemId !== expectedFocusedItemId) {
      return [];
    }

    return [
      ...setRetroItemDone(focusedItemId, false),
      focusPreviousItem(group),
      ...setItemTimeout(group, 0),
    ];
  },
];
