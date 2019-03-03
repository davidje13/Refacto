import React from 'react';
import { shallow } from 'enzyme';
import { makeItem } from '../../../../test-helpers/dataFactories';

import { MoodItem } from './MoodItem';

describe('MoodItem', () => {
  it('displays the item message', () => {
    const item = makeItem({ message: 'a message here' });
    const dom = shallow(<MoodItem item={item} />);

    expect(dom.find('.message')).toHaveText('a message here');
  });

  it('displays the vote count', () => {
    const item = makeItem({ votes: 3 });
    const dom = shallow(<MoodItem item={item} />);

    expect(dom.find('.vote')).toHaveText('3');
  });

  it('does not allow voting if no callback is given', () => {
    const dom = shallow(<MoodItem item={makeItem()} />);

    expect(dom.find('.vote')).toBeDisabled();
  });

  it('invokes the given callback with the item UUID if voted on', () => {
    const onVote = jest.fn().mockName('onVote');
    const item = makeItem({ uuid: 'my-uuid' });
    const dom = shallow(<MoodItem item={item} onVote={onVote} />);

    expect(dom.find('.vote')).not.toBeDisabled();
    dom.find('.vote').simulate('click');

    expect(onVote).toHaveBeenCalledWith('my-uuid');
  });

  it('does not mark items as done or focused by default', () => {
    const dom = shallow(<MoodItem item={makeItem()} />);

    expect(dom).not.toHaveClassName('done');
    expect(dom).not.toHaveClassName('focused');
  });

  it('marks the item as done if specified', () => {
    const item = makeItem({ done: true });
    const dom = shallow(<MoodItem item={item} />);

    expect(dom).toHaveClassName('done');
  });

  it('marks the item as focused if specified', () => {
    const dom = shallow(<MoodItem item={makeItem()} focused />);

    expect(dom).toHaveClassName('focused');
  });
});
