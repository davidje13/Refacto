import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Helmet from 'react-helmet-async';
import Loader from '../common/Loader';
import forbidExtraProps from '../../helpers/forbidExtraProps';
import mapRouteToProps from '../../helpers/mapRouteToProps';
import { reloadRetroList } from '../../reducers/retroList';
import RetroList from './RetroList';

export class RetroListPage extends React.Component {
  static propTypes = {
    loading: PropTypes.bool,
    onAppear: PropTypes.func.isRequired,
  };

  static defaultProps = {
    loading: false,
  };

  handleAppear = () => {
    const { onAppear } = this.props;
    onAppear();
  };

  render() {
    const { loading } = this.props;

    return (
      <article className="page-retro-list">
        <Helmet title="Retros - Refacto" />
        <Loader
          loading={loading}
          Component={RetroList}
          onAppear={this.handleAppear}
        />
      </article>
    );
  }
}

forbidExtraProps(RetroListPage);

const mapStateToProps = (state) => ({
  loading: state.retroList.loading,
});

const mapDispatchToProps = {
  onAppear: reloadRetroList,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mapRouteToProps({}),
)(RetroListPage);
