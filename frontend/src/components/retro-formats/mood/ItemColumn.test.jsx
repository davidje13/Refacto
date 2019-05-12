import React from 'react';
import { mount } from 'enzyme';
import { makeItem } from '../../../test-helpers/dataFactories';
import 'jest-enzyme';

import ItemColumn from './ItemColumn';

const Item = () => (<div />);

describe('ItemColumn', () => {
  it('displays all items', () => {
    const item1 = makeItem({ id: 'a' });
    const item2 = makeItem({ id: 'b' });
    const dom = mount(<ItemColumn items={[item1, item2]} ItemType={Item} />);

    expect(dom.find(Item).length).toEqual(2);
  });

  it('orders items newest-first', () => {
    const item1 = makeItem({ id: 'a', created: 100 });
    const item2 = makeItem({ id: 'b', created: 200 });
    const dom = mount(<ItemColumn items={[item1, item2]} ItemType={Item} />);

    const displayedItems = dom.find(Item);
    expect(displayedItems.at(0)).toHaveProp({ item: item2 });
    expect(displayedItems.at(1)).toHaveProp({ item: item1 });
  });

  it('passes extra props to the items unchanged', () => {
    const item = makeItem();
    const dom = mount(<ItemColumn items={[item]} ItemType={Item} foo="bar" />);

    const displayedItems = dom.find(Item);
    expect(displayedItems.at(0)).toHaveProp({ foo: 'bar' });
  });

  it('focuses nothing by default', () => {
    const item = makeItem();
    const dom = mount(<ItemColumn items={[item]} ItemType={Item} />);

    expect(dom.find(Item)).toHaveProp({ focused: false });
  });

  it('focuses the requested item', () => {
    const item = makeItem();
    const dom = mount((
      <ItemColumn
        items={[item]}
        ItemType={Item}
        focusedItemId={item.id}
      />
    ));

    expect(dom.find(Item)).toHaveProp({ focused: true });
  });
});
