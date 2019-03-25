import React from 'react';
import PropTypes from 'prop-types';
import Header from '../common/Header';
import Loader from '../common/Loader';
import useSlug from '../../hooks/data/useSlug';
import useRetroReducer from '../../hooks/data/useRetroReducer';
import useArchive from '../../hooks/data/useArchive';
import forbidExtraProps from '../../helpers/forbidExtraProps';
import { formatDate } from '../../time/formatters';
import RetroFormatPicker from '../retro-formats/RetroFormatPicker';
import './ArchivePage.less';

const ArchivePage = ({ slug, archiveId }) => {
  const [retroState] = useRetroReducer(useSlug(slug)?.id);
  const archiveState = useArchive(retroState, archiveId);

  const retro = retroState?.retro;
  const archive = archiveState?.archive;

  const retroName = retro?.name || slug;
  let archiveName = 'Archive';
  if (archive) {
    archiveName = `${formatDate(archive.created)} Archive`;
  }

  return (
    <article className="page-archive">
      <Header
        documentTitle={`${archiveName} - ${retroName} - Refacto`}
        title={`${retroName} (${archiveName})`}
        backLink={{ label: 'Archives', url: `/retros/${slug}/archives` }}
      />
      <Loader
        loading={!archive}
        Component={RetroFormatPicker}
        retroData={archive?.data}
        retroState={{}}
        archive
      />
    </article>
  );
};

ArchivePage.propTypes = {
  slug: PropTypes.string.isRequired,
  archiveId: PropTypes.string.isRequired,
};

forbidExtraProps(ArchivePage);

export default React.memo(ArchivePage);
