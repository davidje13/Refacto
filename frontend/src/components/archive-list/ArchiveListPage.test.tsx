import React from 'react';
import { render } from '@testing-library/react';
import mockElement from 'react-mock-element';
import { makeRetro } from '../../test-helpers/dataFactories';
import {
  slugTracker,
  retroTokenTracker,
  retroTracker,
  archiveTracker,
} from '../../api/api';
import * as mockApiTypes from '../../api/__mocks__/api';
import { queries, css } from '../../test-helpers/queries';

import ArchiveListPage from './ArchiveListPage';

jest.mock('../../api/api');
jest.mock('../common/Header', () => mockElement('mock-header'));
jest.mock('./ArchiveList', () => mockElement('mock-archive-list'));

const mockRetroTracker = retroTracker as any as typeof mockApiTypes.retroTracker;

const mockArchiveTracker = archiveTracker as any as typeof mockApiTypes.archiveTracker;

describe('ArchiveListPage', () => {
  const retroData = { retro: makeRetro() };

  beforeEach(() => {
    slugTracker.set('my-slug', 'r1');
    retroTokenTracker.set('r1', 'token-1');
    mockRetroTracker.setExpectedToken('token-1');
    mockRetroTracker.setServerData('r1', retroData);
    mockArchiveTracker.setExpectedToken('token-1');
  });

  it('renders an archive list page', () => {
    const dom = render(<ArchiveListPage slug="my-slug" />, { queries });
    expect(dom).toContainElementWith(css('mock-archive-list'));
  });

  it('subscribes to the retro while mounted', async () => {
    const dom = render(<ArchiveListPage slug="my-slug" />, { queries });
    expect(mockRetroTracker.subscribed).toEqual(1);

    dom.unmount();
    expect(mockRetroTracker.subscribed).toEqual(0);
  });
});
