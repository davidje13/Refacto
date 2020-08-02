import React from 'react';
import { Router } from 'wouter';
import staticLocationHook from 'wouter/static-location';
import { render } from '@testing-library/react';
import mockElement from 'react-mock-element';
import { makeRetro } from 'refacto-entities';
import { queries, placeholderText } from '../../test-helpers/queries';

import RetroSettingsPage from './RetroSettingsPage';

jest.mock('../common/Header', () => mockElement('mock-header'));

describe('RetroSettingsPage', () => {
  it('renders basic settings', () => {
    const dom = render((
      <Router hook={staticLocationHook('/', { record: true })}>
        <RetroSettingsPage retro={makeRetro()} retroDispatch={(): null => null} />
      </Router>
    ), { queries });

    expect(dom).toContainElementWith(placeholderText('retro name'));
  });
});
