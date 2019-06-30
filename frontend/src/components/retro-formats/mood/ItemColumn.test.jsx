import React from 'react';
import { render } from '@testing-library/react';
import mockElement from 'react-mock-element';
import { makeItem } from '../../../test-helpers/dataFactories';
import { queries, css } from '../../../test-helpers/queries';

import ItemColumn from './ItemColumn';

const Item = mockElement('my-item');

describe('ItemColumn', () => {
  it('displays all items', () => {
    const item1 = makeItem({ id: 'a' });
    const item2 = makeItem({ id: 'b' });
    const dom = render((
      <ItemColumn items={[item1, item2]} ItemType={Item} />
    ), { queries });

    expect(dom.getAllBy(css('my-item')).length).toEqual(2);
  });

  it('orders items newest-first', () => {
    const item1 = makeItem({ id: 'a', created: 100 });
    const item2 = makeItem({ id: 'b', created: 200 });
    const dom = render((
      <ItemColumn items={[item1, item2]} ItemType={Item} />
    ), { queries });

    const displayedItems = dom.getAllBy(css('my-item'));
    expect(displayedItems[0].mockProps.item).toEqual(item2);
    expect(displayedItems[1].mockProps.item).toEqual(item1);
  });

  it('passes extra props to the items unchanged', () => {
    const item = makeItem();
    const dom = render((
      <ItemColumn items={[item]} ItemType={Item} foo="bar" />
    ), { queries });

    const displayedItems = dom.getAllBy(css('my-item'));
    expect(displayedItems[0].mockProps.foo).toEqual('bar');
  });

  it('focuses nothing by default', () => {
    const item = makeItem();
    const dom = render((
      <ItemColumn items={[item]} ItemType={Item} />
    ), { queries });

    const displayedItems = dom.getAllBy(css('my-item'));
    expect(displayedItems[0].mockProps.focused).toEqual(false);
  });

  it('focuses the requested item', () => {
    const item = makeItem();
    const dom = render((
      <ItemColumn
        items={[item]}
        ItemType={Item}
        focusedItemId={item.id}
      />
    ), { queries });

    const displayedItems = dom.getAllBy(css('my-item'));
    expect(displayedItems[0].mockProps.focused).toEqual(true);
  });
});
