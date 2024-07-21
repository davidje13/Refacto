import { useEvent } from './useEvent';

type Action<A extends readonly unknown[]> = (...args: A) => void;

export const useActionFactory =
  <Spec>(dispatch: ((spec: Spec) => void) | undefined) =>
  <A extends readonly unknown[]>(
    action: (...args: A) => Spec,
  ): Action<A> | undefined => {
    const fn = useEvent((...args: A) => dispatch?.(action(...args)));
    return dispatch ? fn : undefined;
  };
