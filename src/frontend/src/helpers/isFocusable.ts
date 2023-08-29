const INPUT_ELEMENTS = ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'];

// This is an approximation for detecting whether an element can be focused.
// It does not check every eventuality, but covers the most common cases.

export default function isFocusable(e: unknown): boolean {
  if (!(e instanceof HTMLElement)) {
    return false;
  }
  if ((e as any).disabled) {
    return false;
  }
  return (
    e.tabIndex >= 0 ||
    INPUT_ELEMENTS.includes(e.tagName) ||
    e.hasAttribute('href')
  );
}
