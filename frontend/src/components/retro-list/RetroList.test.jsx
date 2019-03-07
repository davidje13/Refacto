import React from 'react';
import { shallow } from 'enzyme';

import { RetroList } from './RetroList';
import RetroLink from './RetroLink';

describe('RetroList', () => {
  it('displays a message if there are no retros', () => {
    const dom = shallow(<RetroList retros={[]} />);

    expect(dom).toIncludeText('do not have any retros');
  });

  it('displays a list of retros', () => {
    const retros = [
      { uuid: 'u1', slug: 'a', name: 'R1' },
      { uuid: 'u2', slug: 'b', name: 'R2' },
    ];

    const dom = shallow(<RetroList retros={retros} />);

    expect(dom.find(RetroLink).at(0)).toHaveProp({
      slug: 'a',
      name: 'R1',
    });
    expect(dom.find(RetroLink).at(1)).toHaveProp({
      slug: 'b',
      name: 'R2',
    });
    expect(dom).not.toIncludeText('do not have any retros');
  });
});
