import React from 'react';
import { render } from 'react-testing-library';
import { makeRetroData } from '../../test-helpers/dataFactories';

import RetroFormatPicker from './RetroFormatPicker';

jest.mock('./mood/MoodRetro', () => () => (<div className="mood-retro" />));
jest.mock('./unknown/UnknownRetro', () => () => (<div className="unknown-retro" />));

describe('Retro', () => {
  it('forwards properties to the specified retro format', () => {
    const retroData = makeRetroData({ format: 'mood' });
    const retroState = { foo: 'bar' };

    const { container } = render((
      <RetroFormatPicker
        retroData={retroData}
        retroState={retroState}
      />
    ));

    expect(container).toContainQuerySelector('.mood-retro');
  });

  it('displays UnknownRetro for unknown formats', () => {
    const retroData = makeRetroData({ format: 'nope' });
    const { container } = render((
      <RetroFormatPicker
        retroData={retroData}
        retroState={{}}
      />
    ));

    expect(container).toContainQuerySelector('.unknown-retro');
    expect(container).not.toContainQuerySelector('.mood-retro');
  });
});
