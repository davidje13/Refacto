import React from 'react';
import { render } from 'react-testing-library';
import mockElement from '../../test-helpers/mockElement';
import mockPropStorage from '../../test-helpers/mockPropStorage';
import { userTokenTracker, retroListTracker } from '../../api/api';

import RetroListPage from './RetroListPage';

jest.mock('../../api/api');
jest.mock('../common/Header', () => mockElement('fake-header'));
jest.mock('./RetroList', () => mockElement('fake-retro-list'));

describe('RetroListPage', () => {
  beforeEach(() => {
    userTokenTracker.set('foobar');
    retroListTracker.set('foobar', {
      retros: [{ id: 'u1', slug: 'a', name: 'R1' }],
    });
  });

  it('loads data when displayed', () => {
    const { container } = render(<RetroListPage />);

    const retroList = container.querySelector('fake-retro-list');
    expect(mockPropStorage.get(retroList).retros.length).toEqual(1);
  });
});
