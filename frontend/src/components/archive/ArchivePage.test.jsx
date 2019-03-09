import React from 'react';
import { mount } from 'enzyme';

import { ArchivePage } from './ArchivePage';
import ArchivedRetro from './ArchivedRetro';

jest.mock('./ArchivedRetro');

describe('ArchivePage', () => {
  it('renders a retro page', () => {
    const dom = mount(<ArchivePage slug="abc" archiveId="def" onAppear={() => {}} />);
    expect(dom.find(ArchivedRetro)).toExist();
  });

  it('triggers a load request when displayed', () => {
    const onAppear = jest.fn().mockName('onAppear');
    mount(<ArchivePage slug="abc" archiveId="def" onAppear={onAppear} />);
    expect(onAppear).toHaveBeenCalledWith('abc', 'def');
  });
});
