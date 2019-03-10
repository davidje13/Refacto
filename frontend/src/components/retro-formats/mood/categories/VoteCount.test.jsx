import React from 'react';
import { shallow, mount } from 'enzyme';

import { VoteCount } from './VoteCount';

describe('VoteCount', () => {
  it('displays the vote count', () => {
    const dom = shallow(<VoteCount votes={3} />);

    expect(dom.find('.vote')).toHaveText('3');
  });

  it('does not allow voting if no callback is given', () => {
    const dom = mount(<VoteCount votes={3} />);

    expect(dom.find('button.vote')).toBeDisabled();
  });

  it('invokes the given callback if voted on', () => {
    const onVote = jest.fn().mockName('onVote');
    const dom = mount(<VoteCount votes={3} onVote={onVote} />);

    expect(dom.find('button.vote')).not.toBeDisabled();
    dom.find('button.vote').simulate('click');

    expect(onVote).toHaveBeenCalled();
  });
});
