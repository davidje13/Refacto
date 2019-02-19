import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import { reloadRetroList } from '../../reducers/retroList';
import RetroList from './RetroList';

export class RetroListPage extends React.Component {
  static propTypes = {
    loading: PropTypes.bool,
    reloadRetroList: PropTypes.func.isRequired,
  };

  static defaultProps = {
    loading: false,
  };

  componentDidMount() {
    this.props.reloadRetroList();
  }

  renderLoader() {
    return (
      <div className="loader">Loading&hellip;</div>
    );
  }

  render() {
    const { loading } = this.props;

    return (
      <div className="page-retro-list">
        <Helmet>
          <title>Retros - Refacto</title>
        </Helmet>
        {loading ? this.renderLoader() : (<RetroList />)}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  loading: state.retroList.loading,
});

const mapDispatchToProps = {
  reloadRetroList,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(RetroListPage);
