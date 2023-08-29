import React, { memo } from 'react';
import useParameterlessCallback from '../../hooks/useParameterlessCallback';

interface PropsT extends React.HTMLAttributes<HTMLElement> {
  onClick?: (() => void) | undefined;
  disabled?: boolean;
  hideIfDisabled?: boolean;
  title?: string | undefined;
  disabledTitle?: string | undefined;
  children?: React.ReactNode;
}

export default memo(
  ({
    onClick,
    disabled = false,
    hideIfDisabled = false,
    title,
    disabledTitle,
    children,
    ...props
  }: PropsT) => {
    const handleClick = useParameterlessCallback(onClick);
    const resolvedDisabled = disabled || !onClick;

    if (resolvedDisabled && hideIfDisabled) {
      return null;
    }

    const resolvedTitle = resolvedDisabled ? disabledTitle ?? title : title;

    return (
      <button
        type="button"
        disabled={resolvedDisabled}
        title={resolvedTitle}
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    );
  },
);
