import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';

export const WelcomePage = () => (
  <article className="page-welcome">
    <Helmet title="Refacto" />
    <h1>This is Refacto</h1>
    <p>Take a look at the <Link to="/retros/" className="link-retro-list">retros</Link></p>
  </article>
);

// Cannot use React.memo here yet
// (see https://github.com/ReactTraining/react-router/issues/6471)

export default WelcomePage;
