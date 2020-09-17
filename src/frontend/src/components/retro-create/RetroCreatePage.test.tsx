import React from 'react';
import { Router } from 'wouter';
import staticLocationHook from 'wouter/static-location';
import { render } from 'flexible-testing-library-react';
import mockElement from 'react-mock-element';

import RetroCreatePage from './RetroCreatePage';

jest.mock('../common/Header', () => mockElement('mock-header'));

describe('RetroCreatePage', () => {
  it('renders without error', () => {
    render((
      <Router hook={staticLocationHook('/', { record: true })}>
        <RetroCreatePage />
      </Router>
    ));
  });
});
