import React from 'react';
import { render } from 'react-testing-library';
import mockElement from '../../test-helpers/mockElement';

import ArchiveList from './ArchiveList';

jest.mock('./ArchiveLink', () => mockElement('mock-archive-link'));

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

    const links = container.querySelectorAll('mock-archive-link');

    expect(links[0]).toHaveMockProps({
      retroSlug: 'foo',
      archiveId: 'a1',
      created: 10,
    });

    expect(links[1]).toHaveMockProps({
      retroSlug: 'foo',
      archiveId: 'a2',
      created: 0,
    });
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

    const links = container.querySelectorAll('mock-archive-link');

    expect(links[0]).toHaveMockProps('archiveId', 'a1');
    expect(links[1]).toHaveMockProps('archiveId', 'a3');
    expect(links[2]).toHaveMockProps('archiveId', 'a2');
  });
});
