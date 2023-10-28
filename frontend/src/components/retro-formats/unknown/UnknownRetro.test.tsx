import { render, textFragment } from 'flexible-testing-library-react';

import { UnknownRetro } from './UnknownRetro';

describe('UnknownRetro', () => {
  it('displays a message', () => {
    const dom = render(<UnknownRetro />);
    expect(dom).toContainElementWith(textFragment('refresh the page'));
  });
});
