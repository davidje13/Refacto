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
        { uuid: 'a1', created: 10 },
        { uuid: 'a2', created: 0 },
      ],
    });

    const dom = shallow(<ArchiveList retro={retro} />);

    expect(dom.find(ArchiveLink).at(0)).toHaveProp({
      slug: 'foo',
      uuid: 'a1',
      created: 10,
    });
    expect(dom.find(ArchiveLink).at(1)).toHaveProp({
      slug: 'foo',
      uuid: 'a2',
      created: 0,
    });
    expect(dom).not.toIncludeText('has no archives');
  });

  it('orders archives newest-to-oldest', () => {
    const retro = makeRetro({
      slug: 'foo',
      archives: [
        { uuid: 'a1', created: 100 },
        { uuid: 'a2', created: 0 },
        { uuid: 'a3', created: 10 },
      ],
    });

    const dom = shallow(<ArchiveList retro={retro} />);

    expect(dom.find(ArchiveLink).at(0)).toHaveProp({ uuid: 'a1' });
    expect(dom.find(ArchiveLink).at(1)).toHaveProp({ uuid: 'a3' });
    expect(dom.find(ArchiveLink).at(2)).toHaveProp({ uuid: 'a2' });
  });
});
