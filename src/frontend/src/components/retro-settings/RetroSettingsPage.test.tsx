import React from 'react';
import { Router } from 'wouter';
import staticLocationHook from 'wouter/static-location';
import { render } from '@testing-library/react';
import mockElement from 'react-mock-element';
import { makeRetro } from 'refacto-entities';
import {
  slugTracker,
  retroTokenTracker,
  retroTracker,
} from '../../api/api';
import type * as mockApiTypes from '../../api/__mocks__/api';
import { queries, placeholderText } from '../../test-helpers/queries';

import RetroSettingsPage from './RetroSettingsPage';

jest.mock('../../api/api');
jest.mock('../common/Header', () => mockElement('mock-header'));

const mockRetroTracker = retroTracker as any as typeof mockApiTypes.retroTracker;

describe('RetroSettingsPage', () => {
  beforeEach(() => {
    slugTracker.set('my-slug', 'r1');
    retroTokenTracker.set('r1', 'token-1');
    mockRetroTracker.setExpectedToken('token-1');
    mockRetroTracker.setServerData('r1', { retro: makeRetro() });
  });

  it('renders basic settings', () => {
    const dom = render((
      <Router hook={staticLocationHook()}>
        <RetroSettingsPage slug="my-slug" />
      </Router>
    ), { queries });

    expect(dom).toContainElementWith(placeholderText('retro name'));
  });
});
