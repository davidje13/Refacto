import React, { memo } from 'react';
import Header from '../common/Header';
import Loader from '../common/Loader';
import LoginForm from '../login/LoginForm';
import useUserToken from '../../hooks/data/useUserToken';
import useRetroList from '../../hooks/data/useRetroList';
import RetroList from './RetroList';
import './RetroListPage.less';

export default memo(() => {
  const [userToken] = useUserToken();
  const [retroList, error] = useRetroList(userToken);

  let content;

  if (userToken) {
    content = (
      <Loader
        error={error}
        Component={RetroList}
        componentProps={
          retroList
            ? {
                retros: retroList,
              }
            : null
        }
      />
    );
  } else {
    content = (
      <LoginForm message="Sign in to see your existing retros or create a new one" />
    );
  }

  return (
    <article className="page-retro-list">
      <Header
        documentTitle="My Retros - Refacto"
        title="My Retros"
        backLink={{ label: 'Home', action: '/' }}
        links={[
          { label: 'Import', action: '/create/import' },
          { label: 'Create Retro', action: '/create' },
        ]}
      />
      {content}
    </article>
  );
});
