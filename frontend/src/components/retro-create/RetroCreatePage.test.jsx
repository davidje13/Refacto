import React from 'react';
import { StaticRouter } from 'react-router-dom';
import { mount } from 'enzyme';
import 'jest-enzyme';

import RetroCreatePage from './RetroCreatePage';

jest.mock('../common/Header', () => () => (<div />));

describe('RetroCreatePage', () => {
  it('renders without error', () => {
    const context = {};

    mount((
      <StaticRouter location="/" context={context}>
        <RetroCreatePage />
      </StaticRouter>
    ));
  });
});
