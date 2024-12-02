import { Router } from 'wouter';
import staticLocationHook from 'wouter/static-location';
import { act, render } from 'flexible-testing-library-react';
import mockElement from 'react-mock-element';
import {
  configService,
  userTokenTracker,
  retroListTracker,
} from '../../api/api';
import type * as mockApiTypes from '../../api/__mocks__/api';
import { css } from '../../test-helpers/queries';

import { WelcomePage } from './WelcomePage';

jest.mock('../../api/api');
jest.mock('../common/Header', () => ({ Header: mockElement('mock-header') }));
jest.mock('./RetroList', () => ({ RetroList: mockElement('mock-retro-list') }));

const mockConfigService =
  configService as unknown as typeof mockApiTypes.configService;

const mockRetroListTracker =
  retroListTracker as unknown as typeof mockApiTypes.retroListTracker;

describe('WelcomePage', () => {
  beforeEach(() => {
    userTokenTracker.set('');
  });

  it('displays login buttons if configured', async () => {
    mockConfigService.set({
      sso: {
        google: { clientId: 'wheee', authUrl: 'http://example.com/wherever' },
      },
      giphy: false,
    });

    const dom = render(
      <Router hook={staticLocationHook('/', { record: true })}>
        <WelcomePage />
      </Router>,
    );
    await act(() => Promise.resolve()); // slug existence update

    expect(dom).toContainElementWith(css('.sso-google'));
  });

  it('displays no login buttons if not configured', async () => {
    mockConfigService.set({
      sso: {},
      giphy: false,
    });

    const dom = render(
      <Router hook={staticLocationHook('/', { record: true })}>
        <WelcomePage />
      </Router>,
    );
    await act(() => Promise.resolve()); // slug existence update

    expect(dom).not.toContainElementWith(css('.sso-google'));
  });

  it('loads data if logged in', async () => {
    userTokenTracker.set('foobar');
    mockRetroListTracker.set('foobar', {
      retros: [{ id: 'u1', slug: 'a', name: 'R1' }],
    });

    const dom = render(
      <Router hook={staticLocationHook('/', { record: true })}>
        <WelcomePage />
      </Router>,
    );
    await act(() => Promise.resolve()); // slug existence update

    const retroList = dom.getBy(css('mock-retro-list'));
    expect(retroList.mockProps['retros'].length).toEqual(1);
  });
});
