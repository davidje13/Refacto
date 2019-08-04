import React from 'react';
import { render } from '@testing-library/react';
import mockElement from 'react-mock-element';
import { makeMutableRetro, makeRetroArchive } from 'refacto-entities';
import {
  slugTracker,
  retroTokenTracker,
  retroTracker,
  archiveTracker,
} from '../../api/api';
import * as mockApiTypes from '../../api/__mocks__/api';
import { queries, css } from '../../test-helpers/queries';

import ArchivePage from './ArchivePage';

jest.mock('../../api/api');
jest.mock('../retro-formats/RetroFormatPicker', () => mockElement('mock-retro-format-picker'));
jest.mock('../common/Header', () => mockElement('mock-header'));

const mockRetroTracker = retroTracker as any as typeof mockApiTypes.retroTracker;

const mockArchiveTracker = archiveTracker as any as typeof mockApiTypes.archiveTracker;

describe('ArchivePage', () => {
  beforeEach(() => {
    slugTracker.set('abc', 'r1');
    retroTokenTracker.set('r1', 'token-1');
    mockRetroTracker.setExpectedToken('token-1');
    mockRetroTracker.setServerData('r1', { retro: makeMutableRetro() });
    mockArchiveTracker.setExpectedToken('token-1');
    mockArchiveTracker.setServerData('r1', 'myArchiveId', makeRetroArchive());
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
    expect(mockRetroTracker.subscribed).toEqual(1);

    dom.unmount();
    expect(mockRetroTracker.subscribed).toEqual(0);
  });
});
