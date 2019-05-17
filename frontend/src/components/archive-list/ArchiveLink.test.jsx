import React from 'react';
import { StaticRouter } from 'react-router-dom';
import { render, fireEvent } from 'react-testing-library';
import { formatDateTime } from '../../time/formatters';

import ArchiveLink from './ArchiveLink';

describe('ArchiveLink', () => {
  it('links to the archive', () => {
    const context = {};
    const { container } = render((
      <StaticRouter location="/" context={context}>
        <ArchiveLink retroSlug="bar" archiveId="a1" created={0} />
      </StaticRouter>
    ));

    fireEvent.click(container.querySelector('.archive-link'));

    expect(context.url).toEqual('/retros/bar/archives/a1');
  });

  it('displays the time of the archive', () => {
    const { container } = render((
      <StaticRouter location="/" context={{}}>
        <ArchiveLink retroSlug="bar" archiveId="a1" created={0} />
      </StaticRouter>
    ));

    expect(container).toHaveTextContent(formatDateTime(0));
  });
});
