import React from 'react';
import { mount } from 'enzyme';
import renderDOM from '../../test-helpers/reactDom';

import RetroList from './RetroList';
import RetroLink from './RetroLink';

jest.mock('./RetroLink', () => () => (<div />));

describe('RetroList', () => {
  const emptyLabel = 'do not have any retros';

  it('displays a message if there are no retros', () => {
    const dom = renderDOM(<RetroList retros={[]} />);

    expect(dom.textContent).toContain(emptyLabel);
  });

  it('displays no message if there are retros', () => {
    const retros = [
      { id: 'u1', slug: 'a', name: 'R1' },
      { id: 'u2', slug: 'b', name: 'R2' },
    ];

    const dom = renderDOM(<RetroList retros={retros} />);

    expect(dom.textContent).not.toContain(emptyLabel);
  });

  it('displays a list of retros', () => {
    const retros = [
      { id: 'u1', slug: 'a', name: 'R1' },
      { id: 'u2', slug: 'b', name: 'R2' },
    ];

    const dom = mount(<RetroList retros={retros} />);

    expect(dom.find(RetroLink).at(0)).toHaveProp({
      slug: 'a',
      name: 'R1',
    });
    expect(dom.find(RetroLink).at(1)).toHaveProp({
      slug: 'b',
      name: 'R2',
    });
  });
});
