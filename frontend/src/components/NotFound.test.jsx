import React from 'react';
import { shallow } from 'enzyme';
import NotFound from './NotFound';

describe('NotFound', () => {
  it('renders without crashing', () => {
    const dom = shallow(<NotFound />);
    expect(dom).toIncludeText('Not Found');
  });
});
