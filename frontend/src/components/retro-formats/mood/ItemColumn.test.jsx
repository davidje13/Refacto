import React from 'react';
import { render } from 'react-testing-library';
import mockElement from 'react-mock-element';
import { makeItem } from '../../../test-helpers/dataFactories';

import ItemColumn from './ItemColumn';

const Item = mockElement('my-item');

describe('ItemColumn', () => {
  it('displays all items', () => {
    const item1 = makeItem({ id: 'a' });
    const item2 = makeItem({ id: 'b' });
    const { container } = render((
      <ItemColumn items={[item1, item2]} ItemType={Item} />
    ));

    expect(container.querySelectorAll('my-item').length).toEqual(2);
  });

  it('orders items newest-first', () => {
    const item1 = makeItem({ id: 'a', created: 100 });
    const item2 = makeItem({ id: 'b', created: 200 });
    const { container } = render((
      <ItemColumn items={[item1, item2]} ItemType={Item} />
    ));

    const displayedItems = container.querySelectorAll('my-item');
    expect(displayedItems[0].mockProps.item).toEqual(item2);
    expect(displayedItems[1].mockProps.item).toEqual(item1);
  });

  it('passes extra props to the items unchanged', () => {
    const item = makeItem();
    const { container } = render((
      <ItemColumn items={[item]} ItemType={Item} foo="bar" />
    ));

    const displayedItems = container.querySelectorAll('my-item');
    expect(displayedItems[0].mockProps.foo).toEqual('bar');
  });

  it('focuses nothing by default', () => {
    const item = makeItem();
    const { container } = render((
      <ItemColumn items={[item]} ItemType={Item} />
    ));

    const displayedItems = container.querySelectorAll('my-item');
    expect(displayedItems[0].mockProps.focused).toEqual(false);
  });

  it('focuses the requested item', () => {
    const item = makeItem();
    const { container } = render((
      <ItemColumn
        items={[item]}
        ItemType={Item}
        focusedItemId={item.id}
      />
    ));

    const displayedItems = container.querySelectorAll('my-item');
    expect(displayedItems[0].mockProps.focused).toEqual(true);
  });
});
