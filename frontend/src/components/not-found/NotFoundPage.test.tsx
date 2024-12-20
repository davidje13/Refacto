import { render, textFragment } from 'flexible-testing-library-react';

import { NotFoundPage } from './NotFoundPage';

describe('NotFoundPage', () => {
  it('displays a message', () => {
    const dom = render(<NotFoundPage />);
    expect(dom).toContainElementWith(textFragment('not found'));
  });
});
