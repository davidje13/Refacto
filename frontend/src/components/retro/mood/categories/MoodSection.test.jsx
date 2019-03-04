import React from 'react';
import { shallow } from 'enzyme';
import { makeItem } from '../../../../test-helpers/dataFactories';

import { MoodSection } from './MoodSection';
import MoodItem from './MoodItem';
import ItemColumn from '../ItemColumn';
import ExpandingTextEntry from '../../../common/ExpandingTextEntry';

describe('MoodSection', () => {
  it('displays a given category title', () => {
    const dom = shallow(<MoodSection category="woo" items={[]} />);

    expect(dom.find('h2')).toHaveText('woo');
  });

  it('propagates focused UUID', () => {
    const dom = shallow(<MoodSection category="" items={[]} focusedItemUUID="b" />);

    expect(dom.find(ItemColumn)).toHaveProp({
      focusedItemUUID: 'b',
    });
  });

  it('displays a list of MoodItem items', () => {
    const items = [
      makeItem({ category: 'abc', message: 'foo' }),
      makeItem({ category: 'abc', message: 'bar' }),
    ];
    const dom = shallow(<MoodSection category="abc" items={items} />);

    expect(dom.find(ItemColumn)).toHaveProp({
      ItemType: MoodItem,
      items,
    });
  });

  it('filters out items for other categories', () => {
    const items = [
      makeItem({ category: 'nope', message: 'foo' }),
      makeItem({ category: 'yay', message: 'bar' }),
    ];
    const dom = shallow(<MoodSection category="yay" items={items} />);

    expect(dom.find(ItemColumn)).toHaveProp({
      items: [items[1]],
    });
  });

  it('does not render an input field if no callback is provided', () => {
    const dom = shallow(<MoodSection category="" items={[]} />);

    expect(dom.find(ExpandingTextEntry)).not.toExist();
  });

  it('renders an input field if a callback is provided', () => {
    const dom = shallow(<MoodSection category="" items={[]} onAddItem={() => {}} />);

    expect(dom.find(ExpandingTextEntry)).toExist();
  });

  it('adds the current category to new items', () => {
    const onAddItem = jest.fn().mockName('onAddItem');
    const dom = shallow((
      <MoodSection
        category="my-category"
        items={[]}
        onAddItem={onAddItem}
      />
    ));

    dom.find(ExpandingTextEntry).props().onSubmit('my message');

    expect(onAddItem).toHaveBeenCalledWith('my-category', 'my message');
  });
});
