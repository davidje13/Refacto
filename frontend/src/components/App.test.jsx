import React from 'react';
import { shallow } from 'enzyme';

import { App } from './App';

describe('App', () => {
  it('renders without error', () => {
    const dom = shallow(<App />);
    expect(dom).toExist();
  });
});
