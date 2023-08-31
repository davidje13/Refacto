import { Router } from 'wouter';
import staticLocationHook from 'wouter/static-location';
import { render } from 'flexible-testing-library-react';

import { App } from './App';

describe('App', () => {
  it('renders without error', () => {
    render(
      <Router hook={staticLocationHook('/', { record: true })}>
        <App />
      </Router>,
    );
  });
});
