import React from 'react';
import PropTypes from 'prop-types';
import './Loader.less';

const Loader = ({
  Component,
  loadingMessage,
  loading,
  error,
  ...props
}) => {
  if (error) {
    return (<div className="loader error">{ error }</div>);
  }

  if (loading) {
    return (<div className="loader">{ loadingMessage }</div>);
  }

  return (<Component {...props} />);
};

Loader.propTypes = {
  Component: PropTypes.elementType.isRequired,
  loadingMessage: PropTypes.node,
  loading: PropTypes.bool,
  error: PropTypes.string,
};

Loader.defaultProps = {
  loadingMessage: 'Loading\u2026',
  loading: false,
  error: null,
};

export default React.memo(Loader);
