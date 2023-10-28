import { Router } from 'wouter';
import staticLocationHook from 'wouter/static-location';
import { render, fireEvent } from 'flexible-testing-library-react';
import mockElement from 'react-mock-element';
import { configService, userTokenTracker } from '../../api/api';
import type * as mockApiTypes from '../../api/__mocks__/api';
import { css } from '../../test-helpers/queries';

import { WelcomePage } from './WelcomePage';

jest.mock('../../api/api');
jest.mock('../common/Header', () => ({ Header: mockElement('mock-header') }));

const mockUserTokenTracker =
  userTokenTracker as unknown as typeof mockApiTypes.userTokenTracker;
const mockConfigService =
  configService as unknown as typeof mockApiTypes.configService;

describe('WelcomePage', () => {
  describe('signed out', () => {
    beforeEach(() => {
      mockUserTokenTracker.set(null);
    });

    it('displays login buttons if configured', () => {
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

      expect(dom).toContainElementWith(css('.sso-google'));
    });

    it('displays no login buttons if not configured', () => {
      mockConfigService.set({
        sso: {},
        giphy: false,
      });

      const dom = render(
        <Router hook={staticLocationHook('/', { record: true })}>
          <WelcomePage />
        </Router>,
      );

      expect(dom).not.toContainElementWith(css('.sso-google'));
    });
  });

  describe('signed in', () => {
    beforeEach(() => {
      userTokenTracker.set('abc');
    });

    it('displays a link to create a new retro', () => {
      const locationHook = staticLocationHook('/', { record: true });
      const dom = render(
        <Router hook={locationHook}>
          <WelcomePage />
        </Router>,
      );

      const link = dom.getBy(css('a.link-create'));
      fireEvent.click(link);
      expect(locationHook.history).toEqual(['/', '/create']);
    });
  });
});
