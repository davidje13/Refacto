import React from 'react';
import PropTypes from 'prop-types';
import nullable from 'prop-types-nullable';
import { Helmet } from 'react-helmet-async';
import HeaderLinkItem, { propTypesLink, LinkPropsT } from './HeaderLinkItem';
import forbidExtraProps from '../../helpers/forbidExtraProps';
import './Header.less';

export type HeaderLinks = (LinkPropsT | null)[];

interface PropsT {
  documentTitle: string;
  title: string;
  backLink: LinkPropsT | null;
  links: HeaderLinks;
}

function nonNull<T>(o: T | null): o is T {
  return Boolean(o);
}

const Header = ({
  documentTitle,
  title,
  backLink,
  links,
}: PropsT): React.ReactElement => (
  <header className="top-header">
    <Helmet title={documentTitle} />
    <h1>{ title }</h1>
    { backLink && (<HeaderLinkItem className="back" {...backLink} />) }
    <div className="menu">
      { links.filter(nonNull).map((link) => (
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
