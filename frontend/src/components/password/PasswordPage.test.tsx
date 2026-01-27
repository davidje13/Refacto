import { render, fireEvent, act, getBy } from 'flexible-testing-library-react';
import { COMMON_AUTH } from '../../test-helpers/commonAuth';
import { css } from '../../test-helpers/queries';
import { retroAuthService, retroAuthTracker } from '../../api/api';

import { PasswordPage } from './PasswordPage';

describe('PasswordPage', () => {
  it('exchanges passwords for tokens', async () => {
    jest
      .spyOn(retroAuthService, 'getRetroAuthForPassword')
      .mockResolvedValue({ ...COMMON_AUTH, retroToken: 'some-token' });

    const dom = render(<PasswordPage slug="abc" retroId="myRetroId" />);

    const form = dom.getBy(css('form'));
    const fieldPassword = getBy(form, css('input[type=password]'));
    fireEvent.change(fieldPassword, { target: { value: 'my-password' } });
    fireEvent.submit(form);
    await act(() => Promise.resolve()); // fetch and store retro token

    expect(retroAuthService.getRetroAuthForPassword).toHaveBeenCalledWith(
      'myRetroId',
      'my-password',
    );

    const retroAuth = await retroAuthTracker.get('myRetroId').getOneValue();
    expect(retroAuth?.retroToken).toEqual('some-token');
  });
});
