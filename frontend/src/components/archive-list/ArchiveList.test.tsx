import { Router } from 'wouter';
import { memoryLocation } from 'wouter/memory-location';
import {
  fireEvent,
  render,
  textFragment,
} from 'flexible-testing-library-react';
import { formatDateTime } from '../../time/formatters';
import { css } from '../../test-helpers/queries';

import { ArchiveList } from './ArchiveList';

describe('ArchiveList', () => {
  it('displays a message if there are no archives', () => {
    const dom = render(<ArchiveList slug="foo" archives={[]} />);

    expect(dom).toContainElementWith(textFragment('has no archives'));
  });

  it('displays a list of archives', () => {
    const time1 = Date.parse('2021-02-03T04:05:06Z');
    const time2 = Date.parse('2000-01-01T00:00:00Z');
    const archives = [
      { id: 'a1', created: time1 },
      { id: 'a2', created: time2 },
    ];

    const dom = render(<ArchiveList slug="foo" archives={archives} />);

    const links = dom.getAllBy(css('.archive-link'));

    expect(links[0]).toHaveAttribute('href', '/retros/foo/archives/a1');
    expect(links[0]).toHaveTextContent(formatDateTime(time1));
    expect(links[1]).toHaveAttribute('href', '/retros/foo/archives/a2');
    expect(links[1]).toHaveTextContent(formatDateTime(time2));

    expect(dom).not.toContainElementWith(textFragment('has no archives'));
  });

  it('links to each archive', () => {
    const archives = [{ id: 'a1', created: 10 }];
    const location = memoryLocation({ path: '/', record: true });

    const dom = render(
      <Router hook={location.hook}>
        <ArchiveList slug="foo" archives={archives} />
      </Router>,
    );

    fireEvent.click(dom.getBy(css('.archive-link')));

    expect(location.history).toEqual(['/', '/retros/foo/archives/a1']);
  });

  it('orders archives newest-to-oldest', () => {
    const archives = [
      { id: 'a1', created: 100 },
      { id: 'a2', created: 0 },
      { id: 'a3', created: 10 },
    ];

    const dom = render(<ArchiveList slug="foo" archives={archives} />);

    const links = dom.getAllBy(css('.archive-link'));

    expect(links[0]).toHaveAttribute('href', '/retros/foo/archives/a1');
    expect(links[1]).toHaveAttribute('href', '/retros/foo/archives/a3');
    expect(links[2]).toHaveAttribute('href', '/retros/foo/archives/a2');
  });
});
