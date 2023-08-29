import React from 'react';
import { render } from 'flexible-testing-library-react';
import mockElement from 'react-mock-element';
import { makeRetroItem } from '../../../../shared/api-entities';
import { css } from '../../../../test-helpers/queries';

import ActionSection from './ActionSection';
import ActionItem from './ActionItem';

jest.mock('../ItemColumn', () => mockElement('mock-item-column'));

describe('ActionSection', () => {
  it('displays a given title', () => {
    const dom = render(<ActionSection title="my title" items={[]} />);

    expect(dom.getBy(css('h3'))).toHaveTextContent('my title');
  });

  it('displays a list of ActionItem items', () => {
    const items = [
      makeRetroItem({ category: 'action', message: 'foo' }),
      makeRetroItem({ category: 'action', message: 'bar' }),
    ];
    const dom = render(<ActionSection title="" items={items} />);

    const column = dom.getBy(css('mock-item-column'));
    expect(column.mockProps).toMatchObject({
      ItemType: ActionItem,
      items,
    });
  });

  it('filters out non-action items', () => {
    const items = [
      makeRetroItem({ category: 'nope', message: 'foo' }),
      makeRetroItem({ category: 'action', message: 'bar' }),
    ];
    const dom = render(<ActionSection title="" items={items} />);

    const column = dom.getBy(css('mock-item-column'));
    expect(column.mockProps).toMatchObject({
      items: [items[1]],
    });
  });

  it('filters by created date', () => {
    const items = [
      makeRetroItem({ category: 'action', created: 15 }),
      makeRetroItem({ category: 'action', created: 5 }),
      makeRetroItem({ category: 'action', created: 25 }),
    ];

    const dom = render(
      <ActionSection title="" items={items} rangeFrom={10} rangeTo={20} />,
    );

    const column = dom.getBy(css('mock-item-column'));
    expect(column.mockProps).toMatchObject({
      items: [items[0]],
    });
  });
});
