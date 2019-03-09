import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Loader from '../common/Loader';
import { propTypesShapeRetro } from '../../helpers/dataStructurePropTypes';
import mapRouteToProps from '../../helpers/mapRouteToProps';
import modifyParameters, { prefixProps } from '../../helpers/modifyParameters';
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

export class RetroPage extends React.Component {
  static propTypes = {
    slug: PropTypes.string.isRequired,
    data: PropTypes.shape({
      retro: propTypesShapeRetro,
      error: PropTypes.string,
    }),
  };

  static defaultProps = {
    data: null,
  };

  constructor(props) {
    super(props);

    this.handlers = modifyParameters(this, prefixProps('slug'));
  }

  render() {
    const { slug, data } = this.props;

    return (
      <article className="page-retro">
        <Loader
          loading={!data}
          loadingTitle={`${slug} - Refacto`}
          Component={Retro}
          retro={data?.retro}
          {...this.handlers}
        />
      </article>
    );
  }
}

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
