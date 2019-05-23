import React from 'react';
import { render } from 'react-testing-library';
import mockElement from 'react-mock-element';
import { makeItem } from '../../../../test-helpers/dataFactories';
import { queries, css } from '../../../../test-helpers/queries';

import MoodSection from './MoodSection';
import MoodItem from './MoodItem';

jest.mock('../ItemColumn', () => mockElement('mock-item-column'));
jest.mock('../../../common/ExpandingTextEntry', () => mockElement('mock-expanding-text-entry'));

describe('MoodSection', () => {
  it('displays a given category title', () => {
    const dom = render(<MoodSection category="woo" items={[]} />, { queries });

    expect(dom.getBy(css('h2'))).toHaveTextContent('woo');
  });

  it('propagates focused ID', () => {
    const dom = render((
      <MoodSection category="" items={[]} focusedItemId="b" />
    ), { queries });

    const column = dom.getBy(css('mock-item-column'));
    expect(column.mockProps).toMatchObject({
      focusedItemId: 'b',
    });
  });

  it('displays a list of MoodItem items', () => {
    const items = [
      makeItem({ category: 'abc', message: 'foo' }),
      makeItem({ category: 'abc', message: 'bar' }),
    ];
    const dom = render((
      <MoodSection category="abc" items={items} />
    ), { queries });

    const column = dom.getBy(css('mock-item-column'));
    expect(column.mockProps).toMatchObject({
      ItemType: MoodItem,
      items,
    });
  });

  it('filters out items for other categories', () => {
    const items = [
      makeItem({ category: 'nope', message: 'foo' }),
      makeItem({ category: 'yay', message: 'bar' }),
    ];
    const dom = render((
      <MoodSection category="yay" items={items} />
    ), { queries });

    const column = dom.getBy(css('mock-item-column'));
    expect(column.mockProps).toMatchObject({
      items: [items[1]],
    });
  });

  it('does not render an input field if no callback is provided', () => {
    const dom = render(<MoodSection category="" items={[]} />, { queries });

    expect(dom).not.toContainElementWith(css('mock-expanding-text-entry'));
  });

  it('renders an input field if a callback is provided', () => {
    const dom = render((
      <MoodSection category="" items={[]} onAddItem={() => {}} />
    ), { queries });

    expect(dom).toContainElementWith(css('mock-expanding-text-entry'));
  });

  it('adds the current category to new items', () => {
    const onAddItem = jest.fn().mockName('onAddItem');
    const dom = render((
      <MoodSection
        category="my-category"
        items={[]}
        onAddItem={onAddItem}
      />
    ), { queries });

    const textEntry = dom.getBy(css('mock-expanding-text-entry'));
    textEntry.mockProps.onSubmit('my message');

    expect(onAddItem).toHaveBeenCalledWith('my-category', 'my message');
  });
});
