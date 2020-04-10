import React from 'react';
import { Router } from 'wouter';
import { render, fireEvent } from '@testing-library/react';
import staticLocationHook from '../../test-helpers/staticLocationHook';
import { queries, text } from '../../test-helpers/queries';

import RetroLink from './RetroLink';

describe('RetroLink', () => {
  it('links to the retro slug', () => {
    const locationHook = staticLocationHook();
    const dom = render((
      <Router hook={locationHook}>
        <RetroLink name="Foo" slug="bar" />
      </Router>
    ), { queries });

    const button = dom.getBy(text('Foo'));
    fireEvent.click(button);

    expect(locationHook.locationHistory).toEqual(['/', '/retros/bar']);
  });
});
