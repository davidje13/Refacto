import React from 'react';
import forbidExtraProps from '../helpers/forbidExtraProps';
import './Footer.less';

export const Footer = () => (
  <footer className="page-footer">
    Refacto (
    <a
      href="https://github.com/davidje13/Refacto"
      target="_blank"
      rel="noopener noreferrer"
    >
      source on GitHub
    </a>
    )
  </footer>
);

forbidExtraProps(Footer);

export default Footer;
