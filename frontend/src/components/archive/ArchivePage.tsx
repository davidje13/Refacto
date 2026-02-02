import { memo } from 'react';
import type { RetroPagePropsT } from '../RetroRouter';
import { Header } from '../common/Header';
import { LoadingError, LoadingIndicator } from '../common/Loader';
import { useArchive } from '../../hooks/data/useArchive';
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
            retroFormat={archive.format}
            retroOptions={archive.options}
            retroItems={archive.items}
            retroState={{}}
            group={group}
            archive={true}
            archiveTime={archive.created}
            onComplete={() => undefined}
          />
        )}
      </article>
    );
  },
);
