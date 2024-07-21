import { useEvent } from './useEvent';

type KeyboardEventLike = Pick<
  KeyboardEvent,
  | 'preventDefault'
  | 'stopPropagation'
  | 'ctrlKey'
  | 'metaKey'
  | 'altKey'
  | 'shiftKey'
  | 'repeat'
  | 'key'
>;

interface OptionsT {
  allowRepeat?: boolean;
}

export function fullKeyName(e: KeyboardEventLike): string {
  let result = e.key;
  if (e.ctrlKey) {
    result = `Ctrl-${result}`;
  }
  if (e.metaKey) {
    result = `Meta-${result}`;
  }
  if (e.altKey) {
    result = `Alt-${result}`;
  }
  if (e.shiftKey) {
    result = `Shift-${result}`;
  }
  return result;
}

export const useKeyHandler = (
  keyMaps: Record<string, (() => void) | undefined>,
  { allowRepeat = true }: OptionsT = {},
) =>
  useEvent((e: KeyboardEventLike) => {
    const fn = keyMaps[fullKeyName(e)];
    if (fn) {
      e.preventDefault();
      e.stopPropagation();
      if (allowRepeat || !e.repeat) {
        fn();
      }
    }
  });
