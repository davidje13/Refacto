import React from 'react';
import { StaticRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import mockElement from 'react-mock-element';

import RetroCreatePage from './RetroCreatePage';

jest.mock('../common/Header', () => mockElement('mock-header'));

describe('RetroCreatePage', () => {
  it('renders without error', () => {
    const context = {};

    render((
      <StaticRouter location="/" context={context}>
        <RetroCreatePage />
      </StaticRouter>
    ));
  });
});
