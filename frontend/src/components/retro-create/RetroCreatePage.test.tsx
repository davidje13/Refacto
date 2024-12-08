import { Router } from 'wouter';
import { memoryLocation } from 'wouter/memory-location';
import { render } from 'flexible-testing-library-react';
import mockElement from 'react-mock-element';

import { RetroCreatePage } from './RetroCreatePage';

jest.mock('../common/Header', () => ({ Header: mockElement('mock-header') }));

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
