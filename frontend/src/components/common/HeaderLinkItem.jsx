import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import WrappedButton from './WrappedButton';

const HeaderLinkItem = ({ label, action, ...props }) => {
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
