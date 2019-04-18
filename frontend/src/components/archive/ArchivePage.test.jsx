import React from 'react';
import { mount } from 'enzyme';
import { makeRetro, makeArchive } from '../../test-helpers/dataFactories';
import { slugTracker, retroTokenTracker, retroTracker } from '../../api/api';

import ArchivePage from './ArchivePage';
import RetroFormatPicker from '../retro-formats/RetroFormatPicker';

jest.mock('../../api/api');
jest.mock('../retro-formats/RetroFormatPicker', () => () => (<div />));
jest.mock('../common/Header', () => () => (<div />));

describe('ArchivePage', () => {
  const retroData = { retro: makeRetro() };
  const archiveData = makeArchive();

  beforeEach(() => {
    slugTracker.set('abc', 'r1');
    retroTokenTracker.set('r1', 'token-1');
    retroTracker.setServerData('r1', retroData, { myArchiveId: archiveData });
  });

  it('renders a retro page', () => {
    const dom = mount(<ArchivePage slug="abc" archiveId="myArchiveId" />);
    expect(dom.find(RetroFormatPicker)).toExist();
  });

  it('subscribes to the retro while mounted', () => {
    const dom = mount(<ArchivePage slug="abc" archiveId="myArchiveId" />);
    expect(retroTracker.subscribed).toEqual(1);

    dom.unmount();
    expect(retroTracker.subscribed).toEqual(0);
  });
});
