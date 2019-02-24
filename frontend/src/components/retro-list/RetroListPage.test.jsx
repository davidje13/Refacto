import React from 'react';
import { shallow } from 'enzyme';

import { RetroListPage } from './RetroListPage';
import RetroList from './RetroList';

describe('RetroListPage', () => {
  it('renders a retro list page', () => {
    const dom = shallow(<RetroListPage reloadRetroList={() => {}} />);
    expect(dom.find(RetroList)).toExist();
  });

  it('triggers a load request when displayed', () => {
    const reloadRetroList = jest.fn();
    shallow(<RetroListPage reloadRetroList={reloadRetroList} />);
    expect(reloadRetroList).toHaveBeenCalled();
  });

  it('displays a loading message and no content while loading', () => {
    const dom = shallow((
      <RetroListPage
        loading
        reloadRetroList={() => {}}
      />
    ));
    expect(dom).toIncludeText('Loading');
    expect(dom.find(RetroList)).not.toExist();
  });
});
