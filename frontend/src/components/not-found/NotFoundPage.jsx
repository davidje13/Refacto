import React from 'react';
import Header from '../common/Header';
import './NotFoundPage.less';

export const NotFoundPage = () => (
  <article className="page-not-found">
    <Header
      documentTitle="Not Found - Refacto"
      title="Not Found"
      backLink={{ label: 'Home', url: '/' }}
    />
    <p>Sorry, that page was not found.</p>
  </article>
);

// Cannot use React.memo here yet
// (see https://github.com/ReactTraining/react-router/issues/6471)

export default NotFoundPage;
