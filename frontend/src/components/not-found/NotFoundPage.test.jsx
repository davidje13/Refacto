import React from 'react';
import { shallow } from 'enzyme';

import { NotFoundPage } from './NotFoundPage';

describe('NotFoundPage', () => {
  it('displays a message', () => {
    const dom = shallow(<NotFoundPage />);
    expect(dom).toIncludeText('not found');
  });
});
