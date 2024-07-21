import { memo } from 'react';
import { type RetroPagePropsT } from '../RetroRouter';
import { Header } from '../common/Header';
import { Loader } from '../common/Loader';
import { ApiDownload } from '../common/ApiDownload';
import { useArchiveList } from '../../hooks/data/useArchiveList';
import { ArchiveList } from './ArchiveList';
import './ArchiveListPage.less';

type PropsT = Pick<RetroPagePropsT, 'retroToken' | 'retro'>;

export const ArchiveListPage = memo(({ retroToken, retro }: PropsT) => {
  const [archives, archivesError] = useArchiveList(retro.id, retroToken);

  return (
    <article className="page-archive-list">
      <Header
        documentTitle={`Archives - ${retro.name} - Refacto`}
        title={`${retro.name} Archives`}
        backLink={{ label: 'Back to Retro', action: `/retros/${retro.slug}` }}
      />
      <Loader
        error={archivesError}
        Component={ArchiveList}
        componentProps={archives ? { slug: retro.slug, archives } : null}
      />
      <div className="extra-links">
        <ApiDownload
          url={`retros/${retro.id}/export/json`}
          token={retroToken}
          filename={`${retro.slug}-export.json`}
        >
          Export as JSON
        </ApiDownload>
      </div>
    </article>
  );
});
