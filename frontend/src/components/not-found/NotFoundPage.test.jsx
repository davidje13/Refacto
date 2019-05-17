import React from 'react';
import { render } from 'react-testing-library';
import mockElement from '../../test-helpers/mockElement';

import NotFoundPage from './NotFoundPage';

jest.mock('../common/Header', () => mockElement('fake-header'));

describe('NotFoundPage', () => {
  it('displays a message', () => {
    const { container } = render(<NotFoundPage />);
    expect(container).toHaveTextContent('not found');
  });
});
