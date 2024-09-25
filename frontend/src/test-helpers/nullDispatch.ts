import type { Dispatch } from 'shared-reducer/frontend';

export const nullDispatch: Dispatch<never, unknown> = Object.assign(
  () => null,
  { sync: () => Promise.reject() },
);
