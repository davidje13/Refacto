import React from 'react';
import { render, fireEvent } from 'react-testing-library';

import VoteCount from './VoteCount';

describe('VoteCount', () => {
  it('displays the vote count', () => {
    const { container } = render(<VoteCount votes={3} />);

    expect(container.querySelector('button.vote')).toHaveTextContent('3');
  });

  it('does not allow voting if no callback is given', () => {
    const { container } = render(<VoteCount votes={3} />);

    expect(container.querySelector('button.vote')).toBeDisabled();
  });

  it('invokes the given callback if voted on', async () => {
    const onVote = jest.fn().mockName('onVote');
    const { container } = render(<VoteCount votes={3} onVote={onVote} />);

    const voteButton = container.querySelector('button.vote');
    expect(voteButton).toBeEnabled();
    fireEvent.click(voteButton);

    expect(onVote).toHaveBeenCalled();
  });
});
