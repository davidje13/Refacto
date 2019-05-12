import React from 'react';
import { mount } from 'enzyme';
import 'jest-enzyme';

import UnknownRetro from './UnknownRetro';

describe('UnknownRetro', () => {
  it('displays a message', () => {
    const dom = mount(<UnknownRetro />);
    expect(dom).toIncludeText('refresh the page');
  });
});
