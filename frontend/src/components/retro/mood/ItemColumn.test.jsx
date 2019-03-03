import React from 'react';
import { shallow } from 'enzyme';
import { makeItem } from '../../../test-helpers/dataFactories';

import { ItemColumn } from './ItemColumn';

const Item = () => (<div />);

describe('ItemColumn', () => {
  it('displays all items', () => {
    const item1 = makeItem({ uuid: 'a' });
    const item2 = makeItem({ uuid: 'b' });
    const dom = shallow(<ItemColumn items={[item1, item2]} ItemType={Item} />);

    expect(dom.find(Item).length).toEqual(2);
  });

  it('orders items newest-first', () => {
    const item1 = makeItem({ uuid: 'a', created: 100 });
    const item2 = makeItem({ uuid: 'b', created: 200 });
    const dom = shallow(<ItemColumn items={[item1, item2]} ItemType={Item} />);

    const displayedItems = dom.find(Item);
    expect(displayedItems.at(0)).toHaveProp({ item: item2 });
    expect(displayedItems.at(1)).toHaveProp({ item: item1 });
  });

  it('passes extra props to the items unchanged', () => {
    const item = makeItem();
    const dom = shallow(<ItemColumn items={[item]} ItemType={Item} foo="bar" />);

    const displayedItems = dom.find(Item);
    expect(displayedItems.at(0)).toHaveProp({ foo: 'bar' });
  });

  it('focusses nothing by default', () => {
    const item = makeItem();
    const dom = shallow(<ItemColumn items={[item]} ItemType={Item} />);

    expect(dom.find(Item)).toHaveProp({ focused: false });
  });

  it('focusses the requested item', () => {
    const item = makeItem();
    const dom = shallow((
      <ItemColumn
        items={[item]}
        ItemType={Item}
        focusedItemUUID={item.uuid}
      />
    ));

    expect(dom.find(Item)).toHaveProp({ focused: true });
  });
});
