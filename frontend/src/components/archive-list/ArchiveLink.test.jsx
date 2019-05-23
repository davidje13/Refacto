import React from 'react';
import { StaticRouter } from 'react-router-dom';
import { render, fireEvent } from 'react-testing-library';
import { formatDateTime } from '../../time/formatters';
import { queries, css, text } from '../../test-helpers/queries';

import ArchiveLink from './ArchiveLink';

describe('ArchiveLink', () => {
  it('links to the archive', () => {
    const context = {};
    const dom = render((
      <StaticRouter location="/" context={context}>
        <ArchiveLink retroSlug="bar" archiveId="a1" created={0} />
      </StaticRouter>
    ), { queries });

    fireEvent.click(dom.getBy(css('.archive-link')));

    expect(context.url).toEqual('/retros/bar/archives/a1');
  });

  it('displays the time of the archive', () => {
    const dom = render((
      <StaticRouter location="/" context={{}}>
        <ArchiveLink retroSlug="bar" archiveId="a1" created={0} />
      </StaticRouter>
    ), { queries });

    expect(dom).toContainElementWith(text(formatDateTime(0)));
  });
});
