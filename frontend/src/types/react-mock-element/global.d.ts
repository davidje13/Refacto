import 'react';

declare global {
  interface HTMLElement {
    mockProps: Record<string, unknown>;
  }
}
