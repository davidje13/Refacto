import React from 'react';
import Header from '../common/Header';
import './NotFoundPage.less';

const NotFoundPage = () => (
  <article className="page-not-found">
    <Header
      documentTitle="Not Found - Refacto"
      title="Not Found"
      backLink={{ label: 'Home', action: '/' }}
    />
    <p>Sorry, that page was not found.</p>
  </article>
);

export default React.memo(NotFoundPage);
