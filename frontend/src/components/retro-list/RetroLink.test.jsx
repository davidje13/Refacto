import React from 'react';
import { StaticRouter } from 'react-router-dom';
import { render, fireEvent } from 'react-testing-library';

import RetroLink from './RetroLink';

describe('RetroLink', () => {
  it('links to the retro slug', () => {
    const context = {};
    const { container } = render((
      <StaticRouter location="/" context={context}>
        <RetroLink name="Foo" slug="bar" />
      </StaticRouter>
    ));

    expect(container).toHaveTextContent('Foo');

    const button = container.querySelector('div');
    fireEvent.click(button);

    expect(context.url).toEqual('/retros/bar');
  });
});
