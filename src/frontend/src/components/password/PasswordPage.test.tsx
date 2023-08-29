import React from 'react';
import { firstValueFrom } from 'rxjs';
import { render, fireEvent, act, getBy } from 'flexible-testing-library-react';
import mockElement from 'react-mock-element';
import { retroTokenService, retroTokenTracker } from '../../api/api';
import type * as mockApiTypes from '../../api/__mocks__/api';
import { css } from '../../test-helpers/queries';

import PasswordPage from './PasswordPage';

jest.mock('../../api/api');
jest.mock('../common/Header', () => mockElement('mock-header'));

const mockRetroTokenService =
  retroTokenService as unknown as typeof mockApiTypes.retroTokenService;

function getToken(retroId: string): Promise<string> {
  return firstValueFrom(retroTokenTracker.get(retroId));
}

describe('PasswordPage', () => {
  it('exchanges passwords for tokens', async () => {
    mockRetroTokenService.setServerData('myRetroId', 'some-token');

    const dom = render(<PasswordPage slug="abc" retroId="myRetroId" />);

    const form = dom.getBy(css('form'));
    const fieldPassword = getBy(form, css('input[type=password]'));
    fireEvent.change(fieldPassword, { target: { value: 'my-password' } });
    await act(async () => {
      fireEvent.submit(form);
    });

    const retroToken = await getToken('myRetroId');
    expect(mockRetroTokenService.capturedPassword).toEqual('my-password');
    expect(retroToken).toEqual('some-token');
  });
});
