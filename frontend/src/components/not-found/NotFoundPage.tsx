import { memo } from 'react';
import { Header } from '../common/Header';

export const NotFoundPage = memo(() => (
  <article className="page-not-found short-page">
    <Header
      documentTitle="Not Found - Refacto"
      title="Not Found"
      backLink={{ label: 'Home', action: '/' }}
    />
    <p>Sorry, that page was not found.</p>
  </article>
));
