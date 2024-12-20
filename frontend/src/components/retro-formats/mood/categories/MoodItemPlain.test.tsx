import { render, text } from 'flexible-testing-library-react';
import { makeRetroItem } from '../../../../shared/api-entities';
import { css } from '../../../../test-helpers/queries';

import { MoodItemPlain } from './MoodItemPlain';

describe('MoodItemPlain', () => {
  it('displays the item message', () => {
    const item = makeRetroItem({ message: 'a message here' });
    const dom = render(<MoodItemPlain item={item} />);

    expect(dom).toContainElementWith(text('a message here'));
  });

  it('displays the vote count', () => {
    const item = makeRetroItem({ votes: 3 });
    const dom = render(<MoodItemPlain item={item} />);

    const voteCount = dom.getBy(css('.vote'));
    expect(voteCount).toHaveTextContent('3');
  });

  it('does not mark items as done by default', () => {
    const dom = render(<MoodItemPlain item={makeRetroItem()} />);

    expect(dom).not.toContainElementWith(css('.done'));
  });

  it('marks the item as done if specified', () => {
    const item = makeRetroItem({ doneTime: 1 });
    const dom = render(<MoodItemPlain item={item} />);

    expect(dom).toContainElementWith(css('.done'));
  });
});
