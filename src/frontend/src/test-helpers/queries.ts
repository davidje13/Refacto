import {
  waitForElement,
  getElementError,
  queryAllByAltText,
  queryAllByDisplayValue,
  queryAllByLabelText,
  getAllByLabelText,
  queryAllByAttribute,
  queryAllByTestId,
  queryAllByText,
  queryAllByTitle,
  waitForOptions,
} from '@testing-library/react';

type HTMLElementList = NodeListOf<HTMLElement> | HTMLElement[];

export interface Query {
  description: string;
  multipleErrorDetail?: string;
  missingErrorDetail?: string;
  queryAll: (container: HTMLElement) => HTMLElementList;
  getAll?: (container: HTMLElement) => HTMLElementList;
}

function getMultipleElementsFoundError(
  message: string,
  container: HTMLElement,
): Error {
  return getElementError(
    `${message}\n\n(If this is intentional, then use \`getAllBy\`, \`queryAllBy\` or \`findAllBy\`).`,
    container,
  );
}

export const css = (selector: string): Query => ({
  description: `matching CSS selector ${selector}`,
  queryAll: (container): NodeListOf<HTMLElement> => container.querySelectorAll(selector),
});

export const altText = (value: string, ...options: any[]): Query => ({
  description: `with the alt text ${value}`,
  queryAll: (container): HTMLElement[] => queryAllByAltText(container, value, ...options),
});

export const displayValue = (value: string, ...options: any[]): Query => ({
  description: `with the value ${value}`,
  queryAll: (container): HTMLElement[] => queryAllByDisplayValue(container, value, ...options),
});

export const labelText = (value: string, ...options: any[]): Query => ({
  description: `with the label text ${value}`,
  queryAll: (container): HTMLElement[] => queryAllByLabelText(container, value, ...options),
  getAll: (container): HTMLElement[] => getAllByLabelText(container, value, ...options),
});

export const attribute = (name: string, value: string, ...options: any[]): Query => ({
  description: `by [${name}=${value}]`,
  queryAll: (container): HTMLElement[] => queryAllByAttribute(name, container, value, ...options),
});

export const placeholderText = (value: string, ...options: any[]): Query => ({
  description: `with the placeholder text ${value}`,
  queryAll: (container): HTMLElement[] => queryAllByAttribute('placeholder', container, value, ...options),
});

export const role = attribute.bind('role');

export const testId = (id: string, ...options: any[]): Query => ({
  description: `with the test ID ${id}`,
  queryAll: (container): HTMLElement[] => queryAllByTestId(container, id, ...options),
});

export const text = (value: string, ...options: any[]): Query => ({
  description: `with the text '${value}'`,
  missingErrorDetail: [
    'This could be because the text is broken up by multiple elements. ',
    'In this case, you can provide a function for your text matcher ',
    'to make your matcher more flexible.',
  ].join(''),
  queryAll: (container): HTMLElement[] => queryAllByText(container, value, ...options),
});

export const textFragment = (
  value: string,
  ...options: any[]
): Query => text(value, { exact: false, ...options });

export const title = (value: string, ...options: any[]): Query => ({
  description: `with the title ${value}`,
  queryAll: (container): HTMLElement[] => queryAllByTitle(container, value, ...options),
});


export const queryAllBy = (
  container: HTMLElement,
  query: Query,
): HTMLElement[] => {
  const elements = query.queryAll(container);
  if (!elements) {
    return [];
  }
  if (Array.isArray(elements)) {
    return elements;
  }
  return Array.from(elements);
};

export const queryBy = (
  container: HTMLElement,
  query: Query,
): HTMLElement | null => {
  const elements = queryAllBy(container, query);
  if (elements.length > 1) {
    throw getMultipleElementsFoundError(
      [
        `Found multiple elements ${query.description}.`,
        query.multipleErrorDetail,
      ].filter((p) => p).join(' '),
      container,
    );
  }
  return elements[0] || null;
};

export const getAllBy = (
  container: HTMLElement,
  query: Query,
): HTMLElement[] => {
  const elements = queryAllBy(container, query);
  if (!elements.length) {
    throw getElementError(
      [
        `Unable to find any element ${query.description}.`,
        query.missingErrorDetail,
      ].filter((p) => p).join(' '),
      container,
    );
  }
  return elements;
};

export const getBy = (
  container: HTMLElement,
  query: Query,
): HTMLElement => {
  const element = queryBy(container, query);
  if (!element) {
    throw getElementError(
      [
        `Unable to find an element ${query.description}.`,
        query.missingErrorDetail,
      ].filter((p) => p).join(' '),
      container,
    );
  }
  return element;
};

export const findAllBy = (
  container: HTMLElement,
  query: Query,
  waitOptions: waitForOptions,
): Promise<HTMLElement[]> => waitForElement(
  () => getAllBy(container, query),
  waitOptions,
);

export const findBy = (
  container: HTMLElement,
  query: Query,
  waitOptions: waitForOptions,
): Promise<HTMLElement> => waitForElement(
  () => getBy(container, query),
  waitOptions,
);

export const queries = {
  findAllBy,
  findBy,
  getAllBy,
  getBy,
  queryAllBy,
  queryBy,
};
