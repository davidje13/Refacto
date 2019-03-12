import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet-async';
import { Link } from 'react-router-dom';
import './Header.less';

export const Header = ({
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

Header.propTypes = {
  documentTitle: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  backLink: PropTypes.shape({
    label: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
  }),
  links: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
  })),
};

Header.defaultProps = {
  backLink: null,
  links: [],
};

export default React.memo(Header);
