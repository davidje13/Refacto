import React from 'react';
import { mount } from 'enzyme';
import { makeRetro } from '../../test-helpers/dataFactories';

import { RetroPage } from './RetroPage';
import RetroFormatPicker from '../retro-formats/RetroFormatPicker';

jest.mock('../retro-formats/RetroFormatPicker', () => () => (<div />));
jest.mock('../common/Header', () => () => (<div />));

describe('RetroPage', () => {
  const data = makeRetro();

  it('renders a retro page', () => {
    const dom = mount((
      <RetroPage
        slug="abc"
        data={data}
        onAppear={() => {}}
        onDisappear={() => {}}
        onAddItem={() => {}}
        onVoteItem={() => {}}
        onEditItem={() => {}}
        onDeleteItem={() => {}}
        onSetItemDone={() => {}}
        onSetRetroState={() => {}}
      />
    ));
    expect(dom.find(RetroFormatPicker)).toExist();
  });
});
