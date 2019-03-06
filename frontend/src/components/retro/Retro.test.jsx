import React from 'react';
import { shallow } from 'enzyme';
import { makeRetro } from '../../test-helpers/dataFactories';

import { Retro } from './Retro';

describe('Retro', () => {
  it('renders the retro name', () => {
    const retro = makeRetro({ name: 'my retro name' });
    const dom = shallow(<Retro retro={retro} />);

    expect(dom).toIncludeText('my retro name');
  });
});
