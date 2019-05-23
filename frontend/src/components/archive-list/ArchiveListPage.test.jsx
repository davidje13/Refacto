import React from 'react';
import { render } from 'react-testing-library';
import mockElement from 'react-mock-element';
import { makeRetro } from '../../test-helpers/dataFactories';
import { slugTracker, retroTokenTracker, retroTracker } from '../../api/api';
import { queries, css } from '../../test-helpers/queries';

import ArchiveListPage from './ArchiveListPage';

jest.mock('../../api/api');
jest.mock('../common/Header', () => mockElement('mock-header'));
jest.mock('./ArchiveList', () => mockElement('mock-archive-list'));

describe('ArchiveListPage', () => {
  const retroData = { retro: makeRetro() };

  beforeEach(() => {
    slugTracker.set('my-slug', 'r1');
    retroTokenTracker.set('r1', 'token-1');
    retroTracker.setServerData('r1', retroData);
  });

  it('renders an archive list page', () => {
    const dom = render(<ArchiveListPage slug="my-slug" />, { queries });
    expect(dom).toContainElementWith(css('mock-archive-list'));
  });

  it('subscribes to the retro while mounted', async () => {
    const dom = render(<ArchiveListPage slug="my-slug" />, { queries });
    expect(retroTracker.subscribed).toEqual(1);

    dom.unmount();
    expect(retroTracker.subscribed).toEqual(0);
  });
});
