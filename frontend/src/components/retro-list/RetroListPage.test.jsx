import React from 'react';
import { mount } from 'enzyme';
import { retroListTracker } from '../../api/api';

import RetroListPage from './RetroListPage';
import RetroList from './RetroList';

jest.mock('../../api/api');
jest.mock('../common/Header', () => () => (<div />));
jest.mock('./RetroList', () => () => (<div />));

describe('RetroListPage', () => {
  it('loads data when displayed', () => {
    retroListTracker.setServerData({
      retros: [{ id: 'u1', slug: 'a', name: 'R1' }],
    });

    const dom = mount(<RetroListPage />);
    expect(dom.find(RetroList).prop('retros')).toHaveLength(1);
  });
});
