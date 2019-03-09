import React from 'react';
import { StaticRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { mount, shallow } from 'enzyme';

import { WelcomePage } from './WelcomePage';

describe('WelcomePage', () => {
  it('renders without error', () => {
    const dom = shallow(<WelcomePage />);
    expect(dom).toExist();
  });

  it('links to the retro list page', () => {
    const context = {};
    const dom = mount((
      <HelmetProvider>
        <StaticRouter location="/" context={context}>
          <WelcomePage />
        </StaticRouter>
      </HelmetProvider>
    ));

    dom.find('a.link-retro-list').simulate('click', { button: 0 });
    expect(context.url).toEqual('/retros/');
  });
});
