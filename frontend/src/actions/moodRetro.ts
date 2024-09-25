import { type Retro, type RetroItem } from '../shared/api-entities';
import { type RetroDispatchSpec } from '../api/RetroTracker';
import { setRetroItemDone, setRetroState, addRetroItem } from './retro';
import { autoFacilitate } from './autoFacilitate';
import { type Spec } from '../api/reducer';
import { type Condition } from 'json-immutability-helper';

export interface MoodRetroStateT {
  focusedItemId?: string | null;
  focusedItemTimeout?: number;
}

type NextIDPicker = (
  group: string | undefined,
  state: Retro<MoodRetroStateT>,
  focusedItemId: string | null,
) => string | null;

const INITIAL_TIMEOUT = 5 * 60 * 1000 + 999;

export const addRetroActionItem = addRetroItem.bind(null, 'action');

const moodItem =
  (group: string | undefined) =>
  (item: RetroItem): boolean =>
    (!group || !item.group || item.group === group) &&
    item.category !== 'action';

const pickNextItem: NextIDPicker = (group, { items }, currentItemID) =>
  autoFacilitate(items.filter(moodItem(group)), ['happy', 'meh'], currentItemID)
    ?.id ?? null;

const pickPreviousItem: NextIDPicker = (group, { items }, currentItemID) => {
  const history = items
    .filter(moodItem(group))
    .filter((item) => item.doneTime > 0 && item.id !== currentItemID)
    .sort((a, b) => b.doneTime - a.doneTime);
  return history[0]?.id ?? null;
};

function getState<T>(
  group: string | undefined,
  retro: Retro<T>,
): T | Record<string, never> {
  if (!group) {
    return retro.state;
  }
  return retro.groupStates[group] || {};
}

export const allItemsDoneCallback = (
  callback?: () => void,
): RetroDispatchSpec => [
  (state: Retro<MoodRetroStateT>) => {
    if (callback && !pickNextItem(undefined, state, null)) {
      callback();
    }
    return [];
  },
];

export const setItemTimeout = (
  group: string | undefined,
  duration: number,
): Spec<Retro>[] =>
  setRetroState(group, { focusedItemTimeout: Date.now() + duration });

export const switchFocus = (
  group: string | undefined,
  nextIDPicker: NextIDPicker,
  {
    expectCurrentId,
    setCurrentDone = false,
    timeout = INITIAL_TIMEOUT,
  }: {
    expectCurrentId?: string | undefined;
    setCurrentDone?: boolean | undefined;
    timeout?: number | undefined;
  } = {},
): RetroDispatchSpec => [
  (retro): Spec<Retro>[] => {
    const { focusedItemId = null } = getState<MoodRetroStateT>(group, retro);
    if (expectCurrentId && focusedItemId !== expectCurrentId) {
      return [];
    }

    const id = nextIDPicker(group, retro, focusedItemId);
    const actions: Spec<Retro> = [
      'seq',
      ...(focusedItemId ? setRetroItemDone(focusedItemId, setCurrentDone) : []),
      ...(id ? setRetroItemDone(id, false) : []),
      ...setRetroState(group, {
        focusedItemId: id,
        focusedItemTimeout: Date.now() + timeout,
      }),
    ];
    const condition: Condition<Retro> = group
      ? { groupStates: { [group]: { focusedItemId: ['~=', focusedItemId] } } }
      : { state: { focusedItemId: ['~=', focusedItemId] } };
    return [['if', condition, actions]];
  },
];

export const goNext = (group: string | undefined, expectCurrentId?: string) =>
  switchFocus(group, pickNextItem, { expectCurrentId, setCurrentDone: true });

export const goPrevious = (
  group: string | undefined,
  expectCurrentId?: string,
) => switchFocus(group, pickPreviousItem, { expectCurrentId, timeout: 0 });
