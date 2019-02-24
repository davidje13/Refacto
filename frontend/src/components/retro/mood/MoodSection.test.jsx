import React from 'react';
import { shallow } from 'enzyme';
import { makeItem } from '../../../test-helpers/dataFactories';

import { MoodSection } from './MoodSection';
import ItemColumn from './ItemColumn';
import MoodItem from './MoodItem';

describe('MoodSection', () => {
  it('displays a given category title', () => {
    const dom = shallow(<MoodSection category="woo" items={[]} />);

    expect(dom.find('h3')).toHaveText('woo');
  });

  it('propagates focussed UUID', () => {
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
});
