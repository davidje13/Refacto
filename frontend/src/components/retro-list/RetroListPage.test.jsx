import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { mount } from 'enzyme';

import { RetroListPage } from './RetroListPage';
import RetroList from './RetroList';

jest.mock('./RetroList');

describe('RetroListPage', () => {
  it('renders a retro list page', () => {
    const dom = mount((
      <HelmetProvider>
        <RetroListPage onAppear={() => {}} />
      </HelmetProvider>
    ));
    expect(dom.find(RetroList)).toExist();
  });

  it('triggers a load request when displayed', () => {
    const onAppear = jest.fn().mockName('onAppear');
    mount((
      <HelmetProvider>
        <RetroListPage onAppear={onAppear} />
      </HelmetProvider>
    ));
    expect(onAppear).toHaveBeenCalled();
  });
});
