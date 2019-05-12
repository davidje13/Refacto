import React from 'react';
import { mount } from 'enzyme';
import 'jest-enzyme';

import NotFoundPage from './NotFoundPage';

jest.mock('../common/Header', () => () => (<div />));

describe('NotFoundPage', () => {
  it('displays a message', () => {
    const dom = mount(<NotFoundPage />);
    expect(dom).toIncludeText('not found');
  });
});
