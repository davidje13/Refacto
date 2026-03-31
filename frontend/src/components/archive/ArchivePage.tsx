import { memo } from 'react';
import type { RetroPagePropsT } from '../RetroRouter';
import { Header } from '../common/Header';
import { LoadingError, LoadingIndicator } from '../common/Loader';
import { useArchive } from '../../hooks/data/useArchive';
import { StateMapProvider } from '../../hooks/useStateMap';
import { formatDate } from '../../time/formatters';
import { RetroFormat } from '../retro-formats/RetroFormat';

type PropsT = Pick<RetroPagePropsT, 'retroAuth' | 'retro'> & {
  archiveId: string;
  group?: string | undefined;
};

export const ArchivePage = memo(
  ({ retroAuth, retro, archiveId, group }: PropsT) => {
    const [archive, archiveError] = useArchive(
      retro.id,
      archiveId,
      retroAuth.retroToken,
    );

    let archiveName = 'Archive';
    if (archive) {
      archiveName = `${formatDate(archive.created)} Archive`;
    }

    return (
      <article className="page-archive">
        <StateMapProvider scope={archiveId}>
          <Header
            documentTitle={`${archiveName} - ${retro.name} - Refacto`}
            title={`${retro.name} (${archiveName})`}
            backLink={{
              label: 'Archives',
              action: `/retros/${encodeURIComponent(retro.slug)}/archives`,
            }}
          />
          {archiveError ? (
            <LoadingError error={archiveError} />
          ) : !archive ? (
            <LoadingIndicator />
          ) : (
            <RetroFormat
              retroId={retro.id}
              retroSlug={retro.slug}
              retroAuth={retroAuth}
              retroFormat={archive.format}
              retroOptions={archive.options}
              retroItems={archive.items}
              retroHistory={archive.history}
              retroState={{}}
              group={group}
              archive={true}
              archiveTime={archive.created}
            />
          )}
        </StateMapProvider>
      </article>
    );
  },
);
