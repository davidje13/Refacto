import React, { memo } from 'react';
import Header from '../common/Header';
import Loader from '../common/Loader';
import withRetroTokenForSlug from '../hocs/withRetroTokenForSlug';
import useRetroReducer from '../../hooks/data/useRetroReducer';
import useArchive from '../../hooks/data/useArchive';
import { formatDate } from '../../time/formatters';
import RetroFormatPicker from '../retro-formats/RetroFormatPicker';
import './ArchivePage.less';

interface PropsT {
  slug: string;
  retroId: string | null;
  archiveId: string;
  retroToken: string | null;
  retroTokenError: string | null;
}

export default memo(withRetroTokenForSlug(({
  slug,
  retroId,
  archiveId,
  retroToken,
  retroTokenError,
}: PropsT) => {
  const [retro] = useRetroReducer(retroId, retroToken);
  const [archive, archiveError] = useArchive(retroId, archiveId, retroToken);

  const retroName = retro?.name ?? slug;
  let archiveName = 'Archive';
  if (archive) {
    archiveName = `${formatDate(archive.created)} Archive`;
  }

  return (
    <article className="page-archive">
      <Header
        documentTitle={`${archiveName} - ${retroName} - Refacto`}
        title={`${retroName} (${archiveName})`}
        backLink={{ label: 'Archives', action: `/retros/${slug}/archives` }}
      />
      <Loader<typeof RetroFormatPicker>
        error={retroTokenError || archiveError}
        Component={RetroFormatPicker}
        componentProps={archive ? {
          retroFormat: archive.format,
          retroOptions: archive.options,
          retroItems: archive.items,
          retroState: {},
          archive: true,
          archiveTime: archive.created,
          onComplete: (): void => undefined,
        } : null}
      />
    </article>
  );
}));
