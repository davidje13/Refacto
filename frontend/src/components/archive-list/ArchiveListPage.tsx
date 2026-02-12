import { memo } from 'react';
import type { RetroPagePropsT } from '../RetroRouter';
import { Header } from '../common/Header';
import { LoadingError, LoadingIndicator } from '../common/Loader';
import { ApiDownloadButton } from '../common/ApiDownloadButton';
import { useArchiveList } from '../../hooks/data/useArchiveList';
import { ArchiveList } from './ArchiveList';
import './ArchiveListPage.css';

type PropsT = Pick<RetroPagePropsT, 'retroAuth' | 'retro'>;

export const ArchiveListPage = memo(({ retroAuth, retro }: PropsT) => {
  const [archives, archivesError] = useArchiveList(
    retro.id,
    retroAuth.retroToken,
  );

  const formats = new Set([retro.format]);
  if (archives) {
    for (const archive of archives) {
      formats.add(archive.format);
    }
  }

  return (
    <article className="page-archive-list short-page">
      <Header
        documentTitle={`Archives - ${retro.name} - Refacto`}
        title={`${retro.name} Archives`}
        backLink={{
          label: 'Back to Retro',
          action: `/retros/${encodeURIComponent(retro.slug)}`,
        }}
      />
      {archivesError ? (
        <LoadingError error={archivesError} />
      ) : !archives ? (
        <LoadingIndicator />
      ) : (
        <ArchiveList slug={retro.slug} archives={archives} />
      )}
      <div className="extra-links">
        <ApiDownloadButton
          url={`retros/${encodeURIComponent(retro.id)}/export/json`}
          retroAuth={retroAuth}
          filename={`${retro.slug}-export.json`}
        >
          Export as JSON
        </ApiDownloadButton>
        {formats.has('mood') ? (
          <ApiDownloadButton
            url={`retros/${encodeURIComponent(retro.id)}/export/csv-mood`}
            retroAuth={retroAuth}
            filename={`${retro.slug}-export.csv`}
          >
            Export items as CSV
          </ApiDownloadButton>
        ) : null}
      </div>
    </article>
  );
});
