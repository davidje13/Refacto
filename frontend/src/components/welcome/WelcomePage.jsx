import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../common/Header';
import './WelcomePage.less';

export const WelcomePage = () => (
  <article className="page-welcome">
    <Header
      documentTitle="Refacto"
      title="Refacto"
    />
    <p>Take a look at the <Link to="/retros/" className="link-retro-list">retros</Link></p>
  </article>
);

// Cannot use React.memo here yet
// (see https://github.com/ReactTraining/react-router/issues/6471)

export default WelcomePage;
