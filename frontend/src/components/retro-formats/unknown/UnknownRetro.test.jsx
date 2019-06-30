import React from 'react';
import { render } from '@testing-library/react';
import { queries, textFragment } from '../../../test-helpers/queries';

import UnknownRetro from './UnknownRetro';

describe('UnknownRetro', () => {
  it('displays a message', () => {
    const dom = render(<UnknownRetro />, { queries });
    expect(dom).toContainElementWith(textFragment('refresh the page'));
  });
});
