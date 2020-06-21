import React from 'react';
import { render } from '@testing-library/react';
import mockElement from 'react-mock-element';
import { makeRetro, makeRetroArchive } from 'refacto-entities';
import { archiveTracker } from '../../api/api';
import type * as mockApiTypes from '../../api/__mocks__/api';
import { queries, css } from '../../test-helpers/queries';

import ArchivePage from './ArchivePage';

jest.mock('../../api/api');
jest.mock('../retro-formats/RetroFormatPicker', () => mockElement('mock-retro-format-picker'));
jest.mock('../common/Header', () => mockElement('mock-header'));

const mockArchiveTracker = archiveTracker as any as typeof mockApiTypes.archiveTracker;

describe('ArchivePage', () => {
  beforeEach(() => {
    mockArchiveTracker.setExpectedToken('token-1');
    mockArchiveTracker.setServerData('r1', 'myArchiveId', makeRetroArchive());
  });

  it('renders a retro page', () => {
    const dom = render((
      <ArchivePage
        retroToken="token-1"
        retro={makeRetro({ id: 'r1' })}
        archiveId="myArchiveId"
      />
    ), { queries });
    expect(dom).toContainElementWith(css('mock-retro-format-picker'));
  });
});
