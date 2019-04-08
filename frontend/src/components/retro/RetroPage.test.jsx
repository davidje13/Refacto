import React from 'react';
import { mount } from 'enzyme';
import { makeRetro } from '../../test-helpers/dataFactories';
import { slugTracker, retroTokenTracker, retroTracker } from '../../api/api';

import RetroPage from './RetroPage';
import RetroFormatPicker from '../retro-formats/RetroFormatPicker';

jest.mock('../../api/api');
jest.mock('../retro-formats/RetroFormatPicker', () => () => (<div />));
jest.mock('../common/Header', () => () => (<div />));

describe('RetroPage', () => {
  const retroData = { retro: makeRetro() };

  beforeEach(() => {
    slugTracker.setServerData('abc', { id: 'r1' });
    retroTokenTracker.set('r1', 'token-1');
    retroTracker.setServerData('r1', retroData);
  });

  it('renders a retro page', () => {
    const dom = mount(<RetroPage slug="abc" />);
    expect(dom.find(RetroFormatPicker)).toExist();
  });
});
