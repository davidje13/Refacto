import React from 'react';
import { StaticRouter } from 'react-router-dom';
import { render, fireEvent } from 'react-testing-library';
import mockElement from '../../test-helpers/mockElement';
import { configService, userTokenTracker } from '../../api/api';

import WelcomePage from './WelcomePage';

jest.mock('../../api/api');
jest.mock('../common/Header', () => mockElement('fake-header'));

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
      const { container } = render((
        <StaticRouter location="/" context={context}>
          <WelcomePage />
        </StaticRouter>
      ));

      expect(container).toContainQuerySelector('.sso-google');
    });

    it('displays no login buttons if not configured', () => {
      configService.set({
        sso: {},
      });

      const context = {};
      const { container } = render((
        <StaticRouter location="/" context={context}>
          <WelcomePage />
        </StaticRouter>
      ));

      expect(container).not.toContainQuerySelector('.sso-google');
    });
  });

  describe('signed in', () => {
    beforeEach(() => {
      userTokenTracker.set('abc');
    });

    it('displays a link to create a new retro', () => {
      const context = {};
      const { container } = render((
        <StaticRouter location="/" context={context}>
          <WelcomePage />
        </StaticRouter>
      ));

      const link = container.querySelector('a.link-create');
      fireEvent.click(link);
      expect(context.url).toEqual('/create');
    });
  });
});
