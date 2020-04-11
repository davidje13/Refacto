import React from 'react';
import './Footer.less';

const Footer = (): React.ReactElement => (
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

export default React.memo(Footer);
