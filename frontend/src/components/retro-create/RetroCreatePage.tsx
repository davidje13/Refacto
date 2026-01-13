import { memo } from 'react';
import { useLocation } from 'wouter';
import { Header } from '../common/Header';
import { useEvent } from '../../hooks/useEvent';
import { slugTracker } from '../../api/api';
import { useUserData } from '../../hooks/data/useUserData';
import { LoginForm } from '../login/LoginForm';
import { RetroForm, type CreationT } from './RetroForm';

interface PropsT {
  showImport?: boolean;
}

export const RetroCreatePage = memo(({ showImport = false }: PropsT) => {
  const userData = useUserData();
  const [, setLocation] = useLocation();
  const handleCreate = useEvent(({ id, slug }: CreationT) => {
    slugTracker.set(slug, id);
    setLocation(`/retros/${encodeURIComponent(slug)}`);
  });

  const title = showImport ? 'Import Retro' : 'New Retro';

  if (!userData) {
    return (
      <article className="page-retro-create">
        <Header
          documentTitle={`${title} - Refacto`}
          title={title}
          backLink={{ label: 'Home', action: '/' }}
        />
        <LoginForm message="Register an account to create a new retro" />
      </article>
    );
  }

  return (
    <article className="page-retro-create">
      <Header
        documentTitle={`${title} - Refacto`}
        title={title}
        backLink={{ label: 'Account', action: '/' }}
        links={
          showImport
            ? [{ label: 'Create', action: '/create' }]
            : [{ label: 'Import', action: '/create/import' }]
        }
      />
      <RetroForm
        userToken={userData.userToken}
        onCreate={handleCreate}
        showImport={showImport}
      />
    </article>
  );
});
