import React from 'react';
import { shallow } from 'enzyme';
import MoodRetro from './MoodRetro';

const emptyRetro = {
  slug: 'my-slug',
  name: 'my retro',
  format: 'mood',
  state: {},
  items: [],
};

describe('MoodRetro', () => {
  it('renders without error', () => {
    const dom = shallow(<MoodRetro retro={emptyRetro} />);
    expect(dom).toExist();
  });
});
