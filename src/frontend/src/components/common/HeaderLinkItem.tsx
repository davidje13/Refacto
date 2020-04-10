import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'wouter';
import WrappedButton from './WrappedButton';

export interface LinkPropsT extends Omit<React.HTMLAttributes<HTMLElement>, 'onClick'> {
  label: string;
  action: string | (() => void);
}

const HeaderLinkItem = ({
  label,
  action,
  ...props
}: LinkPropsT): React.ReactElement => {
  if (typeof action === 'string') {
    return (<Link to={action} {...props}>{ label }</Link>);
  }

  return (<WrappedButton onClick={action} {...props}>{ label }</WrappedButton>);
};

export const propTypesLink = {
  label: PropTypes.string.isRequired,
  action: PropTypes.oneOfType([PropTypes.string, PropTypes.func]).isRequired,
};

HeaderLinkItem.propTypes = propTypesLink;

export default React.memo(HeaderLinkItem);
