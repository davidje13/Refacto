import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import { setActiveRetro } from '../../reducers/activeRetro';
import Retro from './Retro';

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

const mapStateToProps = (state, ownProps) => ({
  loading: state.activeRetro.loading,
  slug: ownProps.match.params.slug,
});

const mapDispatchToProps = {
  setActiveRetro,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(RetroPage);
