import React from 'react';
import { shallow } from 'enzyme';
import { makeRetro, makeArchive } from '../../test-helpers/dataFactories';

import { ArchivedRetro } from './ArchivedRetro';

describe('ArchivedRetro', () => {
  it('renders the retro name', () => {
    const retro = makeRetro({ name: 'my retro name' });
    const archive = makeArchive();
    const dom = shallow(<ArchivedRetro retro={retro} archive={archive} />);

    expect(dom).toIncludeText('my retro name');
  });
});
