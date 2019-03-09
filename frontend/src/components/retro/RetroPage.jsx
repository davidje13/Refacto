import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Loader from '../common/Loader';
import forbidExtraProps from '../../helpers/forbidExtraProps';
import mapRouteToProps from '../../helpers/mapRouteToProps';
import { setActiveRetro } from '../../reducers/activeRetro';
import Retro from './Retro';
import './RetroPage.less';

export class RetroPage extends React.Component {
  static propTypes = {
    loading: PropTypes.bool,
    slug: PropTypes.string.isRequired,
    onAppear: PropTypes.func.isRequired,
  };

  static defaultProps = {
    loading: false,
  };

  handleAppear = () => {
    const { onAppear, slug } = this.props;
    onAppear(slug);
  };

  render() {
    const { loading, slug } = this.props;
    return (
      <article className="page-retro">
        <Loader
          loading={loading}
          loadingTitle={`${slug} - Refacto`}
          Component={Retro}
          onAppear={this.handleAppear}
        />
      </article>
    );
  }
}

forbidExtraProps(RetroPage);

const mapStateToProps = (state) => ({
  loading: state.activeRetro.loading,
});

const mapDispatchToProps = {
  onAppear: setActiveRetro,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mapRouteToProps({ slug: 'slug' }),
)(RetroPage);
