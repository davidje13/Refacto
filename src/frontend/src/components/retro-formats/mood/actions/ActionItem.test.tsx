import React from 'react';
import { render, text } from 'flexible-testing-library-react';
import { makeRetroItem } from '../../../../shared/api-entities';
import { css } from '../../../../test-helpers/queries';

import ActionItem from './ActionItem';

describe('ActionItem', () => {
  it('displays the item message', () => {
    const item = makeRetroItem({ message: 'a message here' });
    const dom = render(<ActionItem item={item} />);

    expect(dom).toContainElementWith(text('a message here'));
  });

  it('does not mark items as done by default', () => {
    const item = makeRetroItem();
    const dom = render(<ActionItem item={item} />);

    expect(dom).not.toContainElementWith(css('.done'));
  });

  it('marks the item as done if specified', () => {
    const item = makeRetroItem({ doneTime: 1 });
    const dom = render(<ActionItem item={item} />);

    expect(dom).toContainElementWith(css('.done'));
  });
});
