import React from 'react';
import { shallow } from 'enzyme';

import { UnknownRetro } from './UnknownRetro';

describe('UnknownRetro', () => {
  it('displays a message', () => {
    const dom = shallow(<UnknownRetro />);
    expect(dom).toIncludeText('refresh the page');
  });
});
