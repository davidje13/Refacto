import React from 'react';
import Header from '../common/Header';
import Loader from '../common/Loader';
import LoginForm from '../login/LoginForm';
import forbidExtraProps from '../../helpers/forbidExtraProps';
import useUserToken from '../../hooks/data/useUserToken';
import useRetroList from '../../hooks/data/useRetroList';
import RetroList from './RetroList';
import './RetroListPage.less';

const RetroListPage = () => {
  const [userToken] = useUserToken();
  const [retroListState, error] = useRetroList(userToken);

  const retroList = retroListState?.retros;

  let content;

  if (userToken) {
    content = (
      <Loader
        error={error}
        loading={!retroList}
        Component={RetroList}
        retros={retroList}
      />
    );
  } else {
    content = (
      <LoginForm
        message="Sign in to see your existing retros or create new ones"
      />
    );
  }

  return (
    <article className="page-retro-list">
      <Header
        documentTitle="My Retros - Refacto"
        title="My Retros"
        backLink={{ label: 'Home', url: '/' }}
        links={[{ label: 'Create Retro', url: '/create' }]}
      />
      { content }
    </article>
  );
};

forbidExtraProps(RetroListPage);

export default React.memo(RetroListPage);
