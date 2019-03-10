import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Loader from '../common/Loader';
import forbidExtraProps from '../../helpers/forbidExtraProps';
import mapRouteToProps from '../../helpers/mapRouteToProps';
import { dynamicBind } from '../../helpers/dynamicBind';
import {
  propTypesShapeRetro,
  propTypesShapeArchive,
} from '../../helpers/dataStructurePropTypes';
import { beginConsumingRetro, endConsumingRetro } from '../../reducers/retro';
import { loadArchive } from '../../reducers/archive';
import ArchivedRetro from './ArchivedRetro';
import './ArchivePage.less';

const addArchivePath = (props) => [props.slug, props.archiveId];

export class ArchivePage extends React.Component {
  static propTypes = {
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

  static defaultProps = {
    retroData: null,
  };

  constructor(props) {
    super(props);

    const { onAppear, onDisappear } = props;

    this.handleAppear = dynamicBind(this, { onAppear }, addArchivePath);
    this.handleDisappear = dynamicBind(this, { onDisappear }, addArchivePath);
  }

  render() {
    const { retroData, slug, archiveId } = this.props;
    const archiveData = retroData?.archives[archiveId];

    return (
      <article className="page-archive">
        <Loader
          loading={!archiveData}
          title={`${retroData?.retro.name || slug} [Archived] - Refacto`}
          Component={ArchivedRetro}
          onAppear={this.handleAppear}
          onDisappear={this.handleDisappear}
          retro={retroData?.retro}
          archive={archiveData?.archive}
        />
      </article>
    );
  }
}

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
