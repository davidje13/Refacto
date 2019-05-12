import React from 'react';
import { StaticRouter } from 'react-router-dom';
import { mount } from 'enzyme';
import 'jest-enzyme';

import RetroLink from './RetroLink';

describe('RetroLink', () => {
  it('links to the retro slug', () => {
    const context = {};
    const dom = mount((
      <StaticRouter location="/" context={context}>
        <RetroLink name="Foo" slug="bar" />
      </StaticRouter>
    ));

    expect(dom).toIncludeText('Foo');

    dom.find('div').simulate('click', { button: 0 });
    expect(context.url).toEqual('/retros/bar');
  });
});
