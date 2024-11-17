import { memo } from 'react';
import { Header } from '../common/Header';
import { Loader } from '../common/Loader';
import { useRetroList } from '../../hooks/data/useRetroList';
import { RetroList } from './RetroList';
import './RetroListPage.less';

export const RetroListPage = memo(({ userToken }: { userToken: string }) => {
  const [retroList, error] = useRetroList(userToken);

  return (
    <article className="page-retro-list">
      <Header
        documentTitle="My Retros - Refacto"
        title="My Retros"
        links={[
          { label: 'Import', action: '/create/import' },
          { label: 'Create Retro', action: '/create' },
        ]}
      />
      <Loader
        error={error}
        Component={RetroList}
        componentProps={retroList ? { retros: retroList } : null}
      />
    </article>
  );
});
