import React from 'react';
import { shallow } from 'enzyme';
import { Retro } from './Retro';

describe('Retro', () => {
  it('renders the retro name', () => {
    const dom = shallow(<Retro name="foo" />);
    expect(dom).toIncludeText('foo');
  });
});
