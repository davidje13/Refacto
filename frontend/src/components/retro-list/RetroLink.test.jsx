import React from 'react';
import { StaticRouter } from 'react-router-dom';
import { render, fireEvent } from '@testing-library/react';
import { queries, text } from '../../test-helpers/queries';

import RetroLink from './RetroLink';

describe('RetroLink', () => {
  it('links to the retro slug', () => {
    const context = {};
    const dom = render((
      <StaticRouter location="/" context={context}>
        <RetroLink name="Foo" slug="bar" />
      </StaticRouter>
    ), { queries });

    const button = dom.getBy(text('Foo'));
    fireEvent.click(button);

    expect(context.url).toEqual('/retros/bar');
  });
});
