import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import forbidExtraProps from '../../helpers/forbidExtraProps';
import mapRouteToProps from '../../helpers/mapRouteToProps';
import { setActiveRetro } from '../../reducers/activeRetro';
import Retro from './Retro';
import './RetroPage.less';

export class RetroPage extends React.Component {
  static propTypes = {
    loading: PropTypes.bool,
    slug: PropTypes.string.isRequired,
    setActiveRetro: PropTypes.func.isRequired,
  };

  static defaultProps = {
    loading: false,
  };

  componentDidMount() {
    this.props.setActiveRetro(this.props.slug);
  }

  renderLoader() {
    const { slug } = this.props;

    return (
      <React.Fragment>
        <Helmet>
          <title>{slug} - Refacto</title>
        </Helmet>
        <div className="loader">Loading&hellip;</div>
      </React.Fragment>
    );
  }

  render() {
    const { loading } = this.props;

    return (
      <article className="page-retro">
        {loading ? this.renderLoader() : (<Retro />)}
      </article>
    );
  }
}

forbidExtraProps(RetroPage);

const mapStateToProps = (state) => ({
  loading: state.activeRetro.loading,
});

const mapDispatchToProps = {
  setActiveRetro,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mapRouteToProps({ slug: 'slug' }),
)(RetroPage);
