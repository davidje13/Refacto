import React from 'react';
import { render } from 'react-testing-library';
import mockElement from 'react-mock-element';
import { makeItem } from '../../../../test-helpers/dataFactories';

import ActionSection from './ActionSection';
import ActionItem from './ActionItem';

jest.mock('../ItemColumn', () => mockElement('mock-item-column'));

describe('ActionSection', () => {
  it('displays a given title', () => {
    const { container } = render(<ActionSection title="my title" items={[]} />);

    expect(container.querySelector('h3')).toHaveTextContent('my title');
  });

  it('displays a list of ActionItem items', () => {
    const items = [
      makeItem({ category: 'action', message: 'foo' }),
      makeItem({ category: 'action', message: 'bar' }),
    ];
    const { container } = render(<ActionSection title="" items={items} />);

    const column = container.querySelector('mock-item-column');
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
    const { container } = render(<ActionSection title="" items={items} />);

    const column = container.querySelector('mock-item-column');
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

    const { container } = render((
      <ActionSection
        title=""
        items={items}
        rangeFrom={10}
        rangeTo={20}
      />
    ));

    const column = container.querySelector('mock-item-column');
    expect(column.mockProps).toMatchObject({
      items: [items[0]],
    });
  });
});
