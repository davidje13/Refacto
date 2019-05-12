import React from 'react';
import { render } from 'react-testing-library';

import ArchiveList from './ArchiveList';

/* eslint-disable-next-line react/prop-types */
jest.mock('./ArchiveLink', () => ({ retroSlug, archiveId, created }) => (
  <div
    className="mock-link"
    data-retro-slug={retroSlug}
    data-archive-id={archiveId}
    data-created={created}
  />
));

describe('ArchiveList', () => {
  it('displays a message if there are no archives', () => {
    const { container } = render((
      <ArchiveList slug="foo" archives={[]} />
    ));

    expect(container.textContent).toContain('has no archives');
  });

  it('displays no message if there are archives', () => {
    const archives = [
      { id: 'a1', created: 10 },
      { id: 'a2', created: 0 },
    ];
    const { container } = render((
      <ArchiveList slug="foo" archives={archives} />
    ));

    expect(container.textContent).not.toContain('has no archives');
  });

  it('displays a list of archives', () => {
    const archives = [
      { id: 'a1', created: 10 },
      { id: 'a2', created: 0 },
    ];

    const { container } = render((
      <ArchiveList slug="foo" archives={archives} />
    ));

    const links = container.querySelectorAll('.mock-link');

    expect(links[0]).toHaveAttribute('data-retro-slug', 'foo');
    expect(links[0]).toHaveAttribute('data-archive-id', 'a1');
    expect(links[0]).toHaveAttribute('data-created', '10');

    expect(links[1]).toHaveAttribute('data-retro-slug', 'foo');
    expect(links[1]).toHaveAttribute('data-archive-id', 'a2');
    expect(links[1]).toHaveAttribute('data-created', '0');
  });

  it('orders archives newest-to-oldest', () => {
    const archives = [
      { id: 'a1', created: 100 },
      { id: 'a2', created: 0 },
      { id: 'a3', created: 10 },
    ];

    const { container } = render((
      <ArchiveList slug="foo" archives={archives} />
    ));

    const links = container.querySelectorAll('.mock-link');

    expect(links[0]).toHaveAttribute('data-archive-id', 'a1');
    expect(links[1]).toHaveAttribute('data-archive-id', 'a3');
    expect(links[2]).toHaveAttribute('data-archive-id', 'a2');
  });
});
