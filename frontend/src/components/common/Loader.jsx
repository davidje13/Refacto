import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet-async';
import useExistenceCallbacks from '../../hooks/useExistenceCallbacks';

export const Loader = ({
  Component,
  loadingTitle,
  loadedTitle,
  title,
  loadingMessage,
  loading,
  onAppear,
  onDisappear,
  ...props
}) => {
  useExistenceCallbacks(onAppear, onDisappear);

  let resolvedTitle = (loading ? loadingTitle : loadedTitle);
  if (resolvedTitle === null) {
    resolvedTitle = title;
  }

  let helmet = null;
  if (resolvedTitle !== null) {
    helmet = (<Helmet title={resolvedTitle} />);
  }

  if (loading) {
    return (
      <div className="loader">
        { helmet }
        { loadingMessage }
      </div>
    );
  }

  return (
    <React.Fragment>
      { helmet }
      <Component {...props} />
    </React.Fragment>
  );
};

Loader.propTypes = {
  Component: PropTypes.elementType.isRequired,
  loadingTitle: PropTypes.string,
  loadedTitle: PropTypes.string,
  title: PropTypes.string,
  loadingMessage: PropTypes.node,
  loading: PropTypes.bool,
  onAppear: PropTypes.func,
  onDisappear: PropTypes.func,
};

Loader.defaultProps = {
  loadingTitle: null,
  loadedTitle: null,
  title: null,
  loadingMessage: 'Loading\u2026',
  loading: false,
  onAppear: () => {},
  onDisappear: () => {},
};

export default React.memo(Loader);
