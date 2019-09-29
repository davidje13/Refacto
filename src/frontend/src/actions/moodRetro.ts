import { Retro, RetroItem } from 'refacto-entities';
import { DispatchSpec } from '../api/SharedReducer';
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

function moodItem(item: RetroItem): boolean {
  return item.category !== 'action';
}

function pickNextItem(items: RetroItem[]): RetroItem | undefined {
  return autoFacilitate(items.filter(moodItem), ['happy', 'meh']);
}

function pickPreviousItem(items: RetroItem[]): RetroItem | undefined {
  const history = items
    .filter(moodItem)
    .filter((item) => item.doneTime > 0)
    .sort((a, b) => b.doneTime - a.doneTime);
  return history[0];
}

export const allItemsDoneCallback = (
  callback?: () => void,
) => (
  { items }: Retro<MoodRetroStateT>,
): null => {
  if (callback && !pickNextItem(items)) {
    callback();
  }
  return null;
};

export const setItemTimeout = (
  duration: number,
): DispatchSpec<Retro> => setRetroState({
  focusedItemTimeout: Date.now() + duration,
});

export const focusItem = (id: string | null): DispatchSpec<Retro> => [
  setRetroItemDone(id, false),
  setRetroState({ focusedItemId: id }),
];

export const switchFocus = (
  markPreviousDone: boolean,
  id: string | null,
) => (
  { state: { focusedItemId = null } }: Retro<MoodRetroStateT>,
): DispatchSpec<Retro> => [
  markPreviousDone ? setRetroItemDone(focusedItemId, true) : null,
  focusItem(id),
  setItemTimeout(INITIAL_TIMEOUT),
];

const focusNextItem = () => (
  { items }: Retro<MoodRetroStateT>,
): DispatchSpec<Retro> => {
  const next = pickNextItem(items);
  return focusItem(next ? next.id : null); // TODO TypeScript#16
};

const focusPreviousItem = () => (
  { items }: Retro<MoodRetroStateT>,
): DispatchSpec<Retro> => {
  const next = pickPreviousItem(items);
  return focusItem(next ? next.id : null); // TODO TypeScript#16
};

export const goNext = () => (
  { state: { focusedItemId = null } }: Retro<MoodRetroStateT>,
): DispatchSpec<Retro> => [
  setRetroItemDone(focusedItemId, true),
  focusNextItem(),
  setItemTimeout(INITIAL_TIMEOUT),
];

export const goPrevious = () => (
  { state: { focusedItemId = null } }: Retro<MoodRetroStateT>,
): DispatchSpec<Retro> => [
  setRetroItemDone(focusedItemId, false),
  focusPreviousItem(),
  setItemTimeout(0),
];
