import React, { useCallback } from 'react';
import Header from '../common/Header';
import useRouter from '../../hooks/env/useRouter';
import { slugTracker } from '../../api/api';
import RetroForm from './RetroForm';
import './RetroCreatePage.less';

interface PropsT {
  defaultSlug?: string;
}

const RetroCreatePage = ({ defaultSlug }: PropsT): React.ReactElement => {
  const { history } = useRouter();
  const handleCreate = useCallback(({ id, slug }) => {
    slugTracker.set(slug, id);
    history.push(`/retros/${slug}`);
  }, [history]);

  return (
    <article className="page-retro-create">
      <Header
        documentTitle="New Retro - Refacto"
        title="New Retro"
        backLink={{ label: 'Home', action: '/' }}
        links={[
          { label: 'Import', action: '/create/import' },
          { label: 'My Retros', action: '/retros' },
        ]}
      />
      <RetroForm onCreate={handleCreate} defaultSlug={defaultSlug} />
    </article>
  );
};

export default React.memo(RetroCreatePage);
