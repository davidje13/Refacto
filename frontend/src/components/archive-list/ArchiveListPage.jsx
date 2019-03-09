import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Loader from '../common/Loader';
import { beginConsumingRetro, endConsumingRetro } from '../../reducers/retro';
import forbidExtraProps from '../../helpers/forbidExtraProps';
import { propTypesShapeRetro } from '../../helpers/dataStructurePropTypes';
import mapRouteToProps from '../../helpers/mapRouteToProps';
import modifyParameters, { prefixProps } from '../../helpers/modifyParameters';
import ArchiveList from './ArchiveList';

export class ArchiveListPage extends React.Component {
  static propTypes = {
    slug: PropTypes.string.isRequired,
    onAppear: PropTypes.func.isRequired,
    onDisappear: PropTypes.func.isRequired,
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

    const { onAppear, onDisappear } = props;

    this.handlers = modifyParameters(this, prefixProps('slug'), {
      onAppear,
      onDisappear,
    });
  }

  render() {
    const { data, slug } = this.props;

    return (
      <article className="page-archive-list">
        <Loader
          loading={!data}
          title={`Archives - ${data?.retro.name || slug} - Refacto`}
          Component={ArchiveList}
          onAppear={this.handlers.onAppear}
          onDisappear={this.handlers.onDisappear}
          retro={data?.retro}
        />
      </article>
    );
  }
}

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
