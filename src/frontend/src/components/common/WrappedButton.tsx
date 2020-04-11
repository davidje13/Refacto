import React from 'react';
import useParameterlessCallback from '../../hooks/useParameterlessCallback';

interface PropsT extends React.HTMLAttributes<HTMLElement> {
  onClick?: () => void;
  disabled: boolean;
  hideIfDisabled: boolean;
  title?: string;
  disabledTitle?: string;
  children?: React.ReactNode;
}

const WrappedButton = ({
  onClick,
  disabled,
  hideIfDisabled,
  title,
  disabledTitle,
  children,
  ...props
}: PropsT): React.ReactElement | null => {
  const handleClick = useParameterlessCallback(onClick);
  const resolvedDisabled = disabled || !onClick;

  if (resolvedDisabled && hideIfDisabled) {
    return null;
  }

  const resolvedTitle = (resolvedDisabled ? disabledTitle : null) ?? title;

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

WrappedButton.defaultProps = {
  onClick: null,
  disabled: false,
  hideIfDisabled: false,
  title: null,
  disabledTitle: null,
  children: null,
};

export default React.memo(WrappedButton);
