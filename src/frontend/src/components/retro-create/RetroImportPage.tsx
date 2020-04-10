import React, { useCallback } from 'react';
import { useLocation } from 'wouter';
import Header from '../common/Header';
import { slugTracker } from '../../api/api';
import RetroForm from './RetroForm';
import './RetroImportPage.less';

const RetroImportPage = (): React.ReactElement => {
  const [, setLocation] = useLocation();
  const handleCreate = useCallback(({ id, slug }) => {
    slugTracker.set(slug, id);
    setLocation(`/retros/${slug}`);
  }, [setLocation]);

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
