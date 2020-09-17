import React from 'react';
import { render, textFragment } from 'flexible-testing-library-react';
import mockElement from 'react-mock-element';
import { css } from '../../test-helpers/queries';

import Loader from './Loader';

const Component = mockElement('my-component');

describe('Loader', () => {
  it('displays a loading message and no content while loading', () => {
    const dom = render((
      <Loader
        Component={Component}
        componentProps={null}
      />
    ));

    expect(dom).toContainElementWith(textFragment('Loading'));
    expect(dom).not.toContainElementWith(css('my-component'));
  });

  it('displays custom loading messages', () => {
    const dom = render((
      <Loader
        Component={Component}
        componentProps={null}
        loadingMessage="foobar"
      />
    ));

    expect(dom).toContainElementWith(textFragment('foobar'));
  });

  it('displays content and no loading message when loaded', () => {
    const dom = render((
      <Loader
        Component={Component}
        componentProps={{ custom: 'foo' }}
      />
    ));

    expect(dom).not.toContainElementWith(textFragment('Loading'));

    const component = dom.getBy(css('my-component'));
    expect(component.mockProps).toEqual({ custom: 'foo' });
  });
});
