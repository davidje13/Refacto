import React from 'react';
import { Helmet } from 'react-helmet';

export const NotFoundPage = () => (
  <article className="page-not-found">
    <Helmet title="Not Found - Refacto" />
    <h1>Not Found</h1>
  </article>
);

// Cannot use React.memo here yet
// (see https://github.com/ReactTraining/react-router/issues/6471)

export default NotFoundPage;
