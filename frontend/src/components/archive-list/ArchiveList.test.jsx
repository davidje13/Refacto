import React from 'react';
import { shallow } from 'enzyme';
import { makeRetro } from '../../test-helpers/dataFactories';

import { ArchiveList } from './ArchiveList';
import ArchiveLink from './ArchiveLink';

describe('ArchiveList', () => {
  it('displays a message if there are no archives', () => {
    const retro = makeRetro({ archives: [] });
    const dom = shallow(<ArchiveList retro={retro} />);

    expect(dom).toIncludeText('has no archives');
  });

  it('displays a list of archives', () => {
    const retro = makeRetro({
      slug: 'foo',
      archives: [
        { id: 'a1', created: 10 },
        { id: 'a2', created: 0 },
      ],
    });

    const dom = shallow(<ArchiveList retro={retro} />);

    expect(dom.find(ArchiveLink).at(0)).toHaveProp({
      retroSlug: 'foo',
      archiveId: 'a1',
      created: 10,
    });
    expect(dom.find(ArchiveLink).at(1)).toHaveProp({
      retroSlug: 'foo',
      archiveId: 'a2',
      created: 0,
    });
    expect(dom).not.toIncludeText('has no archives');
  });

  it('orders archives newest-to-oldest', () => {
    const retro = makeRetro({
      slug: 'foo',
      archives: [
        { id: 'a1', created: 100 },
        { id: 'a2', created: 0 },
        { id: 'a3', created: 10 },
      ],
    });

    const dom = shallow(<ArchiveList retro={retro} />);

    expect(dom.find(ArchiveLink).at(0)).toHaveProp({ archiveId: 'a1' });
    expect(dom.find(ArchiveLink).at(1)).toHaveProp({ archiveId: 'a3' });
    expect(dom.find(ArchiveLink).at(2)).toHaveProp({ archiveId: 'a2' });
  });
});
