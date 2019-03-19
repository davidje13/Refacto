import React from 'react';
import { shallow } from 'enzyme';
import { makeRetroData } from '../../test-helpers/dataFactories';

import { RetroFormatPicker } from './RetroFormatPicker';
import MoodRetro from './mood/MoodRetro';
import UnknownRetro from './unknown/UnknownRetro';

describe('Retro', () => {
  it('forwards properties to the specified retro format', () => {
    const retroData = makeRetroData({ format: 'mood' });
    const retroState = { foo: 'bar' };

    const dom = shallow((
      <RetroFormatPicker
        retroData={retroData}
        retroState={retroState}
      />
    ));

    const format = dom.find(MoodRetro);
    expect(format).toExist();
    expect(format).toHaveProp({
      retroData,
      retroState,
    });
  });

  it('displays UnknownRetro for unknown formats', () => {
    const retroData = makeRetroData({ format: 'nope' });
    const dom = shallow((
      <RetroFormatPicker
        retroData={retroData}
        retroState={{}}
      />
    ));

    expect(dom.find(UnknownRetro)).toExist();
    expect(dom.find(MoodRetro)).not.toExist();
  });
});
