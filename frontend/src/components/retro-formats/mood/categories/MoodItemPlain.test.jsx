import React from 'react';
import { render } from 'react-testing-library';
import { makeItem } from '../../../../test-helpers/dataFactories';
import mockElement from '../../../../test-helpers/mockElement';

import MoodItemPlain from './MoodItemPlain';

jest.mock('./VoteCount', () => mockElement('fake-vote-count'));

describe('MoodItemPlain', () => {
  it('displays the item message', () => {
    const item = makeItem({ message: 'a message here' });
    const { container } = render(<MoodItemPlain item={item} />);

    expect(container).toHaveTextContent('a message here');
  });

  it('displays the vote count', () => {
    const item = makeItem({ votes: 3 });
    const { container } = render(<MoodItemPlain item={item} />);

    const voteCount = container.querySelector('fake-vote-count');
    expect(voteCount).toHaveMockProps('votes', 3);
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
