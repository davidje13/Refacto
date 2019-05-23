import React from 'react';
import { render } from 'react-testing-library';
import mockElement from 'react-mock-element';
import { makeRetro } from '../../test-helpers/dataFactories';
import { slugTracker, retroTokenTracker, retroTracker } from '../../api/api';
import { queries, css } from '../../test-helpers/queries';

import RetroPage from './RetroPage';

jest.mock('../../api/api');
jest.mock('../retro-formats/RetroFormatPicker', () => mockElement('mock-retro-format-picker'));
jest.mock('../common/Header', () => mockElement('mock-header'));

describe('RetroPage', () => {
  const retroData = { retro: makeRetro() };

  beforeEach(() => {
    slugTracker.set('abc', 'r1');
    retroTokenTracker.set('r1', 'token-1');
    retroTracker.setServerData('r1', retroData);
  });

  it('renders a retro page', () => {
    const dom = render(<RetroPage slug="abc" />, { queries });
    expect(dom).toContainElementWith(css('mock-retro-format-picker'));
  });
});
