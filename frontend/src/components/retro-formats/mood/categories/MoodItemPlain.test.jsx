import React from 'react';
import { mount } from 'enzyme';
import { makeItem } from '../../../../test-helpers/dataFactories';
import 'jest-enzyme';

import MoodItemPlain from './MoodItemPlain';
import VoteCount from './VoteCount';

jest.mock('./VoteCount', () => () => (<div />));

describe('MoodItemPlain', () => {
  it('displays the item message', () => {
    const item = makeItem({ message: 'a message here' });
    const dom = mount(<MoodItemPlain item={item} />);

    expect(dom).toIncludeText('a message here');
  });

  it('displays the vote count', () => {
    const item = makeItem({ votes: 3 });
    const dom = mount(<MoodItemPlain item={item} />);

    expect(dom.find(VoteCount)).toHaveProp({ votes: 3 });
  });

  it('does not mark items as done by default', () => {
    const dom = mount(<MoodItemPlain item={makeItem()} />);

    expect(dom.find('.done')).not.toExist();
  });

  it('marks the item as done if specified', () => {
    const item = makeItem({ done: true });
    const dom = mount(<MoodItemPlain item={item} />);

    expect(dom.find('.done')).toExist();
  });
});
