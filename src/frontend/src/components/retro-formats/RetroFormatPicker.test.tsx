import React from 'react';
import { render, act } from '@testing-library/react';
import mockElement from 'react-mock-element';
import { RetroItem } from 'refacto-entities';
import { queries, css } from '../../test-helpers/queries';

import RetroFormatPicker from './RetroFormatPicker';

jest.mock('./mood/MoodRetro', () => mockElement('mock-mood-retro'));
jest.mock('./unknown/UnknownRetro', () => mockElement('mock-unknown-retro'));

describe('Retro', () => {
  it('forwards properties to the specified retro format', async () => {
    const retroItems: RetroItem[] = [];
    const retroState = { foo: 'bar' };

    const dom = render((
      <RetroFormatPicker
        retroFormat="mood"
        retroOptions={{}}
        retroItems={retroItems}
        retroState={retroState}
      />
    ), { queries });

    await import('./mood/MoodRetro'); // wait for dynamic import
    act(() => undefined);

    expect(dom).toContainElementWith(css('mock-mood-retro'));
    expect(dom.getBy(css('mock-mood-retro')).mockProps).toMatchObject({
      retroItems,
      retroState,
    });
  });

  it('displays UnknownRetro for unknown formats', async () => {
    const dom = render((
      <RetroFormatPicker
        retroFormat="nope"
        retroOptions={{}}
        retroItems={[]}
        retroState={{}}
      />
    ), { queries });

    expect(dom).toContainElementWith(css('mock-unknown-retro'));
    expect(dom).not.toContainElementWith(css('mock-mood-retro'));
  });
});
