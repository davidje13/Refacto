import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet-async';
import { Link } from 'react-router-dom';
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
    { backLink && (
      <Link className="back" to={backLink.url}>{ backLink.label }</Link>
    ) }
    { links.map(({ url, label }) => (
      <Link key={url} to={url}>{ label }</Link>
    )) }
  </header>
);

const shapeLink = PropTypes.shape(forbidExtraProps({
  label: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
}));

Header.propTypes = {
  documentTitle: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  backLink: shapeLink,
  links: PropTypes.arrayOf(shapeLink),
};

forbidExtraProps(Header);

Header.defaultProps = {
  backLink: null,
  links: [],
};

export default React.memo(Header);
