import React from 'react';
import { shallow } from 'enzyme';
import { makeItem } from '../../../../test-helpers/dataFactories';

import { MoodItem } from './MoodItem';

describe('MoodItem', () => {
  it('displays the item message', () => {
    const item = makeItem({ message: 'a message here' });
    const dom = shallow(<MoodItem item={item} />);

    expect(dom).toIncludeText('a message here');
  });

  it('displays the vote count', () => {
    const item = makeItem({ votes: 3 });
    const dom = shallow(<MoodItem item={item} />);

    expect(dom).toIncludeText('+3');
  });

  it('does not mark items as done or focused by default', () => {
    const item = makeItem({});
    const dom = shallow(<MoodItem item={item} />);

    expect(dom).not.toHaveClassName('done');
    expect(dom).not.toHaveClassName('focused');
  });

  it('marks the item as done if specified', () => {
    const item = makeItem({ done: true });
    const dom = shallow(<MoodItem item={item} />);

    expect(dom).toHaveClassName('done');
  });

  it('marks the item as focused if specified', () => {
    const item = makeItem({});
    const dom = shallow(<MoodItem item={item} focused />);

    expect(dom).toHaveClassName('focused');
  });
});
