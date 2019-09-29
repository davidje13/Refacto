import React from 'react';
import { StaticRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import mockElement from 'react-mock-element';
import { queries, css } from '../../test-helpers/queries';

import SecurityPage from './SecurityPage';

jest.mock('../common/Header', () => mockElement('mock-header'));

describe('SecurityPage', () => {
  it('displays static content with anchors', () => {
    const context = {};
    const dom = render((
      <StaticRouter location="/" context={context}>
        <SecurityPage />
      </StaticRouter>
    ), { queries });

    expect(dom).toContainElementWith(css('#passwords'));
  });
});
