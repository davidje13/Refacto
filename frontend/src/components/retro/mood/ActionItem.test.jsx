import React from 'react';
import { shallow } from 'enzyme';
import ActionItem from './ActionItem';

function makeItem(details) {
  return Object.assign({
    uuid: 'my-uuid',
    created: 0,
    message: 'my message',
  }, details);
}

describe('ActionItem', () => {
  it('displays the item message', () => {
    const item = makeItem({ message: 'a message here' });
    const dom = shallow(<ActionItem item={item} />);

    expect(dom).toIncludeText('a message here');
  });

  it('does not mark items as done by default', () => {
    const item = makeItem({});
    const dom = shallow(<ActionItem item={item} />);

    expect(dom).not.toHaveClassName('done');
  });

  it('marks the item as done if specified', () => {
    const item = makeItem({ done: true });
    const dom = shallow(<ActionItem item={item} />);

    expect(dom).toHaveClassName('done');
  });
});
