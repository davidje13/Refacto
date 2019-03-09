import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Helmet from 'react-helmet-async';
import Loader from '../common/Loader';
import forbidExtraProps from '../../helpers/forbidExtraProps';
import mapRouteToProps from '../../helpers/mapRouteToProps';
import { reloadRetroList } from '../../reducers/retroList';
import { propTypesShapeRetroSummary } from '../../helpers/dataStructurePropTypes';
import RetroList from './RetroList';

export const RetroListPage = ({ retrosData, onAppear }) => (
  <article className="page-retro-list">
    <Helmet title="Retros - Refacto" />
    <Loader
      loading={!retrosData}
      Component={RetroList}
      onAppear={onAppear}
      retros={retrosData?.retros}
    />
  </article>
);

RetroListPage.propTypes = {
  retrosData: PropTypes.shape({
    retros: PropTypes.arrayOf(propTypesShapeRetroSummary),
    error: PropTypes.string,
  }),
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
  mapRouteToProps({}),
)(RetroListPage);
