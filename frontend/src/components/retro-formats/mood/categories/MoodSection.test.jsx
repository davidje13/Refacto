import React from 'react';
import { mount } from 'enzyme';
import { makeItem } from '../../../../test-helpers/dataFactories';
import 'jest-enzyme';

import MoodSection from './MoodSection';
import MoodItem from './MoodItem';
import ItemColumn from '../ItemColumn';
import ExpandingTextEntry from '../../../common/ExpandingTextEntry';

jest.mock('../ItemColumn', () => () => (<div />));
jest.mock('../../../common/ExpandingTextEntry', () => () => (<div />));

describe('MoodSection', () => {
  it('displays a given category title', () => {
    const dom = mount(<MoodSection category="woo" items={[]} />);

    expect(dom.find('h2')).toHaveText('woo');
  });

  it('propagates focused ID', () => {
    const dom = mount(<MoodSection category="" items={[]} focusedItemId="b" />);

    expect(dom.find(ItemColumn)).toHaveProp({
      focusedItemId: 'b',
    });
  });

  it('displays a list of MoodItem items', () => {
    const items = [
      makeItem({ category: 'abc', message: 'foo' }),
      makeItem({ category: 'abc', message: 'bar' }),
    ];
    const dom = mount(<MoodSection category="abc" items={items} />);

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
    const dom = mount(<MoodSection category="yay" items={items} />);

    expect(dom.find(ItemColumn)).toHaveProp({
      items: [items[1]],
    });
  });

  it('does not render an input field if no callback is provided', () => {
    const dom = mount(<MoodSection category="" items={[]} />);

    expect(dom.find(ExpandingTextEntry)).not.toExist();
  });

  it('renders an input field if a callback is provided', () => {
    const dom = mount(<MoodSection category="" items={[]} onAddItem={() => {}} />);

    expect(dom.find(ExpandingTextEntry)).toExist();
  });

  it('adds the current category to new items', () => {
    const onAddItem = jest.fn().mockName('onAddItem');
    const dom = mount((
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
