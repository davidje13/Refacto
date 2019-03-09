import React from 'react';
import { mount } from 'enzyme';

import { RetroListPage } from './RetroListPage';
import RetroList from './RetroList';

jest.mock('./RetroList');

describe('RetroListPage', () => {
  it('renders a retro list page', () => {
    const dom = mount(<RetroListPage onAppear={() => {}} />);
    expect(dom.find(RetroList)).toExist();
  });

  it('triggers a load request when displayed', () => {
    const onAppear = jest.fn().mockName('onAppear');
    mount(<RetroListPage onAppear={onAppear} />);
    expect(onAppear).toHaveBeenCalled();
  });
});
