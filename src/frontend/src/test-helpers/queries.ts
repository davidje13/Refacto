import type { Query } from 'flexible-testing-library-react';

// eslint-disable-next-line import/prefer-default-export
export const css = (selector: string): Query => ({
  description: `matching CSS selector ${selector}`,
  queryAll: (container): NodeListOf<HTMLElement> => container.querySelectorAll(selector),
});
