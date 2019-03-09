import React from 'react';
import { mount } from 'enzyme';

import { ArchiveListPage } from './ArchiveListPage';
import ArchiveList from './ArchiveList';

jest.mock('./ArchiveList');

describe('ArchiveListPage', () => {
  it('renders an archive list page', () => {
    const dom = mount(<ArchiveListPage slug="my-slug" onAppear={() => {}} />);
    expect(dom.find(ArchiveList)).toExist();
  });

  it('triggers a load request when displayed', () => {
    const onAppear = jest.fn().mockName('onAppear');
    mount(<ArchiveListPage slug="my-slug" onAppear={onAppear} />);
    expect(onAppear).toHaveBeenCalledWith('my-slug');
  });
});
