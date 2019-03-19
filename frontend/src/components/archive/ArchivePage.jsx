import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Header from '../common/Header';
import Loader from '../common/Loader';
import useExistenceCallbacks from '../../hooks/useExistenceCallbacks';
import forbidExtraProps from '../../helpers/forbidExtraProps';
import mapRouteToProps from '../../helpers/mapRouteToProps';
import {
  propTypesShapeRetro,
  propTypesShapeArchive,
} from '../../helpers/dataStructurePropTypes';
import { formatDate } from '../../time/formatters';
import { beginConsumingRetro, endConsumingRetro } from '../../reducers/retro';
import { loadArchive } from '../../reducers/archive';
import RetroFormatPicker from '../retro-formats/RetroFormatPicker';
import './ArchivePage.less';

export const ArchivePage = ({
  retroData,
  slug,
  archiveId,
  onAppear,
  onDisappear,
}) => {
  useExistenceCallbacks(onAppear, onDisappear, slug, archiveId);

  const retro = retroData?.retro;
  const archiveData = retroData?.archives?.[archiveId];
  const archive = archiveData?.archive;

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
  retroData: PropTypes.shape({
    retro: propTypesShapeRetro,
    error: PropTypes.string,
    archives: PropTypes.objectOf(PropTypes.shape({
      archive: propTypesShapeArchive,
      error: PropTypes.string,
    })),
  }),
  slug: PropTypes.string.isRequired,
  archiveId: PropTypes.string.isRequired,
  onAppear: PropTypes.func.isRequired,
  onDisappear: PropTypes.func.isRequired,
};

ArchivePage.defaultProps = {
  retroData: null,
};

forbidExtraProps(ArchivePage);

const mapStateToProps = (state, { match }) => ({
  retroData: state.retros[match.params.slug],
});

const mapDispatchToProps = (dispatch) => ({
  onAppear: async (slug, archiveId) => {
    await dispatch(beginConsumingRetro(slug));
    await dispatch(loadArchive(slug, archiveId));
  },
  onDisappear: (slug) => {
    dispatch(endConsumingRetro(slug));
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mapRouteToProps({ slug: 'slug', archiveId: 'archiveid' }),
)(ArchivePage);
