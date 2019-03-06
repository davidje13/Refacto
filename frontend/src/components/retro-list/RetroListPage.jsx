import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import forbidExtraProps from '../../helpers/forbidExtraProps';
import mapRouteToProps from '../../helpers/mapRouteToProps';
import { reloadRetroList } from '../../reducers/retroList';
import RetroList from './RetroList';

const renderLoader = () => (
  <div className="loader">Loading&hellip;</div>
);

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

  render() {
    const { loading } = this.props;

    return (
      <article className="page-retro-list">
        <Helmet title="Retros - Refacto" />
        {loading ? renderLoader() : (<RetroList />)}
      </article>
    );
  }
}

forbidExtraProps(RetroListPage);

const mapStateToProps = (state) => ({
  loading: state.retroList.loading,
});

const mapDispatchToProps = {
  reloadRetroList,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mapRouteToProps({}),
)(RetroListPage);
