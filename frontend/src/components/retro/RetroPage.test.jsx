import React from 'react';
import { render } from 'react-testing-library';
import { makeRetro } from '../../test-helpers/dataFactories';
import mockElement from '../../test-helpers/mockElement';
import { slugTracker, retroTokenTracker, retroTracker } from '../../api/api';

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
    const { container } = render(<RetroPage slug="abc" />);
    expect(container).toContainQuerySelector('mock-retro-format-picker');
  });
});
