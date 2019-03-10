import React from 'react';
import { mount } from 'enzyme';
import { makeItem } from '../../../../test-helpers/dataFactories';

import { MoodItem } from './MoodItem';

describe('MoodItem integration', () => {
  const item = makeItem({ message: 'a message here', id: 'my-id', votes: 3 });

  it('displays the item message', () => {
    const dom = mount(<MoodItem item={item} />);

    expect(dom.find('.message')).toHaveText(item.message);
  });

  it('displays the vote count', () => {
    const dom = mount(<MoodItem item={item} />);

    expect(dom.find('.vote')).toHaveText('3');
  });

  it('does not allow voting if no callback is given', () => {
    const dom = mount(<MoodItem item={makeItem()} />);

    expect(dom.find('.vote')).toBeDisabled();
  });

  it('invokes the given callback with the item ID if voted on', () => {
    const onVote = jest.fn().mockName('onVote');
    const dom = mount(<MoodItem item={item} onVote={onVote} />);

    expect(dom.find('.vote')).not.toBeDisabled();
    dom.find('.vote').simulate('click');

    expect(onVote).toHaveBeenCalled();
  });

  it('does not mark items as done or focused by default', () => {
    const dom = mount(<MoodItem item={makeItem()} />);

    expect(dom.find('.mood-item')).not.toHaveClassName('done');
    expect(dom.find('.mood-item')).not.toHaveClassName('focused');
  });

  it('marks the item as done if specified', () => {
    const dom = mount(<MoodItem item={makeItem({ done: true })} />);

    expect(dom.find('.mood-item')).toHaveClassName('done');
  });

  it('marks the item as focused if specified', () => {
    const dom = mount(<MoodItem item={makeItem()} focused />);

    expect(dom.find('.mood-item')).toHaveClassName('focused');
  });
});
