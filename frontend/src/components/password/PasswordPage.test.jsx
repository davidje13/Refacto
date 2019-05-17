import React from 'react';
import { render, fireEvent, act } from 'react-testing-library';
import { retroTokenService, retroTokenTracker } from '../../api/api';

import PasswordPage from './PasswordPage';

jest.mock('../../api/api');
jest.mock('../common/Header', () => () => (<div />));

function getToken(retroId) {
  return new Promise((resolve) => {
    const sub = retroTokenTracker.get(retroId).subscribe((retroToken) => {
      resolve(retroToken);
      sub.unsubscribe();
    });
  });
}

describe('PasswordPage', () => {
  it('exchanges passwords for tokens', async () => {
    retroTokenService.setServerData('myRetroId', 'some-token');

    const { container } = render((
      <PasswordPage slug="abc" retroId="myRetroId" />
    ));

    const form = container.querySelector('form');
    const fieldPassword = form.querySelector('input[type=password]');
    await act(async () => fireEvent.change(
      fieldPassword,
      { target: { value: 'my-password' } },
    ));
    await act(async () => fireEvent.submit(form));

    const retroToken = await getToken('myRetroId');
    expect(retroTokenService.capturedPassword).toEqual('my-password');
    expect(retroToken).toEqual('some-token');
  });
});
