import React from 'react';
import { render } from 'react-testing-library';

import NotFoundPage from './NotFoundPage';

jest.mock('../common/Header', () => () => (<div />));

describe('NotFoundPage', () => {
  it('displays a message', () => {
    const { container } = render(<NotFoundPage />);
    expect(container).toHaveTextContent('not found');
  });
});
