import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { mount } from 'enzyme';
import { makeRetro } from '../../test-helpers/dataFactories';

import { RetroPage } from './RetroPage';
import Retro from './Retro';

jest.mock('./Retro', () => () => (<div />));

describe('RetroPage', () => {
  const data = makeRetro();

  it('renders a retro page', () => {
    const dom = mount((
      <HelmetProvider>
        <RetroPage slug="abc" data={data} />
      </HelmetProvider>
    ));
    expect(dom.find(Retro)).toExist();
  });
});
