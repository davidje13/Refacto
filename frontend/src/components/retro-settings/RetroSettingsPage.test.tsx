import { Router } from 'wouter';
import staticLocationHook from 'wouter/static-location';
import { act, render, placeholderText } from 'flexible-testing-library-react';
import mockElement from 'react-mock-element';
import { makeRetro } from '../../shared/api-entities';
import { nullDispatch } from '../../test-helpers/nullDispatch';

import { RetroSettingsPage } from './RetroSettingsPage';

jest.mock('../common/Header', () => ({ Header: mockElement('mock-header') }));

describe('RetroSettingsPage', () => {
  it('renders basic settings', async () => {
    const dom = render(
      <Router hook={staticLocationHook('/', { record: true })}>
        <RetroSettingsPage retro={makeRetro()} retroDispatch={nullDispatch} />
      </Router>,
    );
    await act(() => Promise.resolve()); // slug availability update

    expect(dom).toContainElementWith(placeholderText('retro name'));
  });
});
