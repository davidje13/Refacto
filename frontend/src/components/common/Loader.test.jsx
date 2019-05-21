import React from 'react';
import { render } from 'react-testing-library';
import mockElement from 'react-mock-element';

import Loader from './Loader';

const Component = mockElement('my-component');

describe('Loader', () => {
  it('displays a loading message and no content while loading', () => {
    const { container } = render(<Loader Component={Component} loading />);

    expect(container).toHaveTextContent('Loading');
    expect(container).not.toContainQuerySelector('my-component');
  });

  it('displays custom loading messages', () => {
    const { container } = render((
      <Loader Component={Component} loading loadingMessage="foobar" />
    ));

    expect(container).toHaveTextContent('foobar');
  });

  it('displays content and no loading message when loaded', () => {
    const { container } = render(<Loader Component={Component} custom="foo" />);

    expect(container).not.toHaveTextContent('Loading');

    const component = container.querySelector('my-component');
    expect(component).not.toEqual(null);
    expect(component.mockProps).toEqual({ custom: 'foo' });
  });
});
