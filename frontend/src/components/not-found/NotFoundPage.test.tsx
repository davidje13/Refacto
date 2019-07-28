import React from 'react';
import { render } from '@testing-library/react';
import mockElement from 'react-mock-element';
import { queries, textFragment } from '../../test-helpers/queries';

import NotFoundPage from './NotFoundPage';

jest.mock('../common/Header', () => mockElement('mock-header'));

describe('NotFoundPage', () => {
  it('displays a message', () => {
    const dom = render(<NotFoundPage />, { queries });
    expect(dom).toContainElementWith(textFragment('not found'));
  });
});
