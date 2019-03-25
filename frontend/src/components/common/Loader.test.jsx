import React from 'react';
import { mount } from 'enzyme';

import Loader from './Loader';

const Component = () => (<div />);

describe('Loader', () => {
  it('displays a loading message and no content while loading', () => {
    const dom = mount(<Loader Component={Component} loading />);

    expect(dom).toIncludeText('Loading');
    expect(dom.find(Component)).not.toExist();
  });

  it('displays custom loading messages', () => {
    const dom = mount((
      <Loader Component={Component} loading loadingMessage="foobar" />
    ));

    expect(dom).toIncludeText('foobar');
  });

  it('displays content and no loading message when loaded', () => {
    const dom = mount(<Loader Component={Component} custom="foo" />);

    expect(dom).not.toIncludeText('Loading');
    expect(dom.find(Component)).toExist();
    expect(dom.find(Component)).toHaveProp({ custom: 'foo' });
  });
});
