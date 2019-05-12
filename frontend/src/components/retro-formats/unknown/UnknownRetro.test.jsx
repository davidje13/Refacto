import React from 'react';
import { render } from 'react-testing-library';

import UnknownRetro from './UnknownRetro';

describe('UnknownRetro', () => {
  it('displays a message', () => {
    const { container } = render(<UnknownRetro />);
    expect(container).toHaveTextContent('refresh the page');
  });
});
