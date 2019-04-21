import React from 'react';
import { StaticRouter } from 'react-router-dom';
import { mount } from 'enzyme';
import { configService, userTokenTracker } from '../../api/api';

import WelcomePage from './WelcomePage';

jest.mock('../../api/api');
jest.mock('../common/Header', () => () => (<div />));

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
      const dom = mount((
        <StaticRouter location="/" context={context}>
          <WelcomePage />
        </StaticRouter>
      ));

      expect(dom.find('.sso-google').length).toEqual(1);
    });

    it('displays no login buttons if not configured', () => {
      configService.set({
        sso: {},
      });

      const context = {};
      const dom = mount((
        <StaticRouter location="/" context={context}>
          <WelcomePage />
        </StaticRouter>
      ));

      expect(dom.find('.sso-google').length).toEqual(0);
    });
  });

  describe('signed in', () => {
    beforeEach(() => {
      userTokenTracker.set('abc');
    });

    it('displays a link to create a new retro', () => {
      const context = {};
      const dom = mount((
        <StaticRouter location="/" context={context}>
          <WelcomePage />
        </StaticRouter>
      ));

      dom.find('a.link-create').simulate('click', { button: 0 });
      expect(context.url).toEqual('/create');
    });
  });
});
