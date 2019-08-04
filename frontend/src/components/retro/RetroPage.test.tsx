import React from 'react';
import { render } from '@testing-library/react';
import mockElement from 'react-mock-element';
import { makeRetro } from 'refacto-entities';
import { slugTracker, retroTokenTracker, retroTracker } from '../../api/api';
import * as mockApiTypes from '../../api/__mocks__/api';
import { queries, css } from '../../test-helpers/queries';

import RetroPage from './RetroPage';

jest.mock('../../api/api');
jest.mock('../retro-formats/RetroFormatPicker', () => mockElement('mock-retro-format-picker'));
jest.mock('../common/Header', () => mockElement('mock-header'));

const mockRetroTracker = retroTracker as any as typeof mockApiTypes.retroTracker;

describe('RetroPage', () => {
  const retroData = { retro: makeRetro() };

  beforeEach(() => {
    slugTracker.set('abc', 'r1');
    retroTokenTracker.set('r1', 'token-1');
    mockRetroTracker.setServerData('r1', retroData);
  });

  it('renders a retro page', () => {
    const dom = render(<RetroPage slug="abc" />, { queries });
    expect(dom).toContainElementWith(css('mock-retro-format-picker'));
  });
});
