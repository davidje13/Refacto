import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';

export default () => (
  <article className="page-welcome">
    <Helmet>
      <title>Refacto</title>
    </Helmet>
    <h1>This is Refacto</h1>
    <p>Take a look at the <Link to="/retros/" className="link-retro-list">retros</Link></p>
  </article>
);
