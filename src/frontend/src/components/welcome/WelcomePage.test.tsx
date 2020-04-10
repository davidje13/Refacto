import React from 'react';
import { Router } from 'wouter';
import { render, fireEvent } from '@testing-library/react';
import mockElement from 'react-mock-element';
import { configService, userTokenTracker } from '../../api/api';
import type * as mockApiTypes from '../../api/__mocks__/api';
import staticLocationHook from '../../test-helpers/staticLocationHook';
import { queries, css } from '../../test-helpers/queries';

import WelcomePage from './WelcomePage';

jest.mock('../../api/api');
jest.mock('../common/Header', () => mockElement('mock-header'));

const mockUserTokenTracker = userTokenTracker as any as typeof mockApiTypes.userTokenTracker;
const mockConfigService = configService as any as typeof mockApiTypes.configService;

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

      const dom = render((
        <Router hook={staticLocationHook()}>
          <WelcomePage />
        </Router>
      ), { queries });

      expect(dom).toContainElementWith(css('.sso-google'));
    });

    it('displays no login buttons if not configured', () => {
      mockConfigService.set({
        sso: {},
        giphy: false,
      });

      const dom = render((
        <Router hook={staticLocationHook()}>
          <WelcomePage />
        </Router>
      ), { queries });

      expect(dom).not.toContainElementWith(css('.sso-google'));
    });
  });

  describe('signed in', () => {
    beforeEach(() => {
      userTokenTracker.set('abc');
    });

    it('displays a link to create a new retro', () => {
      const locationHook = staticLocationHook();
      const dom = render((
        <Router hook={locationHook}>
          <WelcomePage />
        </Router>
      ), { queries });

      const link = dom.getBy(css('a.link-create'));
      fireEvent.click(link);
      expect(locationHook.locationHistory).toEqual(['/', '/create']);
    });
  });
});
