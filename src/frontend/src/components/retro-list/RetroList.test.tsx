import React from 'react';
import { render, textFragment } from 'flexible-testing-library-react';
import mockElement from 'react-mock-element';
import { css } from '../../test-helpers/queries';

import RetroList from './RetroList';

jest.mock('./RetroLink', () => mockElement('mock-retro-link'));

describe('RetroList', () => {
  const emptyLabel = 'do not have any retros';

  it('displays a message if there are no retros', () => {
    const dom = render(<RetroList retros={[]} />);

    expect(dom).toContainElementWith(textFragment(emptyLabel));
  });

  it('displays no message if there are retros', () => {
    const retros = [
      { id: 'u1', slug: 'a', name: 'R1' },
      { id: 'u2', slug: 'b', name: 'R2' },
    ];

    const dom = render(<RetroList retros={retros} />);

    expect(dom).not.toContainElementWith(textFragment(emptyLabel));
  });

  it('displays a list of retros', () => {
    const retros = [
      { id: 'u1', slug: 'a', name: 'R1' },
      { id: 'u2', slug: 'b', name: 'R2' },
    ];

    const dom = render(<RetroList retros={retros} />);

    const links = dom.getAllBy(css('mock-retro-link'));

    expect(links[0]?.mockProps).toEqual({ slug: 'a', name: 'R1' });
    expect(links[1]?.mockProps).toEqual({ slug: 'b', name: 'R2' });
  });
});
