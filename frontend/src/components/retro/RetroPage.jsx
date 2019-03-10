import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Loader from '../common/Loader';
import useExistenceCallbacks from '../../hooks/useExistenceCallbacks';
import useBoundCallback from '../../hooks/useBoundCallback';
import { propTypesShapeRetro } from '../../helpers/dataStructurePropTypes';
import mapRouteToProps from '../../helpers/mapRouteToProps';
import forbidExtraProps from '../../helpers/forbidExtraProps';
import {
  beginConsumingRetro,
  endConsumingRetro,
  setRetroState,
} from '../../reducers/retro';
import {
  addRetroItem,
  upvoteRetroItem,
  editRetroItem,
  deleteRetroItem,
  setRetroItemDone,
} from '../../reducers/retroItems';
import Retro from './Retro';
import './RetroPage.less';

export const RetroPage = ({
  slug,
  data,
  onAppear,
  onDisappear,
  onAddItem,
  onVoteItem,
  onEditItem,
  onDeleteItem,
  onSetItemDone,
  onSetRetroState,
}) => {
  useExistenceCallbacks(onAppear, onDisappear, slug);

  return (
    <article className="page-retro">
      <Loader
        loading={!data}
        title={`${data?.retro?.name || slug} - Refacto`}
        Component={Retro}
        retro={data?.retro}
        onAddItem={useBoundCallback(onAddItem, slug)}
        onVoteItem={useBoundCallback(onVoteItem, slug)}
        onEditItem={useBoundCallback(onEditItem, slug)}
        onDeleteItem={useBoundCallback(onDeleteItem, slug)}
        onSetItemDone={useBoundCallback(onSetItemDone, slug)}
        onSetRetroState={useBoundCallback(onSetRetroState, slug)}
      />
    </article>
  );
};

RetroPage.propTypes = {
  slug: PropTypes.string.isRequired,
  data: PropTypes.shape({
    retro: propTypesShapeRetro,
    error: PropTypes.string,
  }),
  onAppear: PropTypes.func.isRequired,
  onDisappear: PropTypes.func.isRequired,
  onAddItem: PropTypes.func.isRequired,
  onVoteItem: PropTypes.func.isRequired,
  onEditItem: PropTypes.func.isRequired,
  onDeleteItem: PropTypes.func.isRequired,
  onSetItemDone: PropTypes.func.isRequired,
  onSetRetroState: PropTypes.func.isRequired,
};

RetroPage.defaultProps = {
  data: null,
};

forbidExtraProps(RetroPage);

const mapStateToProps = (state, { match }) => ({
  data: state.retros[match.params.slug] || null,
});

const mapDispatchToProps = {
  onAppear: beginConsumingRetro,
  onDisappear: endConsumingRetro,
  onAddItem: addRetroItem,
  onVoteItem: upvoteRetroItem,
  onEditItem: editRetroItem,
  onDeleteItem: deleteRetroItem,
  onSetItemDone: setRetroItemDone,
  onSetRetroState: setRetroState,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mapRouteToProps({ slug: 'slug' }),
)(RetroPage);
