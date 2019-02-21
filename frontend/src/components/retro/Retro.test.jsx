import React from 'react';
import { shallow } from 'enzyme';
import { Retro } from './Retro';
import MoodRetro from './mood/MoodRetro';
import UnknownRetro from './unknown/UnknownRetro';

function makeRetro(details) {
  return Object.assign({
    slug: 'my-slug',
    name: 'my retro name',
    format: 'my-format',
    state: {},
    items: [],
  }, details);
}

describe('Retro', () => {
  it('renders the retro name', () => {
    const retro = makeRetro({ name: 'my retro name' });
    const dom = shallow(<Retro retro={retro} />);

    expect(dom).toIncludeText('my retro name');
  });

  it('forwards properties to the specified retro format', () => {
    const retro = makeRetro({ format: 'mood' });
    const dom = shallow(<Retro retro={retro} />);

    const format = dom.find(MoodRetro);
    expect(format).toExist();
    expect(format).toHaveProp({ retro });
  });

  it('displays UnknownRetro for unknown formats', () => {
    const retro = makeRetro({ format: 'nope' });
    const dom = shallow(<Retro retro={retro} />);

    expect(dom.find(UnknownRetro)).toExist();
    expect(dom.find(MoodRetro)).not.toExist();
  });
});
