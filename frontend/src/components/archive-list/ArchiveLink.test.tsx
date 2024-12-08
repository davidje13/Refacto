import { Router } from 'wouter';
import { memoryLocation } from 'wouter/memory-location';
import { render, fireEvent, text } from 'flexible-testing-library-react';
import { formatDateTime } from '../../time/formatters';
import { css } from '../../test-helpers/queries';

import { ArchiveLink } from './ArchiveLink';

describe('ArchiveLink', () => {
  it('links to the archive', () => {
    const location = memoryLocation({ path: '/', record: true });
    const dom = render(
      <Router hook={location.hook}>
        <ArchiveLink retroSlug="bar" archiveId="a1" created={0} />
      </Router>,
    );

    fireEvent.click(dom.getBy(css('.archive-link')));

    expect(location.history).toEqual(['/', '/retros/bar/archives/a1']);
  });

  it('displays the time of the archive', () => {
    const location = memoryLocation({ path: '/', record: true });
    const dom = render(
      <Router hook={location.hook}>
        <ArchiveLink retroSlug="bar" archiveId="a1" created={0} />
      </Router>,
    );

    // the formatted time can include special unicode spaces,
    // so we disable testing-library's default normaliser
    expect(dom).toContainElementWith(
      text(formatDateTime(0), { normalizer: (x) => x }),
    );
  });
});
