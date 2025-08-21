import { render } from 'flexible-testing-library-react';
import mockElement from 'react-mock-element';
import type { RetroItem } from '../../shared/api-entities';
import { css } from '../../test-helpers/queries';

import { RetroFormatPicker } from './RetroFormatPicker';

jest.mock('./mood/MoodRetro', () => ({
  MoodRetro: mockElement('mock-mood-retro'),
}));
jest.mock('./unknown/UnknownRetro', () => ({
  UnknownRetro: mockElement('mock-unknown-retro'),
}));

describe('Retro', () => {
  it('forwards properties to the specified retro format', async () => {
    const retroItems: RetroItem[] = [];
    const retroState = { foo: 'bar' };

    const dom = render(
      <RetroFormatPicker
        retroFormat="mood"
        retroOptions={{}}
        retroItems={retroItems}
        retroState={retroState}
      />,
    );

    expect((await dom.findBy(css('mock-mood-retro'))).mockProps).toMatchObject({
      retroItems,
      retroState,
    });
  });

  it('displays UnknownRetro for unknown formats', async () => {
    const dom = render(
      <RetroFormatPicker
        retroFormat="nope"
        retroOptions={{}}
        retroItems={[]}
        retroState={{}}
      />,
    );

    expect(dom).toContainElementWith(css('mock-unknown-retro'));
    expect(dom).not.toContainElementWith(css('mock-mood-retro'));
  });
});
