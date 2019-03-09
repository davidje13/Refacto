import React from 'react';
import { mount } from 'enzyme';

import { RetroPage } from './RetroPage';
import Retro from './Retro';

jest.mock('./Retro');

describe('RetroPage', () => {
  it('renders a retro page', () => {
    const dom = mount(<RetroPage slug="abc" onAppear={() => {}} />);
    expect(dom.find(Retro)).toExist();
  });

  it('triggers a load request when displayed', () => {
    const onAppear = jest.fn().mockName('onAppear');
    mount(<RetroPage slug="abc" onAppear={onAppear} />);
    expect(onAppear).toHaveBeenCalledWith('abc');
  });
});
