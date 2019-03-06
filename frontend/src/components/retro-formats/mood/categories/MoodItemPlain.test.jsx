import React from 'react';
import { shallow } from 'enzyme';
import { makeItem } from '../../../../test-helpers/dataFactories';

import { MoodItemPlain } from './MoodItemPlain';
import VoteCount from './VoteCount';

describe('MoodItemPlain', () => {
  it('displays the item message', () => {
    const item = makeItem({ message: 'a message here' });
    const dom = shallow(<MoodItemPlain item={item} />);

    expect(dom.find('.message')).toHaveText('a message here');
  });

  it('displays the vote count', () => {
    const item = makeItem({ votes: 3 });
    const dom = shallow(<MoodItemPlain item={item} />);

    expect(dom.find(VoteCount)).toHaveProp({ votes: 3 });
  });

  it('does not mark items as done by default', () => {
    const dom = shallow(<MoodItemPlain item={makeItem()} />);

    expect(dom).not.toHaveClassName('done');
  });

  it('marks the item as done if specified', () => {
    const item = makeItem({ done: true });
    const dom = shallow(<MoodItemPlain item={item} />);

    expect(dom).toHaveClassName('done');
  });
});
