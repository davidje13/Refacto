import { Router } from 'wouter';
import { memoryLocation } from 'wouter/memory-location';
import { render, fireEvent, text } from 'flexible-testing-library-react';

import { RetroLink } from './RetroLink';

describe('RetroLink', () => {
  it('links to the retro slug', () => {
    const location = memoryLocation({ path: '/', record: true });
    const dom = render(
      <Router hook={location.hook}>
        <RetroLink name="Foo" slug="bar" />
      </Router>,
    );

    const button = dom.getBy(text('Foo'));
    fireEvent.click(button);

    expect(location.history).toEqual(['/', '/retros/bar']);
  });
});
