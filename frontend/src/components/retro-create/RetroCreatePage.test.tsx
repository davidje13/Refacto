import { Router } from 'wouter';
import { memoryLocation } from 'wouter/memory-location';
import { render } from 'flexible-testing-library-react';

import { RetroCreatePage } from './RetroCreatePage';

describe('RetroCreatePage', () => {
  it('renders without error', () => {
    const location = memoryLocation({ path: '/', record: true });
    render(
      <Router hook={location.hook}>
        <RetroCreatePage />
      </Router>,
    );
  });
});
