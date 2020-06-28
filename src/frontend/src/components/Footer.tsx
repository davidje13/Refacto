import React, { memo } from 'react';
import './Footer.less';

export default memo(() => (
  <footer className="page-footer">
    Refacto (source on{ ' ' }
    <a
      href="https://github.com/davidje13/Refacto"
      target="_blank"
      rel="noopener noreferrer"
    >
      GitHub
    </a>,{ ' ' }
    <a
      href="https://gitlab.com/davidje13/refacto"
      target="_blank"
      rel="noopener noreferrer"
    >
      GitLab
    </a>
    )
  </footer>
));
