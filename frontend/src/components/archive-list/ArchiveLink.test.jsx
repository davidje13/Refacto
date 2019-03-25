import React from 'react';
import { StaticRouter } from 'react-router-dom';
import { mount } from 'enzyme';
import { formatDateTime } from '../../time/formatters';

import ArchiveLink from './ArchiveLink';

describe('ArchiveLink', () => {
  it('links to the archive', () => {
    const context = {};
    const dom = mount((
      <StaticRouter location="/" context={context}>
        <ArchiveLink retroSlug="bar" archiveId="a1" created={0} />
      </StaticRouter>
    ));

    dom.find('div').simulate('click', { button: 0 });
    expect(context.url).toEqual('/retros/bar/archives/a1');
  });

  it('displays the time of the archive', () => {
    const dom = mount((
      <StaticRouter location="/" context={{}}>
        <ArchiveLink retroSlug="bar" archiveId="a1" created={0} />
      </StaticRouter>
    ));

    expect(dom).toIncludeText(formatDateTime(0));
  });
});
