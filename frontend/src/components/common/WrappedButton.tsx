import { ReactNode, HTMLAttributes } from 'react';

interface PropsT extends HTMLAttributes<HTMLElement> {
  onClick?: (() => void) | undefined;
  disabled?: boolean;
  hideIfDisabled?: boolean;
  title?: string | undefined;
  disabledTitle?: string | undefined;
  children?: ReactNode;
}

export const WrappedButton = ({
  onClick,
  disabled = false,
  hideIfDisabled = false,
  title,
  disabledTitle,
  children,
  ...props
}: PropsT) => {
  const resolvedDisabled = disabled || !onClick;

  if (resolvedDisabled && hideIfDisabled) {
    return null;
  }

  const resolvedTitle = resolvedDisabled ? (disabledTitle ?? title) : title;

  return (
    <button
      type="button"
      disabled={resolvedDisabled}
      title={resolvedTitle}
      onClick={() => onClick?.()}
      {...props}
    >
      {children}
    </button>
  );
};
