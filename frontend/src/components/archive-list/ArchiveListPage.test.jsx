import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { mount } from 'enzyme';
import { makeRetro } from '../../test-helpers/dataFactories';

import { ArchiveListPage } from './ArchiveListPage';
import ArchiveList from './ArchiveList';

jest.mock('./ArchiveList', () => () => (<div />));

describe('ArchiveListPage', () => {
  const data = {
    retro: makeRetro(),
    error: null,
  };

  it('renders an archive list page', () => {
    const dom = mount((
      <HelmetProvider>
        <ArchiveListPage
          slug="my-slug"
          data={data}
          onAppear={() => {}}
          onDisappear={() => {}}
        />
      </HelmetProvider>
    ));
    expect(dom.find(ArchiveList)).toExist();
  });

  it('triggers a load request when displayed', () => {
    const onAppear = jest.fn().mockName('onAppear');
    mount((
      <HelmetProvider>
        <ArchiveListPage
          slug="my-slug"
          onAppear={onAppear}
          onDisappear={() => {}}
        />
      </HelmetProvider>
    ));
    expect(onAppear).toHaveBeenCalledWith('my-slug');
  });
});
