import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
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

  componentDidMount() {
    const { onAppear, slug, archiveId } = this.props;
    onAppear(slug, archiveId);
  }

  renderLoader() {
    const { slug } = this.props;

    return (
      <React.Fragment>
        <Helmet title={`${slug} - Refacto`} />
        <div className="loader">Loading&hellip;</div>
      </React.Fragment>
    );
  }

  render() {
    const { loading } = this.props;

    return (
      <article className="page-archive">
        {loading ? this.renderLoader() : (<ArchivedRetro />)}
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
