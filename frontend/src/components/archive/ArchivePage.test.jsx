import React from 'react';
import { render } from 'react-testing-library';
import mockElement from 'react-mock-element';
import { makeRetro, makeArchive } from '../../test-helpers/dataFactories';
import { slugTracker, retroTokenTracker, retroTracker } from '../../api/api';
import { queries, css } from '../../test-helpers/queries';

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
    const dom = render((
      <ArchivePage slug="abc" archiveId="myArchiveId" />
    ), { queries });
    expect(dom).toContainElementWith(css('mock-retro-format-picker'));
  });

  it('subscribes to the retro while mounted', () => {
    const dom = render((
      <ArchivePage slug="abc" archiveId="myArchiveId" />
    ), { queries });
    expect(retroTracker.subscribed).toEqual(1);

    dom.unmount();
    expect(retroTracker.subscribed).toEqual(0);
  });
});
