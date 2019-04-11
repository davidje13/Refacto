import React from 'react';
import Header from '../common/Header';
import Loader from '../common/Loader';
import forbidExtraProps from '../../helpers/forbidExtraProps';
import useRetroList from '../../hooks/data/useRetroList';
import RetroList from './RetroList';
import './RetroListPage.less';

const RetroListPage = () => {
  const retroListState = useRetroList();

  const retroList = retroListState?.retros;

  return (
    <article className="page-retro-list">
      <Header
        documentTitle="Retros - Refacto"
        title="Retros"
        backLink={{ label: 'Home', url: '/' }}
        links={[{ label: 'Create Retro', url: '/create' }]}
      />
      <Loader
        loading={!retroList}
        Component={RetroList}
        retros={retroList}
      />
    </article>
  );
};

forbidExtraProps(RetroListPage);

export default React.memo(RetroListPage);
