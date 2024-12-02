import { memo } from 'react';
import './Footer.less';

export const Footer = memo(() => (
  <footer className="page-footer">
    {'Refacto (source on '}
    <a
      href="https://github.com/davidje13/Refacto"
      target="_blank"
      rel="noopener noreferrer"
    >
      GitHub
    </a>
    {', '}
    <a
      href="https://gitlab.com/davidje13/refacto"
      target="_blank"
      rel="noopener noreferrer"
    >
      GitLab
    </a>
    {') - '}
    <a href="/security" target="_blank" rel="noopener noreferrer">
      Privacy &amp; Security information
    </a>
  </footer>
));
