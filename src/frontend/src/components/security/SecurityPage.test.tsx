import React from 'react';
import { Router } from 'wouter';
import staticLocationHook from 'wouter/static-location';
import { render } from 'flexible-testing-library-react';
import mockElement from 'react-mock-element';
import { css } from '../../test-helpers/queries';

import SecurityPage from './SecurityPage';

jest.mock('../common/Header', () => mockElement('mock-header'));

describe('SecurityPage', () => {
  it('displays static content with anchors', () => {
    const dom = render(
      <Router hook={staticLocationHook('/', { record: true })}>
        <SecurityPage />
      </Router>,
    );

    expect(dom).toContainElementWith(css('#passwords'));
  });
});
