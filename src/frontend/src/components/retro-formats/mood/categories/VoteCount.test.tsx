import React from 'react';
import { act, render, fireEvent } from 'flexible-testing-library-react';
import { css } from '../../../../test-helpers/queries';

import VoteCount from './VoteCount';

describe('VoteCount', () => {
  it('displays the vote count', () => {
    const dom = render(<VoteCount votes={3} />);

    expect(dom.getBy(css('button.vote'))).toHaveTextContent('3');
  });

  it('does not allow voting if no callback is given', () => {
    const dom = render(<VoteCount votes={3} />);

    expect(dom.getBy(css('button.vote'))).toBeDisabled();
  });

  it('invokes the given callback if voted on', async () => {
    const onVote = jest.fn().mockName('onVote');
    const dom = render(<VoteCount votes={3} onVote={onVote} />);

    const voteButton = dom.getBy(css('button.vote'));
    expect(voteButton).toBeEnabled();
    fireEvent.click(voteButton);

    expect(onVote).toHaveBeenCalled();
  });

  it('blocks repeated votes in a short time period', async () => {
    const onVote = jest.fn().mockName('onVote');
    const dom = render(<VoteCount votes={3} onVote={onVote} />);

    const voteButton = dom.getBy(css('button.vote'));
    expect(voteButton).toBeEnabled();
    fireEvent.click(voteButton);
    fireEvent.click(voteButton);

    expect(onVote).toHaveBeenCalledTimes(1);
  });

  it('allows repeated votes after a delay', async () => {
    const onVote = jest.fn().mockName('onVote');
    const dom = render(<VoteCount votes={3} onVote={onVote} />);

    const voteButton = dom.getBy(css('button.vote'));
    expect(voteButton).toBeEnabled();
    fireEvent.click(voteButton);
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    fireEvent.click(voteButton);

    expect(onVote).toHaveBeenCalledTimes(2);
  });
});
