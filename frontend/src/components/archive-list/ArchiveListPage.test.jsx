import React from 'react';
import { shallow } from 'enzyme';

import { ArchiveListPage } from './ArchiveListPage';
import ArchiveList from './ArchiveList';

describe('ArchiveListPage', () => {
  it('renders an archive list page', () => {
    const dom = shallow(<ArchiveListPage slug="my-slug" onAppear={() => {}} />);
    expect(dom.find(ArchiveList)).toExist();
  });

  it('triggers a load request when displayed', () => {
    const onAppear = jest.fn().mockName('onAppear');
    shallow(<ArchiveListPage slug="my-slug" onAppear={onAppear} />);
    expect(onAppear).toHaveBeenCalledWith('my-slug');
  });

  it('displays a loading message and no content while loading', () => {
    const dom = shallow(<ArchiveListPage slug="my-slug" onAppear={() => {}} loading />);
    expect(dom).toIncludeText('Loading');
    expect(dom.find(ArchiveList)).not.toExist();
  });
});
