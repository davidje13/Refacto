import React from 'react';
import { render } from 'react-testing-library';
import { makeItem } from '../../../../test-helpers/dataFactories';

import ActionItem from './ActionItem';

describe('ActionItem', () => {
  it('displays the item message', () => {
    const item = makeItem({ message: 'a message here' });
    const { container } = render(<ActionItem item={item} />);

    expect(container).toHaveTextContent('a message here');
  });

  it('does not mark items as done by default', () => {
    const item = makeItem();
    const { container } = render(<ActionItem item={item} />);

    expect(container).not.toContainQuerySelector('.done');
  });

  it('marks the item as done if specified', () => {
    const item = makeItem({ done: true });
    const { container } = render(<ActionItem item={item} />);

    expect(container).toContainQuerySelector('.done');
  });
});
