import React from 'react';
import { mount } from 'enzyme';
import { makeRetro } from '../../test-helpers/dataFactories';
import { slugTracker, retroTracker } from '../../api/api';

import ArchiveListPage from './ArchiveListPage';
import ArchiveList from './ArchiveList';

jest.mock('../../api/api');
jest.mock('../common/Header', () => () => (<div />));
jest.mock('./ArchiveList', () => () => (<div />));

describe('ArchiveListPage', () => {
  const retroData = { retro: makeRetro() };

  beforeEach(() => {
    slugTracker.setServerData('my-slug', { id: 'r1' });
    retroTracker.setServerData('r1', retroData);
  });

  it('renders an archive list page', () => {
    const dom = mount(<ArchiveListPage slug="my-slug" />);
    expect(dom.find(ArchiveList)).toExist();
  });

  it('subscribes to the retro while mounted', async () => {
    const dom = mount(<ArchiveListPage slug="my-slug" />);
    expect(retroTracker.subscribed).toEqual(1);

    dom.unmount();
    expect(retroTracker.subscribed).toEqual(0);
  });
});
