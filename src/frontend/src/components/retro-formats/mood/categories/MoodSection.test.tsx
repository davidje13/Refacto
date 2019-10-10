import React from 'react';
import { render, act } from '@testing-library/react';
import mockElement from 'react-mock-element';
import { makeRetroItem } from 'refacto-entities';
import { queries, css } from '../../../../test-helpers/queries';

import MoodSection from './MoodSection';
import MoodItem from './MoodItem';

jest.mock('../ItemColumn', () => mockElement('mock-item-column'));
jest.mock('../../../common/ExpandingTextEntry', () => mockElement('mock-expanding-text-entry'));

const nop = (): void => {};

describe('MoodSection', () => {
  it('displays a given category title', () => {
    const dom = render((
      <MoodSection category="woo" categoryLabel="woo title" items={[]} />
    ), { queries });

    expect(dom.getBy(css('h2'))).toHaveAttribute('title', 'woo title');
  });

  it('propagates focused ID', () => {
    const dom = render((
      <MoodSection category="" categoryLabel="" items={[]} focusedItemId="b" />
    ), { queries });

    const column = dom.getBy(css('mock-item-column'));
    expect(column.mockProps).toMatchObject({
      focusedItemId: 'b',
    });
  });

  it('displays a list of MoodItem items', () => {
    const items = [
      makeRetroItem({ category: 'abc', message: 'foo' }),
      makeRetroItem({ category: 'abc', message: 'bar' }),
    ];
    const dom = render((
      <MoodSection category="abc" categoryLabel="" items={items} />
    ), { queries });

    const column = dom.getBy(css('mock-item-column'));
    expect(column.mockProps).toMatchObject({
      ItemType: MoodItem,
      items,
    });
  });

  it('filters out items for other categories', () => {
    const items = [
      makeRetroItem({ category: 'nope', message: 'foo' }),
      makeRetroItem({ category: 'yay', message: 'bar' }),
    ];
    const dom = render((
      <MoodSection category="yay" categoryLabel="" items={items} />
    ), { queries });

    const column = dom.getBy(css('mock-item-column'));
    expect(column.mockProps).toMatchObject({
      items: [items[1]],
    });
  });

  it('does not render an input field if no callback is provided', () => {
    const dom = render((
      <MoodSection category="" categoryLabel="" items={[]} />
    ), { queries });

    expect(dom).not.toContainElementWith(css('mock-expanding-text-entry'));
  });

  it('renders an input field if a callback is provided', () => {
    const dom = render((
      <MoodSection
        category=""
        categoryLabel=""
        items={[]}
        onAddItem={nop}
      />
    ), { queries });

    expect(dom).toContainElementWith(css('mock-expanding-text-entry'));
  });

  it('adds the current category to new items', () => {
    const onAddItem = jest.fn().mockName('onAddItem');
    const dom = render((
      <MoodSection
        category="my-category"
        categoryLabel=""
        items={[]}
        onAddItem={onAddItem}
      />
    ), { queries });

    const textEntry = dom.getBy(css('mock-expanding-text-entry'));
    act(() => {
      textEntry.mockProps.onSubmit('my message');
    });

    expect(onAddItem).toHaveBeenCalledWith(
      'my-category',
      { message: 'my message', attachment: null },
    );
  });
});