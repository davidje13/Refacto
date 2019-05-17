import React from 'react';
import { render } from 'react-testing-library';
import { makeItem } from '../../../../test-helpers/dataFactories';

import MoodItemPlain from './MoodItemPlain';

/* eslint-disable-next-line react/prop-types */
jest.mock('./VoteCount', () => ({ votes }) => (<div className="vote-count" data-votes={votes} />));

describe('MoodItemPlain', () => {
  it('displays the item message', () => {
    const item = makeItem({ message: 'a message here' });
    const { container } = render(<MoodItemPlain item={item} />);

    expect(container).toHaveTextContent('a message here');
  });

  it('displays the vote count', () => {
    const item = makeItem({ votes: 3 });
    const { container } = render(<MoodItemPlain item={item} />);

    const voteCount = container.querySelector('.vote-count');
    expect(voteCount).toHaveAttribute('data-votes', '3');
  });

  it('does not mark items as done by default', () => {
    const { container } = render(<MoodItemPlain item={makeItem()} />);

    expect(container).not.toContainQuerySelector('.done');
  });

  it('marks the item as done if specified', () => {
    const item = makeItem({ done: true });
    const { container } = render(<MoodItemPlain item={item} />);

    expect(container).toContainQuerySelector('.done');
  });
});
