import React from 'react';
import PropTypes from 'prop-types';
import useParameterlessCallback from '../../hooks/useParameterlessCallback';

const WrappedButton = ({
  onClick,
  disabled,
  hideIfDisabled,
  title,
  disabledTitle,
  children,
  ...props
}) => {
  const handleClick = useParameterlessCallback(onClick);
  const resolvedDisabled = disabled || !onClick;

  if (resolvedDisabled && hideIfDisabled) {
    return null;
  }

  let resolvedTitle = (resolvedDisabled ? disabledTitle : null);
  if (resolvedTitle === null) {
    resolvedTitle = title;
  }

  return (
    <button
      type="button"
      disabled={resolvedDisabled}
      title={resolvedTitle}
      onClick={handleClick}
      {...props}
    >
      { children }
    </button>
  );
};

WrappedButton.propTypes = {
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  hideIfDisabled: PropTypes.bool,
  title: PropTypes.string,
  disabledTitle: PropTypes.string,
  children: PropTypes.node,
};

WrappedButton.defaultProps = {
  onClick: null,
  disabled: false,
  hideIfDisabled: false,
  title: null,
  disabledTitle: null,
  children: null,
};

export default React.memo(WrappedButton);
