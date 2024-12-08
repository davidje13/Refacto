import { Router } from 'wouter';
import { memoryLocation } from 'wouter/memory-location';
import { render } from 'flexible-testing-library-react';
import mockElement from 'react-mock-element';
import { css } from '../../test-helpers/queries';

import { SecurityPage } from './SecurityPage';

jest.mock('../common/Header', () => ({ Header: mockElement('mock-header') }));

describe('SecurityPage', () => {
  it('displays static content with anchors', () => {
    const location = memoryLocation({ path: '/', record: true });
    const dom = render(
      <Router hook={location.hook}>
        <SecurityPage />
      </Router>,
    );

    expect(dom).toContainElementWith(css('#passwords'));
  });
});
