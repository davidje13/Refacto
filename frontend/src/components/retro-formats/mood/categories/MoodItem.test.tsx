import { render, fireEvent } from 'flexible-testing-library-react';
import { makeRetroItem } from '../../../../shared/api-entities';
import { css } from '../../../../test-helpers/queries';

import { MoodItem } from './MoodItem';

describe('MoodItem integration', () => {
  const item = makeRetroItem({
    message: 'a message here',
    id: 'my-id',
    votes: 3,
  });

  it('displays the item message', () => {
    const dom = render(<MoodItem item={item} />);

    const message = dom.getBy(css('button.message'));
    expect(message).toHaveTextContent(item.message);
  });

  it('displays the vote count', () => {
    const dom = render(<MoodItem item={item} />);

    const vote = dom.getBy(css('button.vote'));
    expect(vote).toHaveTextContent('3');
  });

  it('does not allow voting if no callback is given', () => {
    const dom = render(<MoodItem item={makeRetroItem()} />);

    const vote = dom.getBy(css('button.vote'));
    expect(vote).toBeDisabled();
  });

  it('invokes the given callback with the item ID if voted on', () => {
    const onVote = jest.fn().mockName('onVote');
    const dom = render(<MoodItem item={item} onVote={onVote} />);

    const vote = dom.getBy(css('button.vote'));
    expect(vote).not.toBeDisabled();
    fireEvent.click(vote);

    expect(onVote).toHaveBeenCalled();
  });

  it('does not mark items as done or focused by default', () => {
    const dom = render(<MoodItem item={makeRetroItem()} />);

    expect(dom).not.toContainElementWith(css('.mood-item.done'));
    expect(dom).not.toContainElementWith(css('.mood-item.focused'));
  });

  it('marks the item as done if specified', () => {
    const dom = render(<MoodItem item={makeRetroItem({ doneTime: 1 })} />);

    expect(dom).toContainElementWith(css('.mood-item.done'));
  });

  it('marks the item as focused if specified', () => {
    const dom = render(<MoodItem item={makeRetroItem()} focused />);

    expect(dom).toContainElementWith(css('.mood-item.focused'));
  });
});
