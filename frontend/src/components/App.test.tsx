import { Router } from 'wouter';
import staticLocationHook from 'wouter/static-location';
import { act, render } from 'flexible-testing-library-react';

import { App } from './App';

describe('App', () => {
  it('renders without error', async () => {
    render(
      <Router hook={staticLocationHook('/', { record: true })}>
        <App />
      </Router>,
    );
    await act(() => Promise.resolve()); // slug existence update
  });
});
