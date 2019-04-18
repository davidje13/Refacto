import React from 'react';
import PropTypes from 'prop-types';
import nullable from 'prop-types-nullable';
import Header from '../common/Header';
import Loader from '../common/Loader';
import withRetroFromSlug from '../hocs/withRetroFromSlug';
import useArchive from '../../hooks/data/useArchive';
import forbidExtraProps from '../../helpers/forbidExtraProps';
import { formatDate } from '../../time/formatters';
import RetroFormatPicker from '../retro-formats/RetroFormatPicker';
import './ArchivePage.less';

const ArchivePage = ({
  slug,
  archiveId,
  retroState,
  error,
}) => {
  const [archive, archiveError] = useArchive(retroState, archiveId);

  const retro = retroState?.retro;

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
        error={error || archiveError}
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
  retroState: nullable(PropTypes.shape({})).isRequired,
  error: PropTypes.string,
};

ArchivePage.defaultProps = {
  error: null,
};

forbidExtraProps(ArchivePage);

export default React.memo(withRetroFromSlug(ArchivePage, true));
