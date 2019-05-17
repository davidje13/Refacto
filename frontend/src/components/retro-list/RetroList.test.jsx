import React from 'react';
import { render } from 'react-testing-library';
import mockElement from '../../test-helpers/mockElement';

import RetroList from './RetroList';

jest.mock('./RetroLink', () => mockElement('fake-retro-link'));

describe('RetroList', () => {
  const emptyLabel = 'do not have any retros';

  it('displays a message if there are no retros', () => {
    const { container } = render(<RetroList retros={[]} />);

    expect(container.textContent).toContain(emptyLabel);
  });

  it('displays no message if there are retros', () => {
    const retros = [
      { id: 'u1', slug: 'a', name: 'R1' },
      { id: 'u2', slug: 'b', name: 'R2' },
    ];

    const { container } = render(<RetroList retros={retros} />);

    expect(container.textContent).not.toContain(emptyLabel);
  });

  it('displays a list of retros', () => {
    const retros = [
      { id: 'u1', slug: 'a', name: 'R1' },
      { id: 'u2', slug: 'b', name: 'R2' },
    ];

    const { container } = render(<RetroList retros={retros} />);

    const links = container.querySelectorAll('fake-retro-link');

    expect(links[0]).toHaveMockProps({ slug: 'a', name: 'R1' });
    expect(links[1]).toHaveMockProps({ slug: 'b', name: 'R2' });
  });
});
