import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { mount } from 'enzyme';
import { makeRetro, makeArchive } from '../../test-helpers/dataFactories';

import { ArchivePage } from './ArchivePage';
import ArchivedRetro from './ArchivedRetro';

jest.mock('./ArchivedRetro', () => () => (<div />));

describe('ArchivePage', () => {
  const retroData = {
    retro: makeRetro(),
    error: null,
    archives: {
      myArchiveId: makeArchive(),
    },
  };

  it('renders a retro page', () => {
    const dom = mount((
      <HelmetProvider>
        <ArchivePage
          slug="abc"
          archiveId="myArchiveId"
          retroData={retroData}
          onAppear={() => {}}
          onDisappear={() => {}}
        />
      </HelmetProvider>
    ));
    expect(dom.find(ArchivedRetro)).toExist();
  });

  it('triggers a load request when displayed', () => {
    const onAppear = jest.fn().mockName('onAppear');
    mount((
      <HelmetProvider>
        <ArchivePage
          slug="abc"
          archiveId="myArchiveId"
          onAppear={onAppear}
          onDisappear={() => {}}
        />
      </HelmetProvider>
    ));
    expect(onAppear).toHaveBeenCalledWith('abc', 'myArchiveId');
  });
});
