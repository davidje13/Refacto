import React, { memo } from 'react';
import { Link } from 'wouter';
import Header, { HeaderLinks } from '../common/Header';
import LoginForm from '../login/LoginForm';
import useUserToken from '../../hooks/data/useUserToken';
import './WelcomePage.less';

export default memo(() => {
  const [userToken] = useUserToken();

  let createLink: React.ReactNode;
  let links: HeaderLinks;

  if (userToken) {
    createLink = (
      <p className="create">
        <Link className="link-create" to="/create">
          Create a new retro
        </Link>
      </p>
    );
    links = [{ label: 'My Retros', action: '/retros' }];
  } else {
    createLink = (
      <LoginForm
        message="Register an account to create a new retro"
        redirect="/create"
      />
    );
    links = [];
  }

  return (
    <article className="page-welcome">
      <Header documentTitle="Refacto" title="Refacto" links={links} />
      <p>Refacto makes it easy to run team retros with remote team members.</p>
      {createLink}
      <p>
        <a
          className="link-security"
          href="/security"
          target="_blank"
          rel="noopener noreferrer"
        >
          Privacy &amp; Security information
        </a>
      </p>
    </article>
  );
});
