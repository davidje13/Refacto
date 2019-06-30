import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import mockElement from 'react-mock-element';
import { retroTokenService, retroTokenTracker } from '../../api/api';
import { queries, css } from '../../test-helpers/queries';

import PasswordPage from './PasswordPage';

jest.mock('../../api/api');
jest.mock('../common/Header', () => mockElement('mock-header'));

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

    const dom = render((
      <PasswordPage slug="abc" retroId="myRetroId" />
    ), { queries });

    const form = dom.getBy(css('form'));
    const fieldPassword = queries.getBy(form, css('input[type=password]'));
    fireEvent.change(fieldPassword, { target: { value: 'my-password' } });
    fireEvent.submit(form);

    const retroToken = await getToken('myRetroId');
    expect(retroTokenService.capturedPassword).toEqual('my-password');
    expect(retroToken).toEqual('some-token');
  });
});
