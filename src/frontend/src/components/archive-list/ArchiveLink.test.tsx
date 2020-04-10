import React from 'react';
import { Router } from 'wouter';
import { render, fireEvent } from '@testing-library/react';
import { formatDateTime } from '../../time/formatters';
import staticLocationHook from '../../test-helpers/staticLocationHook';
import { queries, css, text } from '../../test-helpers/queries';

import ArchiveLink from './ArchiveLink';

describe('ArchiveLink', () => {
  it('links to the archive', () => {
    const locationHook = staticLocationHook('/');
    const dom = render((
      <Router hook={locationHook}>
        <ArchiveLink retroSlug="bar" archiveId="a1" created={0} />
      </Router>
    ), { queries });

    fireEvent.click(dom.getBy(css('.archive-link')));

    expect(locationHook.locationHistory).toEqual(['/', '/retros/bar/archives/a1']);
  });

  it('displays the time of the archive', () => {
    const dom = render((
      <Router hook={staticLocationHook('/')}>
        <ArchiveLink retroSlug="bar" archiveId="a1" created={0} />
      </Router>
    ), { queries });

    expect(dom).toContainElementWith(text(formatDateTime(0)));
  });
});
