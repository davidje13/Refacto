import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Loader from '../common/Loader';
import useExistenceCallbacks from '../../hooks/useExistenceCallbacks';
import forbidExtraProps from '../../helpers/forbidExtraProps';
import mapRouteToProps from '../../helpers/mapRouteToProps';
import {
  propTypesShapeRetro,
  propTypesShapeArchive,
} from '../../helpers/dataStructurePropTypes';
import { beginConsumingRetro, endConsumingRetro } from '../../reducers/retro';
import { loadArchive } from '../../reducers/archive';
import ArchivedRetro from './ArchivedRetro';
import './ArchivePage.less';

export const ArchivePage = ({
  retroData,
  slug,
  archiveId,
  onAppear,
  onDisappear,
}) => {
  const archiveData = retroData?.archives[archiveId];

  useExistenceCallbacks(onAppear, onDisappear, slug, archiveId);

  return (
    <article className="page-archive">
      <Loader
        loading={!archiveData}
        title={`${retroData?.retro.name || slug} [Archived] - Refacto`}
        Component={ArchivedRetro}
        retro={retroData?.retro}
        archive={archiveData?.archive}
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
