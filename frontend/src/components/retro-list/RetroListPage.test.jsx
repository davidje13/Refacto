import React from 'react';
import { mount } from 'enzyme';
import { userTokenTracker, retroListTracker } from '../../api/api';
import 'jest-enzyme';

import RetroListPage from './RetroListPage';
import RetroList from './RetroList';

jest.mock('../../api/api');
jest.mock('../common/Header', () => () => (<div />));
jest.mock('./RetroList', () => () => (<div />));

describe('RetroListPage', () => {
  beforeEach(() => {
    userTokenTracker.set('foobar');
    retroListTracker.set('foobar', {
      retros: [{ id: 'u1', slug: 'a', name: 'R1' }],
    });
  });

  it('loads data when displayed', () => {
    const dom = mount(<RetroListPage />);
    expect(dom.find(RetroList).prop('retros')).toHaveLength(1);
  });
});
