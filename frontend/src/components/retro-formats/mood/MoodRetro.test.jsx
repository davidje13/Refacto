import React from 'react';
import { mount } from 'enzyme';
import { makeRetroData } from '../../../test-helpers/dataFactories';

import MoodRetro from './MoodRetro';

const emptyRetroData = makeRetroData({ format: 'mood' });

describe('MoodRetro', () => {
  it('renders without error', () => {
    const dom = mount((
      <MoodRetro
        retroData={emptyRetroData}
        retroState={{}}
        archive={false}
        dispatch={() => {}}
      />
    ));
    expect(dom).toExist();
  });
});
