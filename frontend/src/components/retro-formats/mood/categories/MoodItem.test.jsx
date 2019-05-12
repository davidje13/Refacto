import React from 'react';
import { mount } from 'enzyme';
import { makeItem } from '../../../../test-helpers/dataFactories';
import 'jest-enzyme';

import MoodItem from './MoodItem';

describe('MoodItem integration', () => {
  const item = makeItem({ message: 'a message here', id: 'my-id', votes: 3 });

  it('displays the item message', () => {
    const dom = mount(<MoodItem item={item} />);

    expect(dom.find('button.message')).toHaveText(item.message);
  });

  it('displays the vote count', () => {
    const dom = mount(<MoodItem item={item} />);

    expect(dom.find('button.vote')).toHaveText('3');
  });

  it('does not allow voting if no callback is given', () => {
    const dom = mount(<MoodItem item={makeItem()} />);

    expect(dom.find('button.vote')).toBeDisabled();
  });

  it('invokes the given callback with the item ID if voted on', () => {
    const onVote = jest.fn().mockName('onVote');
    const dom = mount(<MoodItem item={item} onVote={onVote} />);

    expect(dom.find('button.vote')).not.toBeDisabled();
    dom.find('button.vote').simulate('click');

    expect(onVote).toHaveBeenCalled();
  });

  it('does not mark items as done or focused by default', () => {
    const dom = mount(<MoodItem item={makeItem()} />);

    expect(dom.find('.mood-item.done')).not.toExist();
    expect(dom.find('.mood-item.focused')).not.toExist();
  });

  it('marks the item as done if specified', () => {
    const dom = mount(<MoodItem item={makeItem({ done: true })} />);

    expect(dom.find('.mood-item.done')).toExist();
  });

  it('marks the item as focused if specified', () => {
    const dom = mount(<MoodItem item={makeItem()} focused />);

    expect(dom.find('.mood-item.focused')).toExist();
  });
});
