import { Router } from 'wouter';
import { memoryLocation } from 'wouter/memory-location';
import { act, render } from 'flexible-testing-library-react';
import mockElement from 'react-mock-element';
import type { ClientConfig } from '../../shared/api-entities';
import { userDataTracker, retroListTracker } from '../../api/api';
import { ConfigProvider } from '../../hooks/data/useConfig';
import { css } from '../../test-helpers/queries';

import { WelcomePage } from './WelcomePage';

jest.mock('./RetroList', () => ({ RetroList: mockElement('mock-retro-list') }));

const BASE_CONFIG: ClientConfig = {
  sso: {},
  giphy: false,
  passwordRequirements: { minLength: 8, maxLength: 512 },
  maxApiKeys: 5,
  deleteRetroDelay: 1000,
};

describe('WelcomePage', () => {
  beforeEach(() => {
    userDataTracker.set(null);
  });

  it('displays login buttons if configured', async () => {
    const config: ClientConfig = {
      ...BASE_CONFIG,
      sso: {
        google: { clientId: 'wheee', authUrl: 'http://example.com/wherever' },
      },
    };
    const location = memoryLocation({ path: '/', record: true });
    const dom = render(
      <ConfigProvider value={config}>
        <Router hook={location.hook}>
          <WelcomePage />
        </Router>
      </ConfigProvider>,
    );
    await act(() => Promise.resolve()); // slug existence update

    expect(dom).toContainElementWith(css('.sso-google'));
  });

  it('displays no login buttons if not configured', async () => {
    const location = memoryLocation({ path: '/', record: true });
    const config: ClientConfig = { ...BASE_CONFIG, sso: {} };

    const dom = render(
      <ConfigProvider value={config}>
        <Router hook={location.hook}>
          <WelcomePage />
        </Router>
      </ConfigProvider>,
    );
    await act(() => Promise.resolve()); // slug existence update

    expect(dom).not.toContainElementWith(css('.sso-google'));
  });

  it('loads data if logged in', async () => {
    const location = memoryLocation({ path: '/', record: true });
    userDataTracker.set({ userToken: 'foobar' });
    jest
      .spyOn(retroListTracker, 'get')
      .mockResolvedValue({ retros: [{ id: 'u1', slug: 'a', name: 'R1' }] });

    const dom = render(
      <Router hook={location.hook}>
        <WelcomePage />
      </Router>,
    );
    await act(() => Promise.resolve()); // slug existence update

    const retroList = dom.getBy(css('mock-retro-list'));
    expect(retroList.mockProps['retros'].length).toEqual(1);
    expect(retroListTracker.get).toHaveBeenCalledWith(
      'foobar',
      expect.anything(),
    );
  });
});
