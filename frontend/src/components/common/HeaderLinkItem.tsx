import { memo, HTMLAttributes } from 'react';
import { Link } from 'wouter';
import { WrappedButton } from './WrappedButton';

export interface LinkPropsT
  extends Omit<HTMLAttributes<HTMLElement>, 'onClick'> {
  label: string;
  action: string | (() => void);
}

export const HeaderLinkItem = memo(
  ({ label, action, ...props }: LinkPropsT) => {
    if (typeof action === 'string') {
      return (
        <Link to={action} {...props}>
          {label}
        </Link>
      );
    }

    return (
      <WrappedButton onClick={action} {...props}>
        {label}
      </WrappedButton>
    );
  },
);
