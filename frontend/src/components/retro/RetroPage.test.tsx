import { render } from 'flexible-testing-library-react';
import mockElement from 'react-mock-element';
import { makeRetro } from '../../shared/api-entities';
import { css } from '../../test-helpers/queries';
import { nullDispatch } from '../../test-helpers/nullDispatch';

import { RetroPage } from './RetroPage';

jest.mock('../retro-formats/RetroFormatPicker', () => ({
  RetroFormatPicker: mockElement('mock-retro-format-picker'),
}));

describe('RetroPage', () => {
  it('renders a retro page', () => {
    const dom = render(
      <RetroPage
        retroToken="token-1"
        retro={makeRetro()}
        retroDispatch={nullDispatch}
      />,
    );
    expect(dom).toContainElementWith(css('mock-retro-format-picker'));
  });
});
