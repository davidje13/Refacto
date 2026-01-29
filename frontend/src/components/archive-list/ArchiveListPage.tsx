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
        <ApiDownloadButton
          url={`retros/${encodeURIComponent(retro.id)}/export/csv`}
          retroAuth={retroAuth}
          filename={`${retro.slug}-export.csv`}
        >
          Export items as CSV
        </ApiDownloadButton>
      </div>
    </article>
  );
});
