import React from 'react';
import { Router } from 'wouter';
import staticLocationHook from 'wouter/static-location';
import { render, fireEvent, text } from 'flexible-testing-library-react';

import RetroLink from './RetroLink';

describe('RetroLink', () => {
  it('links to the retro slug', () => {
    const locationHook = staticLocationHook('/', { record: true });
    const dom = render((
      <Router hook={locationHook}>
        <RetroLink name="Foo" slug="bar" />
      </Router>
    ));

    const button = dom.getBy(text('Foo'));
    fireEvent.click(button);

    expect(locationHook.history).toEqual(['/', '/retros/bar']);
  });
});
