import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { mount } from 'enzyme';

import { ArchiveListPage } from './ArchiveListPage';
import ArchiveList from './ArchiveList';

jest.mock('./ArchiveList');

describe('ArchiveListPage', () => {
  it('renders an archive list page', () => {
    const dom = mount((
      <HelmetProvider>
        <ArchiveListPage slug="my-slug" onAppear={() => {}} />
      </HelmetProvider>
    ));
    expect(dom.find(ArchiveList)).toExist();
  });

  it('triggers a load request when displayed', () => {
    const onAppear = jest.fn().mockName('onAppear');
    mount((
      <HelmetProvider>
        <ArchiveListPage slug="my-slug" onAppear={onAppear} />
      </HelmetProvider>
    ));
    expect(onAppear).toHaveBeenCalledWith('my-slug');
  });
});
