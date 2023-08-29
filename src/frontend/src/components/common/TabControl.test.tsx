import React from 'react';
import {
  render,
  fireEvent,
  RenderResult,
} from 'flexible-testing-library-react';
import { css } from '../../test-helpers/queries';

import TabControl from './TabControl';

describe('TabControl', () => {
  const tabs = [
    {
      key: 'a',
      title: 'A',
      content: <strong>A</strong>,
      className: 'cls',
    },
    {
      key: 'b',
      title: 'B',
      content: <em>B</em>,
    },
  ];

  let dom: RenderResult;
  let headers: HTMLElement[];

  beforeEach(() => {
    dom = render(<TabControl tabs={tabs} />);
    headers = dom.getAllBy(css('button'));
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
    expect(dom).toContainElementWith(css('strong'));
    expect(dom).not.toContainElementWith(css('em'));
  });

  it('switches tab when a header is clicked', () => {
    fireEvent.click(headers[1]);

    expect(dom).not.toContainElementWith(css('strong'));
    expect(dom).toContainElementWith(css('em'));

    expect(headers[0]).not.toHaveClass('active');
    expect(headers[1]).toHaveClass('active');
  });
});
