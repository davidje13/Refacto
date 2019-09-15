import React, { useCallback } from 'react';
import Header from '../common/Header';
import useRouter from '../../hooks/env/useRouter';
import { slugTracker } from '../../api/api';
import RetroForm from './RetroForm';
import './RetroImportPage.less';

const RetroImportPage = (): React.ReactElement => {
  const { history } = useRouter();
  const handleCreate = useCallback(({ id, slug }) => {
    slugTracker.set(slug, id);
    history.push(`/retros/${slug}`);
  }, [history]);

  return (
    <article className="page-retro-import">
      <Header
        documentTitle="Import Retro - Refacto"
        title="Import Retro"
        backLink={{ label: 'Create', action: '/create' }}
        links={[
          { label: 'My Retros', action: '/retros' },
        ]}
      />
      <RetroForm onCreate={handleCreate} showImport />
    </article>
  );
};

export default React.memo(RetroImportPage);
