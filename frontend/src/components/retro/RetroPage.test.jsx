import React from 'react';
import { render } from 'react-testing-library';
import { makeRetro } from '../../test-helpers/dataFactories';
import { slugTracker, retroTokenTracker, retroTracker } from '../../api/api';

import RetroPage from './RetroPage';

jest.mock('../../api/api');
jest.mock('../retro-formats/RetroFormatPicker', () => () => (<div className="retro-format-picker" />));
jest.mock('../common/Header', () => () => (<div />));

describe('RetroPage', () => {
  const retroData = { retro: makeRetro() };

  beforeEach(() => {
    slugTracker.set('abc', 'r1');
    retroTokenTracker.set('r1', 'token-1');
    retroTracker.setServerData('r1', retroData);
  });

  it('renders a retro page', () => {
    const { container } = render(<RetroPage slug="abc" />);
    expect(container).toContainQuerySelector('.retro-format-picker');
  });
});
