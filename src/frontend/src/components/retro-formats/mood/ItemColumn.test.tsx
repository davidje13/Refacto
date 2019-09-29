import React from 'react';
import { render } from '@testing-library/react';
import mockElement from 'react-mock-element';
import { makeRetroItem } from 'refacto-entities';
import { queries, css } from '../../../test-helpers/queries';

import ItemColumn from './ItemColumn';

const Item = mockElement('my-item');

describe('ItemColumn', () => {
  it('displays all items', () => {
    const item1 = makeRetroItem({ id: 'a' });
    const item2 = makeRetroItem({ id: 'b' });
    const dom = render((
      <ItemColumn items={[item1, item2]} ItemType={Item} itemProps={{}} />
    ), { queries });

    expect(dom.getAllBy(css('my-item')).length).toEqual(2);
  });

  it('orders items newest-first', () => {
    const item1 = makeRetroItem({ id: 'a', created: 100 });
    const item2 = makeRetroItem({ id: 'b', created: 200 });
    const dom = render((
      <ItemColumn items={[item1, item2]} ItemType={Item} itemProps={{}} />
    ), { queries });

    const displayedItems = dom.getAllBy(css('my-item'));
    expect(displayedItems[0].mockProps.item).toEqual(item2);
    expect(displayedItems[1].mockProps.item).toEqual(item1);
  });

  it('passes item props to the items unchanged', () => {
    const item = makeRetroItem();
    const dom = render((
      <ItemColumn items={[item]} ItemType={Item} itemProps={{ foo: 'bar' }} />
    ), { queries });

    const displayedItems = dom.getAllBy(css('my-item'));
    expect(displayedItems[0].mockProps.foo).toEqual('bar');
  });

  it('focuses nothing by default', () => {
    const item = makeRetroItem();
    const dom = render((
      <ItemColumn items={[item]} ItemType={Item} itemProps={{}} />
    ), { queries });

    const displayedItems = dom.getAllBy(css('my-item'));
    expect(displayedItems[0].mockProps.focused).toEqual(false);
  });

  it('focuses the requested item', () => {
    const item = makeRetroItem();
    const dom = render((
      <ItemColumn
        items={[item]}
        ItemType={Item}
        focusedItemId={item.id}
        itemProps={{}}
      />
    ), { queries });

    const displayedItems = dom.getAllBy(css('my-item'));
    expect(displayedItems[0].mockProps.focused).toEqual(true);
  });
});
