import React from 'react';
import { Link } from 'react-router-dom';
import Header, { HeaderLinks } from '../common/Header';
import LoginForm from '../login/LoginForm';
import useUserToken from '../../hooks/data/useUserToken';
import './WelcomePage.less';

const WelcomePage = (): React.ReactElement => {
  const [userToken] = useUserToken();

  let createLink: React.ReactNode;
  let links: HeaderLinks;

  if (userToken) {
    createLink = (
      <p>
        <Link className="link-create" to="/create">Create new retro</Link>
      </p>
    );
    links = [{ label: 'My Retros', action: '/retros' }];
  } else {
    createLink = (
      <LoginForm message="Sign in to create a new retro" redirect="/create" />
    );
    links = [];
  }

  return (
    <article className="page-welcome">
      <Header
        documentTitle="Refacto"
        title="Refacto"
        links={links}
      />
      { createLink }
    </article>
  );
};

export default React.memo(WelcomePage);