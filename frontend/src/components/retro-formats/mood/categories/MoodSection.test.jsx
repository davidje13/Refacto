import React from 'react';
import { render } from 'react-testing-library';
import { makeItem } from '../../../../test-helpers/dataFactories';
import mockElement from '../../../../test-helpers/mockElement';
import mockPropStorage from '../../../../test-helpers/mockPropStorage';

import MoodSection from './MoodSection';
import MoodItem from './MoodItem';

jest.mock('../ItemColumn', () => mockElement('fake-item-column'));
jest.mock('../../../common/ExpandingTextEntry', () => mockElement('fake-expanding-text-entry'));

describe('MoodSection', () => {
  it('displays a given category title', () => {
    const { container } = render(<MoodSection category="woo" items={[]} />);

    expect(container.querySelector('h2')).toHaveTextContent('woo');
  });

  it('propagates focused ID', () => {
    const { container } = render((
      <MoodSection category="" items={[]} focusedItemId="b" />
    ));

    expect(container.querySelector('fake-item-column')).toHaveMockProps({
      focusedItemId: 'b',
    });
  });

  it('displays a list of MoodItem items', () => {
    const items = [
      makeItem({ category: 'abc', message: 'foo' }),
      makeItem({ category: 'abc', message: 'bar' }),
    ];
    const { container } = render(<MoodSection category="abc" items={items} />);

    expect(container.querySelector('fake-item-column')).toHaveMockProps({
      ItemType: MoodItem,
      items,
    });
  });

  it('filters out items for other categories', () => {
    const items = [
      makeItem({ category: 'nope', message: 'foo' }),
      makeItem({ category: 'yay', message: 'bar' }),
    ];
    const { container } = render(<MoodSection category="yay" items={items} />);

    expect(container.querySelector('fake-item-column')).toHaveMockProps({
      items: [items[1]],
    });
  });

  it('does not render an input field if no callback is provided', () => {
    const { container } = render(<MoodSection category="" items={[]} />);

    expect(container).not.toContainQuerySelector('fake-expanding-text-entry');
  });

  it('renders an input field if a callback is provided', () => {
    const { container } = render((
      <MoodSection category="" items={[]} onAddItem={() => {}} />
    ));

    expect(container).toContainQuerySelector('fake-expanding-text-entry');
  });

  it('adds the current category to new items', () => {
    const onAddItem = jest.fn().mockName('onAddItem');
    const { container } = render((
      <MoodSection
        category="my-category"
        items={[]}
        onAddItem={onAddItem}
      />
    ));

    const textEntry = container.querySelector('fake-expanding-text-entry');
    mockPropStorage.get(textEntry).onSubmit('my message');

    expect(onAddItem).toHaveBeenCalledWith('my-category', 'my message');
  });
});
