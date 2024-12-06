import { act, render } from 'flexible-testing-library-react';
import mockElement from 'react-mock-element';
import { makeRetro, makeRetroArchive } from '../../shared/api-entities';
import { archiveService } from '../../api/api';
import { css } from '../../test-helpers/queries';

import { ArchivePage } from './ArchivePage';

jest.mock('../retro-formats/RetroFormatPicker', () => ({
  RetroFormatPicker: mockElement('mock-retro-format-picker'),
}));
jest.mock('../common/Header', () => ({ Header: mockElement('mock-header') }));

describe('ArchivePage', () => {
  it('renders a retro page', async () => {
    jest.spyOn(archiveService, 'get').mockResolvedValue(makeRetroArchive());

    const dom = render(
      <ArchivePage
        retroToken="token-1"
        retro={makeRetro({ id: 'r1' })}
        archiveId="myArchiveId"
      />,
    );
    await act(() => Promise.resolve()); // data fetch

    expect(dom).toContainElementWith(css('mock-retro-format-picker'));
    expect(archiveService.get).toHaveBeenCalledWith(
      'r1',
      'myArchiveId',
      'token-1',
      expect.anything(),
    );
  });
});
