import React from 'react';
import { render } from 'react-testing-library';

import RetroList from './RetroList';

/* eslint-disable-next-line react/prop-types */
jest.mock('./RetroLink', () => ({ name, slug }) => (
  <div
    className="mock-link"
    data-name={name}
    data-slug={slug}
  />
));

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

    const links = container.querySelectorAll('.mock-link');

    expect(links[0]).toHaveAttribute('data-slug', 'a');
    expect(links[0]).toHaveAttribute('data-name', 'R1');
    expect(links[1]).toHaveAttribute('data-slug', 'b');
    expect(links[1]).toHaveAttribute('data-name', 'R2');
  });
});
