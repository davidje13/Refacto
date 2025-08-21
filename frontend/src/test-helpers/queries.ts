import type { Query } from 'flexible-testing-library-react';

export const css = (selector: string): Query => ({
  description: `matching CSS selector ${selector}`,
  queryAll: (container): NodeListOf<HTMLElement> =>
    container.querySelectorAll(selector),
});
