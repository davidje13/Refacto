import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Header from '../common/Header';
import Loader from '../common/Loader';
import useExistenceCallbacks from '../../hooks/useExistenceCallbacks';
import forbidExtraProps from '../../helpers/forbidExtraProps';
import { reloadRetroList } from '../../reducers/retroList';
import { propTypesShapeLoadedRetroList } from '../../helpers/dataStructurePropTypes';
import RetroList from './RetroList';
import './RetroListPage.less';

export const RetroListPage = ({
  retrosData,
  onAppear,
}) => {
  useExistenceCallbacks(onAppear);

  return (
    <article className="page-retro-list">
      <Header
        documentTitle="Retros - Refacto"
        title="Retros"
        backLink={{ label: 'Home', url: '/' }}
      />
      <Loader
        loading={!retrosData}
        Component={RetroList}
        retros={retrosData?.retros}
      />
    </article>
  );
};

RetroListPage.propTypes = {
  retrosData: propTypesShapeLoadedRetroList,
  onAppear: PropTypes.func.isRequired,
};

RetroListPage.defaultProps = {
  retrosData: null,
};

forbidExtraProps(RetroListPage);

const mapStateToProps = (state) => ({
  retrosData: state.retroList,
});

const mapDispatchToProps = {
  onAppear: reloadRetroList,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(RetroListPage);
