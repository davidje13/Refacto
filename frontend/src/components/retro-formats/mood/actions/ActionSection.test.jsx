import React from 'react';
import { render } from 'react-testing-library';
import mockElement from 'react-mock-element';
import { makeItem } from '../../../../test-helpers/dataFactories';
import { queries, css } from '../../../../test-helpers/queries';

import ActionSection from './ActionSection';
import ActionItem from './ActionItem';

jest.mock('../ItemColumn', () => mockElement('mock-item-column'));

describe('ActionSection', () => {
  it('displays a given title', () => {
    const dom = render((
      <ActionSection title="my title" items={[]} />
    ), { queries });

    expect(dom.getBy(css('h3'))).toHaveTextContent('my title');
  });

  it('displays a list of ActionItem items', () => {
    const items = [
      makeItem({ category: 'action', message: 'foo' }),
      makeItem({ category: 'action', message: 'bar' }),
    ];
    const dom = render((
      <ActionSection title="" items={items} />
    ), { queries });

    const column = dom.getBy(css('mock-item-column'));
    expect(column.mockProps).toMatchObject({
      ItemType: ActionItem,
      items,
    });
  });

  it('filters out non-action items', () => {
    const items = [
      makeItem({ category: 'nope', message: 'foo' }),
      makeItem({ category: 'action', message: 'bar' }),
    ];
    const dom = render((
      <ActionSection title="" items={items} />
    ), { queries });

    const column = dom.getBy(css('mock-item-column'));
    expect(column.mockProps).toMatchObject({
      items: [items[1]],
    });
  });

  it('filters by created date', () => {
    const items = [
      makeItem({ category: 'action', created: 15 }),
      makeItem({ category: 'action', created: 5 }),
      makeItem({ category: 'action', created: 25 }),
    ];

    const dom = render((
      <ActionSection
        title=""
        items={items}
        rangeFrom={10}
        rangeTo={20}
      />
    ), { queries });

    const column = dom.getBy(css('mock-item-column'));
    expect(column.mockProps).toMatchObject({
      items: [items[0]],
    });
  });
});
