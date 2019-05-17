import React from 'react';
import { render, fireEvent } from 'react-testing-library';

import TabControl from './TabControl';

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

  let rendered;
  let headers;

  beforeEach(() => {
    rendered = render(<TabControl tabs={tabs} />);
    headers = rendered.container.querySelectorAll('button');
  });

  it('renders a tab header for each item', () => {
    expect(headers.length).toEqual(2);
  });

  it('assigns optional class names to headers', () => {
    expect(headers[0]).toHaveClass('cls');
    expect(headers[1]).not.toHaveClass('cls');
  });

  it('marks the current tab as active', () => {
    expect(headers[0]).toHaveClass('active');
    expect(headers[1]).not.toHaveClass('active');
  });

  it('renders the first tab by default', () => {
    expect(rendered.container).toContainQuerySelector('strong');
    expect(rendered.container).not.toContainQuerySelector('em');
  });

  it('switches tab when a header is clicked', () => {
    fireEvent.click(headers[1]);

    expect(rendered.container).not.toContainQuerySelector('strong');
    expect(rendered.container).toContainQuerySelector('em');

    expect(headers[0]).not.toHaveClass('active');
    expect(headers[1]).toHaveClass('active');
  });
});
