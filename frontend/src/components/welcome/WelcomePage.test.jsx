import React from 'react';
import { StaticRouter } from 'react-router-dom';
import { render, fireEvent } from 'react-testing-library';
import mockElement from 'react-mock-element';
import { configService, userTokenTracker } from '../../api/api';
import { queries, css } from '../../test-helpers/queries';

import WelcomePage from './WelcomePage';

jest.mock('../../api/api');
jest.mock('../common/Header', () => mockElement('mock-header'));

describe('WelcomePage', () => {
  describe('signed out', () => {
    beforeEach(() => {
      userTokenTracker.set(null);
    });

    it('displays login buttons if configured', () => {
      configService.set({
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
      configService.set({
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
      const context = {};
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
