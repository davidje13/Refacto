import React from 'react';
import { shallow } from 'enzyme';

import { TabControl } from './TabControl';

function click(wrapper) {
  wrapper.simulate('click', {
    target: {
      dataset: { key: wrapper.props()['data-key'] },
    },
  });
}

describe('TabControl', () => {
  const tabs = [
    {
      key: 'a',
      title: 'A',
      content: (<strong>A</strong>),
      className: 'cls',
    },
    {
      key: 'b',
      title: 'B',
      content: (<em>B</em>),
    },
  ];

  let dom;
  let headers;

  beforeEach(() => {
    dom = shallow(<TabControl tabs={tabs} />);
    headers = dom.find('button');
  });

  it('renders a tab header for each item', () => {
    expect(headers.length).toEqual(2);
  });

  it('assigns optional class names to headers', () => {
    expect(headers.at(0)).toHaveClassName('cls');
    expect(headers.at(1)).not.toHaveClassName('cls');
  });

  it('marks the current tab as active', () => {
    expect(headers.at(0)).toHaveClassName('active');
    expect(headers.at(1)).not.toHaveClassName('active');
  });

  it('renders the first tab by default', () => {
    expect(dom.find('strong')).toExist();
    expect(dom.find('em')).not.toExist();
  });

  it('switches tab when a header is clicked', () => {
    click(headers.at(1));

    expect(dom.find('strong')).not.toExist();
    expect(dom.find('em')).toExist();

    headers = dom.find('button');
    expect(headers.at(1)).toHaveClassName('active');
    expect(headers.at(0)).not.toHaveClassName('active');
  });
});
