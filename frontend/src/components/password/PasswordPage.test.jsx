import React from 'react';
import { mount } from 'enzyme';
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

    const dom = mount(<PasswordPage slug="abc" retroId="myRetroId" />);

    dom.find('input').simulate('change', { target: { value: 'my-password' } });
    dom.find('form').simulate('submit');

    const retroToken = await getToken('myRetroId');
    expect(retroTokenService.capturedPassword).toEqual('my-password');
    expect(retroToken).toEqual('some-token');
  });
});
