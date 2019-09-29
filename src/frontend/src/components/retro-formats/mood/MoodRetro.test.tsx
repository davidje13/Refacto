import React from 'react';
import { render } from '@testing-library/react';

import MoodRetro from './MoodRetro';

const nop = (): void => {};

describe('MoodRetro', () => {
  it('renders without error', () => {
    render((
      <MoodRetro
        retroOptions={{}}
        retroItems={[]}
        retroState={{}}
        archive={false}
        onComplete={nop}
        dispatch={nop}
      />
    ));
  });
});
