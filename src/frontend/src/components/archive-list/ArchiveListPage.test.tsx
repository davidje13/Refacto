import React from 'react';
import { render } from 'flexible-testing-library-react';
import mockElement from 'react-mock-element';
import { makeRetro } from 'refacto-entities';
import { archiveTracker } from '../../api/api';
import type * as mockApiTypes from '../../api/__mocks__/api';
import { css } from '../../test-helpers/queries';

import ArchiveListPage from './ArchiveListPage';

jest.mock('../../api/api');
jest.mock('../common/Header', () => mockElement('mock-header'));
jest.mock('./ArchiveList', () => mockElement('mock-archive-list'));

const mockArchiveTracker = archiveTracker as unknown as typeof mockApiTypes.archiveTracker;

describe('ArchiveListPage', () => {
  beforeEach(() => {
    mockArchiveTracker.setExpectedToken('token-1');
  });

  it('renders an archive list page', () => {
    const dom = render((
      <ArchiveListPage
        retro={makeRetro({ id: 'r1' })}
        retroToken="token-1"
      />
    ));
    expect(dom).toContainElementWith(css('mock-archive-list'));
  });
});
