import { render, textFragment } from 'flexible-testing-library-react';

import { LoadingIndicator } from './Loader';

describe('LoadingIndicator', () => {
  it('displays a loading message', () => {
    const dom = render(<LoadingIndicator />);

    expect(dom).toContainElementWith(textFragment('Loading'));
  });
});
