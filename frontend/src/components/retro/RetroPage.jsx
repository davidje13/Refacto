import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Loader from '../common/Loader';
import { propTypesShapeRetro } from '../../helpers/dataStructurePropTypes';
import mapRouteToProps from '../../helpers/mapRouteToProps';
import { dynamicBind } from '../../helpers/dynamicBind';
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

const addRetroPath = (props) => [props.slug];

export class RetroPage extends React.Component {
  static propTypes = {
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

  static defaultProps = {
    data: null,
  };

  constructor(props) {
    super(props);

    const {
      onAppear,
      onDisappear,
      onAddItem,
      onVoteItem,
      onEditItem,
      onDeleteItem,
      onSetItemDone,
      onSetRetroState,
    } = props;

    this.handleAppear = dynamicBind(this, { onAppear }, addRetroPath);
    this.handleDisappear = dynamicBind(this, { onDisappear }, addRetroPath);
    this.handleAddItem = dynamicBind(this, { onAddItem }, addRetroPath);
    this.handleVoteItem = dynamicBind(this, { onVoteItem }, addRetroPath);
    this.handleEditItem = dynamicBind(this, { onEditItem }, addRetroPath);
    this.handleDeleteItem = dynamicBind(this, { onDeleteItem }, addRetroPath);
    this.handleSetItemDone = dynamicBind(this, { onSetItemDone }, addRetroPath);
    this.handleSetRetroState = dynamicBind(this, { onSetRetroState }, addRetroPath);
  }

  render() {
    const { slug, data } = this.props;

    return (
      <article className="page-retro">
        <Loader
          loading={!data}
          title={`${data?.retro?.name || slug} - Refacto`}
          Component={Retro}
          retro={data?.retro}
          onAppear={this.handleAppear.optional()}
          onDisappear={this.handleDisappear.optional()}
          onAddItem={this.handleAddItem.optional()}
          onVoteItem={this.handleVoteItem.optional()}
          onEditItem={this.handleEditItem.optional()}
          onDeleteItem={this.handleDeleteItem.optional()}
          onSetItemDone={this.handleSetItemDone.optional()}
          onSetRetroState={this.handleSetRetroState.optional()}
        />
      </article>
    );
  }
}

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
