import React from 'react';
import { render } from 'react-testing-library';
import { userTokenTracker, retroListTracker } from '../../api/api';

import RetroListPage from './RetroListPage';

jest.mock('../../api/api');
jest.mock('../common/Header', () => () => (<div />));

/* eslint-disable-next-line react/prop-types */
jest.mock('./RetroList', () => ({ retros }) => (<div className="retro-list" data-retro-count={retros.length} />));

describe('RetroListPage', () => {
  beforeEach(() => {
    userTokenTracker.set('foobar');
    retroListTracker.set('foobar', {
      retros: [{ id: 'u1', slug: 'a', name: 'R1' }],
    });
  });

  it('loads data when displayed', () => {
    const { container } = render(<RetroListPage />);

    const retroList = container.querySelector('.retro-list');
    expect(retroList).toHaveAttribute('data-retro-count', '1');
  });
});
