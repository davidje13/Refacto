import React from 'react';
import { Router } from 'wouter';
import staticLocationHook from 'wouter/static-location';
import { render, fireEvent } from '@testing-library/react';
import { formatDateTime } from '../../time/formatters';
import { queries, css, text } from '../../test-helpers/queries';

import ArchiveLink from './ArchiveLink';

describe('ArchiveLink', () => {
  it('links to the archive', () => {
    const locationHook = staticLocationHook('/', { record: true });
    const dom = render((
      <Router hook={locationHook}>
        <ArchiveLink retroSlug="bar" archiveId="a1" created={0} />
      </Router>
    ), { queries });

    fireEvent.click(dom.getBy(css('.archive-link')));

    expect(locationHook.history).toEqual(['/', '/retros/bar/archives/a1']);
  });

  it('displays the time of the archive', () => {
    const dom = render((
      <Router hook={staticLocationHook('/', { record: true })}>
        <ArchiveLink retroSlug="bar" archiveId="a1" created={0} />
      </Router>
    ), { queries });

    expect(dom).toContainElementWith(text(formatDateTime(0)));
  });
});
