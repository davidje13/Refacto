import React from 'react';
import { Router } from 'wouter';
import staticLocationHook from 'wouter/static-location';
import { act, render, placeholderText } from 'flexible-testing-library-react';
import mockElement from 'react-mock-element';
import { makeRetro } from '../../shared/api-entities';

import RetroSettingsPage from './RetroSettingsPage';

jest.mock('../common/Header', () => mockElement('mock-header'));

describe('RetroSettingsPage', () => {
  it('renders basic settings', async () => {
    let dom;
    await act(async () => {
      dom = render(
        <Router hook={staticLocationHook('/', { record: true })}>
          <RetroSettingsPage
            retro={makeRetro()}
            retroDispatch={(): null => null}
          />
        </Router>,
      );
    });

    expect(dom).toContainElementWith(placeholderText('retro name'));
  });
});
