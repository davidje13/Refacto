import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import mockElement from 'react-mock-element';
import { retroTokenService, retroTokenTracker } from '../../api/api';
import type * as mockApiTypes from '../../api/__mocks__/api';
import { queries, css } from '../../test-helpers/queries';

import PasswordPage from './PasswordPage';

jest.mock('../../api/api');
jest.mock('../common/Header', () => mockElement('mock-header'));

const mockRetroTokenService = retroTokenService as any as typeof mockApiTypes.retroTokenService;

function getToken(retroId: string): Promise<string> {
  return new Promise((resolve): void => {
    const sub = retroTokenTracker.get(retroId).subscribe((retroToken) => {
      resolve(retroToken);
      sub.unsubscribe();
    });
  });
}

describe('PasswordPage', () => {
  it('exchanges passwords for tokens', async () => {
    mockRetroTokenService.setServerData('myRetroId', 'some-token');

    const dom = render((
      <PasswordPage slug="abc" retroId="myRetroId" />
    ), { queries });

    const form = dom.getBy(css('form'));
    const fieldPassword = queries.getBy(form, css('input[type=password]'));
    fireEvent.change(fieldPassword, { target: { value: 'my-password' } });
    await act(async () => {
      fireEvent.submit(form);
    });

    const retroToken = await getToken('myRetroId');
    expect(mockRetroTokenService.capturedPassword).toEqual('my-password');
    expect(retroToken).toEqual('some-token');
  });
});
