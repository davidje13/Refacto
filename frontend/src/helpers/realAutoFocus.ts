// React intercepts autoFocus and performs its own focus() handling, which
// is problematic in some situations (e.g. in <dialog>). This helper can be
// used as a `ref` to set the real autofocus property in these cases.

export const realAutoFocus = (o: HTMLElement | null) => {
  if (o) {
    if (
      o.getAttribute('type') === 'date' &&
      matchMedia?.('(pointer: coarse)').matches
    ) {
      // avoid auto-focusing date fields on mobile, as it will make the date picker UI appear immediately
      return;
    }
    o.setAttribute('autofocus', '');
  }
};
