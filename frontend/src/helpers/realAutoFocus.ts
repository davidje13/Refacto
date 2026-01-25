// React intercepts autoFocus and performs its own focus() handling, which
// is problematic in some situations (e.g. in <dialog>). This helper can be
// used as a `ref` to set the real autofocus property in these cases.

export const realAutoFocus = (o: HTMLElement | null) =>
  o?.setAttribute('autofocus', '');
