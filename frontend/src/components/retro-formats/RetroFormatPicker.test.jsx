import React from 'react';
import { shallow } from 'enzyme';
import { makeRetroData } from '../../test-helpers/dataFactories';

import { RetroFormatPicker } from './RetroFormatPicker';
import MoodRetro from './mood/MoodRetro';
import UnknownRetro from './unknown/UnknownRetro';

describe('Retro', () => {
  it('forwards properties to the specified retro format', () => {
    const data = makeRetroData({ format: 'mood' });
    const state = { foo: 'bar' };

    const dom = shallow(<RetroFormatPicker retroData={data} retroState={state} />);

    const format = dom.find(MoodRetro);
    expect(format).toExist();
    expect(format).toHaveProp({
      retroData: data,
      retroState: state,
    });
  });

  it('displays UnknownRetro for unknown formats', () => {
    const data = makeRetroData({ format: 'nope' });
    const dom = shallow(<RetroFormatPicker retroData={data} retroState={{}} />);

    expect(dom.find(UnknownRetro)).toExist();
    expect(dom.find(MoodRetro)).not.toExist();
  });
});
