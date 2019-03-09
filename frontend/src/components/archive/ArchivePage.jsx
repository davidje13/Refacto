import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Loader from '../common/Loader';
import forbidExtraProps from '../../helpers/forbidExtraProps';
import mapRouteToProps from '../../helpers/mapRouteToProps';
import { setCurrentArchive } from '../../reducers/currentArchive';
import ArchivedRetro from './ArchivedRetro';
import './ArchivePage.less';

export class ArchivePage extends React.Component {
  static propTypes = {
    loading: PropTypes.bool,
    slug: PropTypes.string.isRequired,
    archiveId: PropTypes.string.isRequired,
    onAppear: PropTypes.func.isRequired,
  };

  static defaultProps = {
    loading: false,
  };

  handleAppear = () => {
    const { onAppear, slug, archiveId } = this.props;
    onAppear(slug, archiveId);
  };

  render() {
    const { loading, slug } = this.props;
    return (
      <article className="page-archive">
        <Loader
          loading={loading}
          loadingTitle={`${slug} - Refacto`}
          Component={ArchivedRetro}
          onAppear={this.handleAppear}
        />
      </article>
    );
  }
}

forbidExtraProps(ArchivePage);

const mapStateToProps = (state) => ({
  loading: state.currentArchive.loading,
});

const mapDispatchToProps = {
  onAppear: setCurrentArchive,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mapRouteToProps({ slug: 'slug', archiveId: 'archiveid' }),
)(ArchivePage);
