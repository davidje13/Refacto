import React from 'react';
import { render } from '@testing-library/react';
import { makeRetroItem } from 'refacto-entities';
import { queries, css, text } from '../../../../test-helpers/queries';

import ActionItem from './ActionItem';

describe('ActionItem', () => {
  it('displays the item message', () => {
    const item = makeRetroItem({ message: 'a message here' });
    const dom = render(<ActionItem item={item} />, { queries });

    expect(dom).toContainElementWith(text('a message here'));
  });

  it('does not mark items as done by default', () => {
    const item = makeRetroItem();
    const dom = render(<ActionItem item={item} />, { queries });

    expect(dom).not.toContainElementWith(css('.done'));
  });

  it('marks the item as done if specified', () => {
    const item = makeRetroItem({ done: true });
    const dom = render(<ActionItem item={item} />, { queries });

    expect(dom).toContainElementWith(css('.done'));
  });
});
