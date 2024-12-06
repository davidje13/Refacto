import { render, fireEvent, act, getBy } from 'flexible-testing-library-react';
import mockElement from 'react-mock-element';
import { retroTokenService, retroTokenTracker } from '../../api/api';
import { css } from '../../test-helpers/queries';

import { PasswordPage } from './PasswordPage';

jest.mock('../common/Header', () => ({ Header: mockElement('mock-header') }));

describe('PasswordPage', () => {
  it('exchanges passwords for tokens', async () => {
    jest
      .spyOn(retroTokenService, 'getRetroTokenForPassword')
      .mockResolvedValue('some-token');

    const dom = render(<PasswordPage slug="abc" retroId="myRetroId" />);

    const form = dom.getBy(css('form'));
    const fieldPassword = getBy(form, css('input[type=password]'));
    fireEvent.change(fieldPassword, { target: { value: 'my-password' } });
    fireEvent.submit(form);
    await act(() => Promise.resolve()); // fetch and store retro token

    expect(retroTokenService.getRetroTokenForPassword).toHaveBeenCalledWith(
      'myRetroId',
      'my-password',
    );

    const retroToken = await retroTokenTracker.get('myRetroId').getOneValue();
    expect(retroToken).toEqual('some-token');
  });
});
