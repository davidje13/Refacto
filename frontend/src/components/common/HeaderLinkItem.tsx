import { memo, type HTMLAttributes } from 'react';
import { Link } from 'wouter';

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
      <button type="button" onClick={action} {...props}>
        {label}
      </button>
    );
  },
);
