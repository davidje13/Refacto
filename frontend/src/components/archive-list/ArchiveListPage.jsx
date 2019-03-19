import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Header from '../common/Header';
import Loader from '../common/Loader';
import { beginConsumingRetro, endConsumingRetro } from '../../reducers/retro';
import useExistenceCallbacks from '../../hooks/useExistenceCallbacks';
import forbidExtraProps from '../../helpers/forbidExtraProps';
import { propTypesShapeLoadedRetro } from '../../helpers/dataStructurePropTypes';
import ArchiveList from './ArchiveList';
import './ArchiveListPage.less';

export const ArchiveListPage = ({
  retroData,
  slug,
  onAppear,
  onDisappear,
}) => {
  useExistenceCallbacks(onAppear, onDisappear, slug);

  const retro = retroData?.retro;
  const retroName = retro?.name || slug;

  return (
    <article className="page-archive-list">
      <Header
        documentTitle={`Archives - ${retroName} - Refacto`}
        title={`${retroName} Archives`}
        backLink={{ label: 'Back to Retro', url: `/retros/${slug}` }}
      />
      <Loader
        loading={!retro}
        Component={ArchiveList}
        retro={retro}
      />
    </article>
  );
};

ArchiveListPage.propTypes = {
  slug: PropTypes.string.isRequired,
  onAppear: PropTypes.func.isRequired,
  onDisappear: PropTypes.func.isRequired,
  retroData: propTypesShapeLoadedRetro,
};

ArchiveListPage.defaultProps = {
  retroData: null,
};

forbidExtraProps(ArchiveListPage);

const mapStateToProps = (state, { slug }) => ({
  retroData: state.retros[slug],
});

const mapDispatchToProps = {
  onAppear: beginConsumingRetro,
  onDisappear: endConsumingRetro,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ArchiveListPage);
