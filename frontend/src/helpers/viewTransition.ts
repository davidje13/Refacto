import { flushSync } from 'react-dom';

export function startViewTransition(
  animation: string | null | undefined,
  action: () => void,
  previous?: Promise<void> | undefined,
): Promise<void> | undefined {
  if (previous) {
    // must wait for any previous transition to BEGIN before applying changes, else
    // multiple changes in the same frame might be lost (e.g. when changing settings)
    return previous.then(() => startViewTransition(animation, action));
  } else if (animation && document.startViewTransition) {
    const viewTransition = document.startViewTransition({
      update: () => flushSync(action),
      types: [animation],
    });
    return viewTransition.ready.catch(() => {}); // ignore errors (e.g. 'Skipped ViewTransition due to document being hidden')
  } else {
    action();
    return undefined;
  }
}
