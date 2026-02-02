import { render } from 'flexible-testing-library-react';
import mockElement from 'react-mock-element';
import { makeRetro } from '../../shared/api-entities';
import { css } from '../../test-helpers/queries';
import { nullDispatch } from '../../test-helpers/nullDispatch';
import { COMMON_AUTH } from '../../test-helpers/commonAuth';

import { RetroPage } from './RetroPage';

jest.mock('../retro-formats/RetroFormat', () => ({
  RetroFormat: mockElement('mock-retro-format'),
}));

describe('RetroPage', () => {
  it('renders a retro page', () => {
    const dom = render(
      <RetroPage
        retroAuth={COMMON_AUTH}
        retro={makeRetro()}
        retroDispatch={nullDispatch}
      />,
    );
    expect(dom).toContainElementWith(css('mock-retro-format'));
  });
});
