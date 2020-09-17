import React from 'react';
import { render, textFragment } from 'flexible-testing-library-react';
import mockElement from 'react-mock-element';

import NotFoundPage from './NotFoundPage';

jest.mock('../common/Header', () => mockElement('mock-header'));

describe('NotFoundPage', () => {
  it('displays a message', () => {
    const dom = render(<NotFoundPage />);
    expect(dom).toContainElementWith(textFragment('not found'));
  });
});
