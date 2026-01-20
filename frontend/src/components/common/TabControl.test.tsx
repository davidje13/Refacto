import {
  render,
  fireEvent,
  role,
  text,
  type RenderResult,
} from 'flexible-testing-library-react';

import { TabControl } from './TabControl';

describe('TabControl', () => {
  const tabs = [
    {
      key: 'a',
      title: 'A',
      content: <p>first</p>,
      className: 'cls',
    },
    {
      key: 'b',
      title: 'B',
      content: <p>second</p>,
    },
  ];

  let dom: RenderResult;
  let headers: HTMLElement[];

  beforeEach(() => {
    dom = render(<TabControl tabs={tabs} />);
    headers = dom.getAllBy(role('tab'));
  });

  it('renders a tab header for each item', () => {
    expect(headers.length).toEqual(2);
  });

  it('assigns optional class names to headers', () => {
    expect(headers[0]?.parentElement).toHaveClass('cls');
    expect(headers[1]?.parentElement).not.toHaveClass('cls');
  });

  it('marks the current tab as active', () => {
    expect(headers[0]?.parentElement).toHaveClass('active');
    expect(headers[1]?.parentElement).not.toHaveClass('active');
  });

  it('renders the first tab by default', () => {
    expect(dom).toContainElementWith(text('first'));
    expect(dom).not.toContainElementWith(text('second'));
  });

  it('switches tab when a header is clicked', () => {
    fireEvent.click(headers[1]!);

    expect(dom).not.toContainElementWith(text('first'));
    expect(dom).toContainElementWith(text('second'));

    expect(headers[0]?.parentElement).not.toHaveClass('active');
    expect(headers[1]?.parentElement).toHaveClass('active');
  });
});
