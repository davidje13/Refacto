import React from 'react';
import PropTypes from 'prop-types';
import nullable from 'prop-types-nullable';
import { Helmet } from 'react-helmet-async';
import HeaderLinkItem, { propTypesLink } from './HeaderLinkItem';
import forbidExtraProps from '../../helpers/forbidExtraProps';
import './Header.less';

const Header = ({
  documentTitle,
  title,
  backLink,
  links,
}) => (
  <header className="top-header">
    <Helmet title={documentTitle} />
    <h1>{ title }</h1>
    { backLink && (<HeaderLinkItem className="back" {...backLink} />) }
    <div className="menu">
      { links.filter((link) => link).map((link) => (
        <HeaderLinkItem key={link.label} {...link} />
      )) }
    </div>
  </header>
);

const shapeLink = PropTypes.shape(propTypesLink);

Header.propTypes = {
  documentTitle: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  backLink: shapeLink,
  links: PropTypes.arrayOf(nullable(shapeLink)),
};

forbidExtraProps(Header);

Header.defaultProps = {
  backLink: null,
  links: [],
};

export default React.memo(Header);
