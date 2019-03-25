import React from 'react';
import { mount } from 'enzyme';
import { makeItem } from '../../../../test-helpers/dataFactories';

import ActionItem from './ActionItem';

describe('ActionItem', () => {
  it('displays the item message', () => {
    const item = makeItem({ message: 'a message here' });
    const dom = mount(<ActionItem item={item} />);

    expect(dom).toIncludeText('a message here');
  });

  it('does not mark items as done by default', () => {
    const item = makeItem();
    const dom = mount(<ActionItem item={item} />);

    expect(dom.find('.done')).not.toExist();
  });

  it('marks the item as done if specified', () => {
    const item = makeItem({ done: true });
    const dom = mount(<ActionItem item={item} />);

    expect(dom.find('.done')).toExist();
  });
});
