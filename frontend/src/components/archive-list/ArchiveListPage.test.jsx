import React from 'react';
import { render } from 'react-testing-library';
import { makeRetro } from '../../test-helpers/dataFactories';
import mockElement from '../../test-helpers/mockElement';
import { slugTracker, retroTokenTracker, retroTracker } from '../../api/api';

import ArchiveListPage from './ArchiveListPage';

jest.mock('../../api/api');
jest.mock('../common/Header', () => mockElement('fake-header'));
jest.mock('./ArchiveList', () => mockElement('fake-archive-list'));

describe('ArchiveListPage', () => {
  const retroData = { retro: makeRetro() };

  beforeEach(() => {
    slugTracker.set('my-slug', 'r1');
    retroTokenTracker.set('r1', 'token-1');
    retroTracker.setServerData('r1', retroData);
  });

  it('renders an archive list page', () => {
    const { container } = render(<ArchiveListPage slug="my-slug" />);
    expect(container).toContainQuerySelector('fake-archive-list');
  });

  it('subscribes to the retro while mounted', async () => {
    const { unmount } = render(<ArchiveListPage slug="my-slug" />);
    expect(retroTracker.subscribed).toEqual(1);

    unmount();
    expect(retroTracker.subscribed).toEqual(0);
  });
});
