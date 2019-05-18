import React from 'react';
import { render } from 'react-testing-library';
import { makeRetro, makeArchive } from '../../test-helpers/dataFactories';
import mockElement from '../../test-helpers/mockElement';
import { slugTracker, retroTokenTracker, retroTracker } from '../../api/api';

import ArchivePage from './ArchivePage';

jest.mock('../../api/api');
jest.mock('../retro-formats/RetroFormatPicker', () => mockElement('mock-retro-format-picker'));
jest.mock('../common/Header', () => mockElement('mock-header'));

describe('ArchivePage', () => {
  const retroData = { retro: makeRetro() };
  const archiveData = makeArchive();

  beforeEach(() => {
    slugTracker.set('abc', 'r1');
    retroTokenTracker.set('r1', 'token-1');
    retroTracker.setServerData('r1', retroData, { myArchiveId: archiveData });
  });

  it('renders a retro page', () => {
    const { container } = render((
      <ArchivePage slug="abc" archiveId="myArchiveId" />
    ));
    expect(container).toContainQuerySelector('mock-retro-format-picker');
  });

  it('subscribes to the retro while mounted', () => {
    const { unmount } = render((
      <ArchivePage slug="abc" archiveId="myArchiveId" />
    ));
    expect(retroTracker.subscribed).toEqual(1);

    unmount();
    expect(retroTracker.subscribed).toEqual(0);
  });
});
