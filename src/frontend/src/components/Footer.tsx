import React, { memo } from 'react';
import './Footer.less';

export default memo(() => (
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
));
