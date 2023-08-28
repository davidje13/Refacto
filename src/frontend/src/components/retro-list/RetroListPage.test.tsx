import React from 'react';
import { render } from 'flexible-testing-library-react';
import mockElement from 'react-mock-element';
import { userTokenTracker, retroListTracker } from '../../api/api';
import type * as mockApiTypes from '../../api/__mocks__/api';
import { css } from '../../test-helpers/queries';

import RetroListPage from './RetroListPage';

jest.mock('../../api/api');
jest.mock('../common/Header', () => mockElement('mock-header'));
jest.mock('./RetroList', () => mockElement('mock-retro-list'));

const mockRetroListTracker = retroListTracker as unknown as typeof mockApiTypes.retroListTracker;

describe('RetroListPage', () => {
  beforeEach(() => {
    userTokenTracker.set('foobar');
    mockRetroListTracker.set('foobar', {
      retros: [{ id: 'u1', slug: 'a', name: 'R1' }],
    });
  });

  it('loads data when displayed', () => {
    const dom = render(<RetroListPage />);

    const retroList = dom.getBy(css('mock-retro-list'));
    expect(retroList.mockProps['retros'].length).toEqual(1);
  });
});
