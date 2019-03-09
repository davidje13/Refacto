import React from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';

export class Loader extends React.PureComponent {
  static propTypes = {
    Component: PropTypes.elementType.isRequired,
    loadingTitle: PropTypes.string,
    loadingMessage: PropTypes.node,
    loading: PropTypes.bool,
    onAppear: PropTypes.func,
    onDisappear: PropTypes.func,
  };

  static defaultProps = {
    loadingTitle: null,
    loadingMessage: 'Loading\u2026',
    loading: false,
    onAppear: () => {},
    onDisappear: () => {},
  };

  componentDidMount() {
    const { onAppear } = this.props;
    onAppear();
  }

  componentWillUnmount() {
    const { onDisappear } = this.props;
    onDisappear();
  }

  render() {
    const {
      Component,
      loadingTitle,
      loadingMessage,
      loading,
      onAppear,
      onDisappear,
      ...props
    } = this.props;

    if (loading) {
      let helmet = null;
      if (loadingTitle !== null) {
        helmet = (<Helmet title={loadingTitle} />);
      }

      return (
        <div className="loader">
          { helmet }
          { loadingMessage }
        </div>
      );
    }

    return (<Component {...props} />);
  }
}

export default Loader;
