import { memo } from 'react';
import { useLocation } from 'wouter';
import { Header } from '../common/Header';
import { useEvent } from '../../hooks/useEvent';
import { slugTracker } from '../../api/api';
import { RetroForm, CreationT } from './RetroForm';
import './RetroCreatePage.less';

interface PropsT {
  defaultSlug?: string;
}

export const RetroCreatePage = memo(({ defaultSlug }: PropsT) => {
  const [, setLocation] = useLocation();
  const handleCreate = useEvent(({ id, slug }: CreationT) => {
    slugTracker.set(slug, id);
    setLocation(`/retros/${slug}`);
  });

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
});
