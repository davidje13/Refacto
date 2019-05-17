import React from 'react';
import { render, fireEvent } from 'react-testing-library';
import { makeItem } from '../../../../test-helpers/dataFactories';

import MoodItem from './MoodItem';

describe('MoodItem integration', () => {
  const item = makeItem({ message: 'a message here', id: 'my-id', votes: 3 });

  it('displays the item message', () => {
    const { container } = render(<MoodItem item={item} />);

    const message = container.querySelector('button.message');
    expect(message).toHaveTextContent(item.message);
  });

  it('displays the vote count', () => {
    const { container } = render(<MoodItem item={item} />);

    const vote = container.querySelector('button.vote');
    expect(vote).toHaveTextContent('3');
  });

  it('does not allow voting if no callback is given', () => {
    const { container } = render(<MoodItem item={makeItem()} />);

    const vote = container.querySelector('button.vote');
    expect(vote).toBeDisabled();
  });

  it('invokes the given callback with the item ID if voted on', () => {
    const onVote = jest.fn().mockName('onVote');
    const { container } = render(<MoodItem item={item} onVote={onVote} />);

    const vote = container.querySelector('button.vote');
    expect(vote).not.toBeDisabled();
    fireEvent.click(vote);

    expect(onVote).toHaveBeenCalled();
  });

  it('does not mark items as done or focused by default', () => {
    const { container } = render(<MoodItem item={makeItem()} />);

    expect(container).not.toContainQuerySelector('.mood-item.done');
    expect(container).not.toContainQuerySelector('.mood-item.focused');
  });

  it('marks the item as done if specified', () => {
    const { container } = render(<MoodItem item={makeItem({ done: true })} />);

    expect(container).toContainQuerySelector('.mood-item.done');
  });

  it('marks the item as focused if specified', () => {
    const { container } = render(<MoodItem item={makeItem()} focused />);

    expect(container).toContainQuerySelector('.mood-item.focused');
  });
});
