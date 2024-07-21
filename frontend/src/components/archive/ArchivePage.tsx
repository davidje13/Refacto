import { memo } from 'react';
import { type RetroPagePropsT } from '../RetroRouter';
import { Header } from '../common/Header';
import { Loader } from '../common/Loader';
import { useArchive } from '../../hooks/data/useArchive';
import { formatDate } from '../../time/formatters';
import { RetroFormatPicker } from '../retro-formats/RetroFormatPicker';
import './ArchivePage.less';

type PropsT = Pick<RetroPagePropsT, 'retroToken' | 'retro'> & {
  archiveId: string;
  group?: string | undefined;
};

export const ArchivePage = memo(
  ({ retroToken, retro, archiveId, group }: PropsT) => {
    const [archive, archiveError] = useArchive(retro.id, archiveId, retroToken);

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
            action: `/retros/${retro.slug}/archives`,
          }}
        />
        <Loader
          error={archiveError}
          Component={RetroFormatPicker}
          componentProps={
            archive
              ? {
                  retroFormat: archive.format,
                  retroOptions: archive.options,
                  retroItems: archive.items,
                  retroState: {},
                  group,
                  archive: true,
                  archiveTime: archive.created,
                  onComplete: () => undefined,
                }
              : null
          }
        />
      </article>
    );
  },
);
