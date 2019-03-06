import React from 'react';
import { shallow } from 'enzyme';

import { RetroListPage } from './RetroListPage';
import RetroList from './RetroList';

describe('RetroListPage', () => {
  it('renders a retro list page', () => {
    const dom = shallow(<RetroListPage onAppear={() => {}} />);
    expect(dom.find(RetroList)).toExist();
  });

  it('triggers a load request when displayed', () => {
    const onAppear = jest.fn().mockName('onAppear');
    shallow(<RetroListPage onAppear={onAppear} />);
    expect(onAppear).toHaveBeenCalled();
  });

  it('displays a loading message and no content while loading', () => {
    const dom = shallow(<RetroListPage onAppear={() => {}} loading />);
    expect(dom).toIncludeText('Loading');
    expect(dom.find(RetroList)).not.toExist();
  });
});
