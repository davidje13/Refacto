import { render } from 'flexible-testing-library-react';

import { MoodRetro } from './MoodRetro';

const nop = () => undefined;

describe('MoodRetro', () => {
  it('renders without error', () => {
    render(
      <MoodRetro
        retroOptions={{}}
        retroItems={[]}
        retroState={{}}
        archive={false}
        onComplete={nop}
        dispatch={nop}
      />,
    );
  });
});
