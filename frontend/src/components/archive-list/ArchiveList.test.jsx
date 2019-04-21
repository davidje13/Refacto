import React from 'react';
import { mount } from 'enzyme';
import renderDOM from '../../test-helpers/reactDom';

import ArchiveList from './ArchiveList';
import ArchiveLink from './ArchiveLink';

jest.mock('./ArchiveLink', () => () => (<div />));

describe('ArchiveList', () => {
  it('displays a message if there are no archives', () => {
    const dom = renderDOM(<ArchiveList slug="foo" archives={[]} />);

    expect(dom.textContent).toContain('has no archives');
  });

  it('displays no message if there are archives', () => {
    const archives = [
      { id: 'a1', created: 10 },
      { id: 'a2', created: 0 },
    ];
    const dom = renderDOM(<ArchiveList slug="foo" archives={archives} />);

    expect(dom.textContent).not.toContain('has no archives');
  });

  it('displays a list of archives', () => {
    const archives = [
      { id: 'a1', created: 10 },
      { id: 'a2', created: 0 },
    ];

    const dom = mount(<ArchiveList slug="foo" archives={archives} />);

    expect(dom.find(ArchiveLink).at(0)).toHaveProp({
      retroSlug: 'foo',
      archiveId: 'a1',
      created: 10,
    });
    expect(dom.find(ArchiveLink).at(1)).toHaveProp({
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

    const dom = mount(<ArchiveList slug="foo" archives={archives} />);

    expect(dom.find(ArchiveLink).at(0)).toHaveProp({ archiveId: 'a1' });
    expect(dom.find(ArchiveLink).at(1)).toHaveProp({ archiveId: 'a3' });
    expect(dom.find(ArchiveLink).at(2)).toHaveProp({ archiveId: 'a2' });
  });
});
