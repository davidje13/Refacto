import React from 'react';
import { StaticRouter } from 'react-router-dom';
import { mount, shallow } from 'enzyme';

import { WelcomePage } from './WelcomePage';

jest.mock('../common/Header', () => () => (<div />));

describe('WelcomePage', () => {
  it('renders without error', () => {
    const dom = shallow(<WelcomePage />);
    expect(dom).toExist();
  });

  it('links to the retro list page', () => {
    const context = {};
    const dom = mount((
      <StaticRouter location="/" context={context}>
        <WelcomePage />
      </StaticRouter>
    ));

    dom.find('a.link-retro-list').simulate('click', { button: 0 });
    expect(context.url).toEqual('/retros/');
  });
});
