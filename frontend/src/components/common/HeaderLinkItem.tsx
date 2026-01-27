import { memo, type HTMLAttributes } from 'react';
import { Link } from 'wouter';
import { classNames } from '../../helpers/classNames';

export interface LinkPropsT extends Omit<
  HTMLAttributes<HTMLElement>,
  'onClick'
> {
  label: string;
  action: string | (() => void);
  disabled?: boolean;
}

export const HeaderLinkItem = memo(
  ({ label, action, disabled, ...props }: LinkPropsT) => {
    if (typeof action === 'string') {
      if (disabled) {
        return (
          <span
            {...props}
            className={classNames(props.className, 'disabled-link')}
          >
            {label}
          </span>
        );
      }
      return (
        <Link to={action} {...props}>
          {label}
        </Link>
      );
    }

    return (
      <button type="button" disabled={disabled} onClick={action} {...props}>
        {label}
      </button>
    );
  },
);
