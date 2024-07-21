import { type TitleHook } from '../hooks/env/useTitle';

export interface StaticTitleHook extends TitleHook {
  currentTitle: string;
}

export function staticTitleHook(initialTitle = ''): StaticTitleHook {
  const hook: StaticTitleHook = (newTitle: string) => {
    hook.currentTitle = newTitle;
  };
  hook.currentTitle = initialTitle;
  return hook;
}
