import React from 'react';
import { shallow } from 'enzyme';

import { RetroPage } from './RetroPage';
import Retro from './Retro';

describe('RetroPage', () => {
  it('renders a retro page', () => {
    const dom = shallow(<RetroPage slug="abc" onAppear={() => {}} />);
    expect(dom.find(Retro)).toExist();
  });

  it('triggers a load request when displayed', () => {
    const onAppear = jest.fn().mockName('onAppear');
    shallow(<RetroPage slug="abc" onAppear={onAppear} />);
    expect(onAppear).toHaveBeenCalledWith('abc');
  });

  it('displays a loading message and no content while loading', () => {
    const dom = shallow((
      <RetroPage
        slug="abc"
        onAppear={() => {}}
        loading
      />
    ));
    expect(dom).toIncludeText('Loading');
    expect(dom.find(Retro)).not.toExist();
  });
});
