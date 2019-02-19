import React from 'react';
import { shallow } from 'enzyme';
import { RetroPage } from './RetroPage';
import Retro from './Retro';

describe('RetroPage', () => {
  it('renders a retro page', () => {
    const dom = shallow((
      <RetroPage
        slug="abc"
        setActiveRetro={() => {}}
      />
    ));
    expect(dom.find(Retro)).toExist();
  });

  it('triggers a load request when displayed', () => {
    const setActiveRetro = jest.fn();
    shallow((
      <RetroPage
        slug="abc"
        setActiveRetro={setActiveRetro}
      />
    ));
    expect(setActiveRetro).toHaveBeenCalledWith('abc');
  });

  it('displays a loading message and no content while loading', () => {
    const dom = shallow((
      <RetroPage
        loading
        slug="abc"
        setActiveRetro={() => {}}
      />
    ));
    expect(dom).toIncludeText('Loading');
    expect(dom.find(Retro)).not.toExist();
  });
});
