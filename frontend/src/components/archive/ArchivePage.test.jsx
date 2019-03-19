import React from 'react';
import { mount } from 'enzyme';
import { makeRetro, makeArchive } from '../../test-helpers/dataFactories';

import { ArchivePage } from './ArchivePage';
import RetroFormatPicker from '../retro-formats/RetroFormatPicker';

jest.mock('../retro-formats/RetroFormatPicker', () => () => (<div />));
jest.mock('../common/Header', () => () => (<div />));

describe('ArchivePage', () => {
  const retroData = {
    retro: makeRetro(),
    error: null,
    archives: {
      myArchiveId: {
        archive: makeArchive(),
        error: null,
      },
    },
  };

  it('renders a retro page', () => {
    const dom = mount((
      <ArchivePage
        slug="abc"
        archiveId="myArchiveId"
        retroData={retroData}
        onAppear={() => {}}
        onDisappear={() => {}}
      />
    ));
    expect(dom.find(RetroFormatPicker)).toExist();
  });

  it('triggers a load request when displayed', () => {
    const onAppear = jest.fn().mockName('onAppear');
    mount((
      <ArchivePage
        slug="abc"
        archiveId="myArchiveId"
        onAppear={onAppear}
        onDisappear={() => {}}
      />
    ));
    expect(onAppear).toHaveBeenCalledWith('abc', 'myArchiveId');
  });
});
