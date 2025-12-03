import { useEvent } from './useEvent';

export const useActionFactory =
  <Spec>(dispatch: ((spec: Spec) => void) | undefined) =>
  <A extends any[]>(
    action: (...args: A) => Spec,
  ): ((...args: A) => void) | undefined => {
    const fn = useEvent((...args: A) => dispatch?.(action(...args)));
    return dispatch ? fn : undefined;
  };
