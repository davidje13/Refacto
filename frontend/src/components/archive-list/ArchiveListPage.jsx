import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Loader from '../common/Loader';
import { beginConsumingRetro, endConsumingRetro } from '../../reducers/retro';
import useExistenceCallbacks from '../../hooks/useExistenceCallbacks';
import forbidExtraProps from '../../helpers/forbidExtraProps';
import { propTypesShapeRetro } from '../../helpers/dataStructurePropTypes';
import mapRouteToProps from '../../helpers/mapRouteToProps';
import ArchiveList from './ArchiveList';

export const ArchiveListPage = ({
  data,
  slug,
  onAppear,
  onDisappear,
}) => {
  useExistenceCallbacks(onAppear, onDisappear, slug);

  return (
    <article className="page-archive-list">
      <Loader
        loading={!data}
        title={`Archives - ${data?.retro.name || slug} - Refacto`}
        Component={ArchiveList}
        retro={data?.retro}
      />
    </article>
  );
};

ArchiveListPage.propTypes = {
  slug: PropTypes.string.isRequired,
  onAppear: PropTypes.func.isRequired,
  onDisappear: PropTypes.func.isRequired,
  data: PropTypes.shape({
    retro: propTypesShapeRetro,
    error: PropTypes.string,
  }),
};

ArchiveListPage.defaultProps = {
  data: null,
};

forbidExtraProps(ArchiveListPage);

const mapStateToProps = (state, { match }) => ({
  data: state.retros[match.params.slug],
});

const mapDispatchToProps = {
  onAppear: beginConsumingRetro,
  onDisappear: endConsumingRetro,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mapRouteToProps({ slug: 'slug' }),
)(ArchiveListPage);
