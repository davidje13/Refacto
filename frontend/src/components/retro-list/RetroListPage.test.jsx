import React from 'react';
import { render } from 'react-testing-library';
import mockElement from 'react-mock-element';
import { userTokenTracker, retroListTracker } from '../../api/api';

import RetroListPage from './RetroListPage';

jest.mock('../../api/api');
jest.mock('../common/Header', () => mockElement('mock-header'));
jest.mock('./RetroList', () => mockElement('mock-retro-list'));

describe('RetroListPage', () => {
  beforeEach(() => {
    userTokenTracker.set('foobar');
    retroListTracker.set('foobar', {
      retros: [{ id: 'u1', slug: 'a', name: 'R1' }],
    });
  });

  it('loads data when displayed', () => {
    const { container } = render(<RetroListPage />);

    const retroList = container.querySelector('mock-retro-list');
    expect(retroList.mockProps.retros.length).toEqual(1);
  });
});
