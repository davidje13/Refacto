import React from 'react';
import { shallow } from 'enzyme';

import { ArchivePage } from './ArchivePage';
import ArchivedRetro from './ArchivedRetro';

describe('ArchivePage', () => {
  it('renders a retro page', () => {
    const dom = shallow(<ArchivePage slug="abc" archiveId="def" onAppear={() => {}} />);
    expect(dom.find(ArchivedRetro)).toExist();
  });

  it('triggers a load request when displayed', () => {
    const onAppear = jest.fn().mockName('onAppear');
    shallow(<ArchivePage slug="abc" archiveId="def" onAppear={onAppear} />);
    expect(onAppear).toHaveBeenCalledWith('abc', 'def');
  });

  it('displays a loading message and no content while loading', () => {
    const dom = shallow((
      <ArchivePage
        slug="abc"
        archiveId="def"
        onAppear={() => {}}
        loading
      />
    ));
    expect(dom).toIncludeText('Loading');
    expect(dom.find(ArchivedRetro)).not.toExist();
  });
});
