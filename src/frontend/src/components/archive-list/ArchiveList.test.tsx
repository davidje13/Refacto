import React from 'react';
import { render, textFragment } from 'flexible-testing-library-react';
import mockElement from 'react-mock-element';
import { css } from '../../test-helpers/queries';

import ArchiveList from './ArchiveList';

jest.mock('./ArchiveLink', () => mockElement('mock-archive-link'));

describe('ArchiveList', () => {
  it('displays a message if there are no archives', () => {
    const dom = render((
      <ArchiveList slug="foo" archives={[]} />
    ));

    expect(dom).toContainElementWith(textFragment('has no archives'));
  });

  it('displays no message if there are archives', () => {
    const archives = [
      { id: 'a1', created: 10 },
      { id: 'a2', created: 0 },
    ];
    const dom = render((
      <ArchiveList slug="foo" archives={archives} />
    ));

    expect(dom).not.toContainElementWith(textFragment('has no archives'));
  });

  it('displays a list of archives', () => {
    const archives = [
      { id: 'a1', created: 10 },
      { id: 'a2', created: 0 },
    ];

    const dom = render((
      <ArchiveList slug="foo" archives={archives} />
    ));

    const links = dom.getAllBy(css('mock-archive-link'));

    expect(links[0].mockProps).toEqual({
      retroSlug: 'foo',
      archiveId: 'a1',
      created: 10,
    });

    expect(links[1].mockProps).toEqual({
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

    const dom = render((
      <ArchiveList slug="foo" archives={archives} />
    ));

    const links = dom.getAllBy(css('mock-archive-link'));

    expect(links[0].mockProps.archiveId).toEqual('a1');
    expect(links[1].mockProps.archiveId).toEqual('a3');
    expect(links[2].mockProps.archiveId).toEqual('a2');
  });
});
