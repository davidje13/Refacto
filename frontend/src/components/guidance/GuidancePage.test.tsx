import { Router } from 'wouter';
import { memoryLocation } from 'wouter/memory-location';
import { render } from 'flexible-testing-library-react';
import { css } from '../../test-helpers/queries';

import { GuidancePage } from './GuidancePage';

describe('GuidancePage', () => {
  it('displays static content with anchors', () => {
    const location = memoryLocation({ path: '/', record: true });
    const dom = render(
      <Router hook={location.hook}>
        <GuidancePage />
      </Router>,
    );

    expect(dom).toContainElementWith(css('#what'));
  });
});
