import React from 'react';
import { shallow } from 'enzyme';
import { makeArchive, makeRetroSummary } from '../../test-helpers/dataFactories';

import { ArchivedRetro } from './ArchivedRetro';

describe('ArchivedRetro', () => {
  it('renders the retro name', () => {
    const archive = makeArchive({
      retro: makeRetroSummary({ name: 'my retro name' }),
    });
    const dom = shallow(<ArchivedRetro archive={archive} />);

    expect(dom).toIncludeText('my retro name');
  });
});
