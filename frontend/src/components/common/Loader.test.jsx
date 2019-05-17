import React from 'react';
import { render } from 'react-testing-library';

import Loader from './Loader';

/* eslint-disable-next-line react/prop-types */
const Component = ({ custom }) => (<div className="my-component" data-custom={custom} />);

describe('Loader', () => {
  const COMPONENT_SELECTOR = '.my-component';

  it('displays a loading message and no content while loading', () => {
    const { container } = render(<Loader Component={Component} loading />);

    expect(container).toHaveTextContent('Loading');
    expect(container).not.toContainQuerySelector(COMPONENT_SELECTOR);
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
    expect(container).toContainQuerySelector(COMPONENT_SELECTOR);
    const component = container.querySelector(COMPONENT_SELECTOR);
    expect(component).toHaveAttribute('data-custom', 'foo');
  });
});
