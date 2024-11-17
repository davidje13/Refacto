import { memo } from 'react';
import { useLocation } from 'wouter';
import { Header } from '../common/Header';
import { useEvent } from '../../hooks/useEvent';
import { slugTracker } from '../../api/api';
import { RetroForm, CreationT } from './RetroForm';
import './RetroImportPage.less';

export const RetroImportPage = memo(() => {
  const [, setLocation] = useLocation();
  const handleCreate = useEvent(({ id, slug }: CreationT) => {
    slugTracker.set(slug, id);
    setLocation(`/retros/${encodeURIComponent(slug)}`);
  });

  return (
    <article className="page-retro-import">
      <Header
        documentTitle="Import Retro - Refacto"
        title="Import Retro"
        backLink={{ label: 'My Retros', action: '/' }}
        links={[{ label: 'Create', action: '/create' }]}
      />
      <RetroForm onCreate={handleCreate} showImport />
    </article>
  );
});
