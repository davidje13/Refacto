import { act, render } from 'flexible-testing-library-react';
import mockElement from 'react-mock-element';
import { makeRetro } from '../../shared/api-entities';
import { archiveService } from '../../api/api';
import { css } from '../../test-helpers/queries';

import { ArchiveListPage } from './ArchiveListPage';

jest.mock('../common/Header', () => ({ Header: mockElement('mock-header') }));
jest.mock('./ArchiveList', () => ({
  ArchiveList: mockElement('mock-archive-list'),
}));

describe('ArchiveListPage', () => {
  it('renders an archive list page', async () => {
    jest.spyOn(archiveService, 'getList').mockResolvedValue({ archives: [] });

    const dom = render(
      <ArchiveListPage retro={makeRetro({ id: 'r1' })} retroToken="token-1" />,
    );
    await act(() => Promise.resolve()); // data fetch

    expect(dom).toContainElementWith(css('mock-archive-list'));
    expect(archiveService.getList).toHaveBeenCalledWith(
      'r1',
      'token-1',
      expect.anything(),
    );
  });
});
