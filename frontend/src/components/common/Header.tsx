import { memo } from 'react';
import { HeaderLinkItem, LinkPropsT } from './HeaderLinkItem';
import { Title } from '../../hooks/env/useTitle';
import './Header.css';

export type HeaderLinks = (LinkPropsT | null)[];

interface PropsT {
  documentTitle: string;
  title: string;
  backLink?: LinkPropsT | null;
  links?: HeaderLinks;
}

export const Header = memo(
  ({ documentTitle, title, backLink, links = [] }: PropsT) => (
    <header className="top-header">
      <Title title={documentTitle} />
      <h1>{title}</h1>
      {backLink && <HeaderLinkItem className="back" {...backLink} />}
      <div className="menu">
        {links
          .filter((o) => o !== null)
          .map((link) => (
            <HeaderLinkItem key={link.label} {...link} />
          ))}
      </div>
    </header>
  ),
);
