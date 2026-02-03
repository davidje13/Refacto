import { flushSync } from 'react-dom';

export function startViewTransition(
  animation: string | null | undefined,
  action: () => void,
) {
  if (animation && document.startViewTransition) {
    const viewTransition = document.startViewTransition({
      update: () => flushSync(action),
      types: [animation],
    });
    viewTransition.ready.catch(() => {}); // ignore errors (e.g. 'Skipped ViewTransition due to document being hidden')
  } else {
    action();
  }
}
