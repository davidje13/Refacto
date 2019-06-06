import React from 'react';
import { render } from 'react-testing-library';
import { makeRetroData } from '../../../test-helpers/dataFactories';

import MoodRetro from './MoodRetro';

const emptyRetroData = makeRetroData({ format: 'mood' });

describe('MoodRetro', () => {
  it('renders without error', () => {
    render((
      <MoodRetro
        retroData={emptyRetroData}
        retroState={{}}
        archive={false}
        onComplete={() => {}}
        dispatch={() => {}}
      />
    ));
  });
});
