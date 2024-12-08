import { Router } from 'wouter';
import { memoryLocation } from 'wouter/memory-location';
import { act, render } from 'flexible-testing-library-react';

import { App } from './App';

describe('App', () => {
  it('renders without error', async () => {
    const location = memoryLocation({ path: '/', record: true });
    render(
      <Router hook={location.hook}>
        <App />
      </Router>,
    );
    await act(() => Promise.resolve()); // slug existence update
  });
});
