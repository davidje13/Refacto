import {
  waitForElement,
  getElementError,
  getMultipleElementsFoundError,
  queryAllByAltText,
  queryAllByDisplayValue,
  queryAllByLabelText,
  getAllByLabelText,
  queryAllByAttribute,
  queryAllByTestId,
  queryAllByText,
  queryAllByTitle,
} from '@testing-library/react';

export const css = (selector) => ({
  description: `matching CSS selector ${selector}`,
  queryAll: (container) => container.querySelectorAll(selector),
});

export const altText = (value, ...options) => ({
  description: `with the alt text ${value}`,
  queryAll: (container) => queryAllByAltText(container, value, ...options),
});

export const displayValue = (value, ...options) => ({
  description: `with the value ${value}`,
  queryAll: (container) => queryAllByDisplayValue(container, value, ...options),
});

export const labelText = (value, ...options) => ({
  description: `with the label text ${value}`,
  queryAll: (container) => queryAllByLabelText(container, value, ...options),
  getAll: (container) => getAllByLabelText(container, value, ...options),
});

export const attribute = (name, value, ...options) => ({
  description: `by [${name}=${value}]`,
  queryAll: (container) => queryAllByAttribute(name, container, value, ...options),
});

export const placeholderText = (value, ...options) => ({
  description: `with the placeholder text ${value}`,
  queryAll: (container) => queryAllByAttribute('placeholder', container, value, ...options),
});

export const role = attribute.bind('role');

export const testId = (id, ...options) => ({
  description: `with the test ID ${id}`,
  queryAll: (container) => queryAllByTestId(container, id, ...options),
});

export const text = (value, ...options) => ({
  description: `with the text '${value}'`,
  missingErrorDetail: 'This could be because the text is broken up by multiple elements. In this case, you can provide a function for your text matcher to make your matcher more flexible.',
  queryAll: (container) => queryAllByText(container, value, ...options),
});

export const textFragment = (value, ...options) => text(value, { exact: false, ...options });

export const title = (value, ...options) => ({
  description: `with the title ${value}`,
  queryAll: (container) => queryAllByTitle(container, value, ...options),
});


export const queryAllBy = (container, query) => {
  const elements = query.queryAll(container);
  if (!elements) {
    return [];
  }
  if (Array.isArray(elements)) {
    return elements;
  }
  return Array.from(elements);
};

export const queryBy = (container, query) => {
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

export const getAllBy = (container, query) => {
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

export const getBy = (container, query) => {
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

export const findAllBy = (container, query, waitOptions) => waitForElement(
  () => getAllBy(container, query),
  waitOptions,
);

export const findBy = (container, query, waitOptions) => waitForElement(
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
