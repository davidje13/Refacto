import React from 'react';
import PropTypes from 'prop-types';
import './Loader.less';

export const Loader = ({
  Component,
  loadingMessage,
  loading,
  ...props
}) => {
  if (loading) {
    return (<div className="loader">{ loadingMessage }</div>);
  }

  return (<Component {...props} />);
};

Loader.propTypes = {
  Component: PropTypes.elementType.isRequired,
  loadingMessage: PropTypes.node,
  loading: PropTypes.bool,
};

Loader.defaultProps = {
  loadingMessage: 'Loading\u2026',
  loading: false,
};

export default React.memo(Loader);
