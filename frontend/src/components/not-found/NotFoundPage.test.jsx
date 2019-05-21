import React from 'react';
import { render } from 'react-testing-library';
import mockElement from 'react-mock-element';

import NotFoundPage from './NotFoundPage';

jest.mock('../common/Header', () => mockElement('mock-header'));

describe('NotFoundPage', () => {
  it('displays a message', () => {
    const { container } = render(<NotFoundPage />);
    expect(container).toHaveTextContent('not found');
  });
});
