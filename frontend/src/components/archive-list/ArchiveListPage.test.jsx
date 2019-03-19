import React from 'react';
import { mount } from 'enzyme';
import { makeRetro } from '../../test-helpers/dataFactories';

import { ArchiveListPage } from './ArchiveListPage';
import ArchiveList from './ArchiveList';

jest.mock('./ArchiveList', () => () => (<div />));
jest.mock('../common/Header', () => () => (<div />));

describe('ArchiveListPage', () => {
  const retroData = {
    retro: makeRetro(),
    error: null,
  };

  it('renders an archive list page', () => {
    const dom = mount((
      <ArchiveListPage
        slug="my-slug"
        retroData={retroData}
        onAppear={() => {}}
        onDisappear={() => {}}
      />
    ));
    expect(dom.find(ArchiveList)).toExist();
  });

  it('triggers a load request when displayed', () => {
    const onAppear = jest.fn().mockName('onAppear');
    mount((
      <ArchiveListPage
        slug="my-slug"
        onAppear={onAppear}
        onDisappear={() => {}}
      />
    ));
    expect(onAppear).toHaveBeenCalledWith('my-slug');
  });
});
