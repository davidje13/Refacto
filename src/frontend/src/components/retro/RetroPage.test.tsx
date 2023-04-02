import React from 'react';
import { render } from 'flexible-testing-library-react';
import mockElement from 'react-mock-element';
import { makeRetro } from '../../shared/api-entities';
import { css } from '../../test-helpers/queries';

import RetroPage from './RetroPage';

jest.mock('../retro-formats/RetroFormatPicker', () => mockElement('mock-retro-format-picker'));
jest.mock('../common/Header', () => mockElement('mock-header'));

describe('RetroPage', () => {
  it('renders a retro page', () => {
    const dom = render((
      <RetroPage
        retroToken="token-1"
        retro={makeRetro()}
        retroDispatch={(): null => null}
      />
    ));
    expect(dom).toContainElementWith(css('mock-retro-format-picker'));
  });
});
