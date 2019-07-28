import React from 'react';
import { render } from '@testing-library/react';
import mockElement from 'react-mock-element';
import { makeRetroData } from '../../test-helpers/dataFactories';
import { queries, css } from '../../test-helpers/queries';

import RetroFormatPicker from './RetroFormatPicker';

jest.mock('./mood/MoodRetro', () => mockElement('mock-mood-retro'));
jest.mock('./unknown/UnknownRetro', () => mockElement('mock-unknown-retro'));

describe('Retro', () => {
  it('forwards properties to the specified retro format', () => {
    const retroData = makeRetroData({ format: 'mood' });
    const retroState = { foo: 'bar' };

    const dom = render((
      <RetroFormatPicker
        retroData={retroData}
        retroState={retroState}
      />
    ), { queries });

    expect(dom).toContainElementWith(css('mock-mood-retro'));
    expect(dom.getBy(css('mock-mood-retro')).mockProps).toMatchObject({
      retroData,
      retroState,
    });
  });

  it('displays UnknownRetro for unknown formats', () => {
    const retroData = makeRetroData({ format: 'nope' });
    const dom = render((
      <RetroFormatPicker
        retroData={retroData}
        retroState={{}}
      />
    ), { queries });

    expect(dom).toContainElementWith(css('mock-unknown-retro'));
    expect(dom).not.toContainElementWith(css('mock-mood-retro'));
  });
});
