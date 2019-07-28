import React from 'react';
import { StaticRouter, StaticRouterContext } from 'react-router-dom';
import { render, fireEvent } from '@testing-library/react';
import mockElement from 'react-mock-element';
import { configService, userTokenTracker } from '../../api/api';
import * as mockApiTypes from '../../api/__mocks__/api';
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
      });

      const context = {};
      const dom = render((
        <StaticRouter location="/" context={context}>
          <WelcomePage />
        </StaticRouter>
      ), { queries });

      expect(dom).toContainElementWith(css('.sso-google'));
    });

    it('displays no login buttons if not configured', () => {
      mockConfigService.set({
        sso: {},
      });

      const context = {};
      const dom = render((
        <StaticRouter location="/" context={context}>
          <WelcomePage />
        </StaticRouter>
      ), { queries });

      expect(dom).not.toContainElementWith(css('.sso-google'));
    });
  });

  describe('signed in', () => {
    beforeEach(() => {
      userTokenTracker.set('abc');
    });

    it('displays a link to create a new retro', () => {
      const context: StaticRouterContext = {};
      const dom = render((
        <StaticRouter location="/" context={context}>
          <WelcomePage />
        </StaticRouter>
      ), { queries });

      const link = dom.getBy(css('a.link-create'));
      fireEvent.click(link);
      expect(context.url).toEqual('/create');
    });
  });
});
