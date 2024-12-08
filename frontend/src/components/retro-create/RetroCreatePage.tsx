import { memo } from 'react';
import { useLocation } from 'wouter';
import { Header } from '../common/Header';
import { useEvent } from '../../hooks/useEvent';
import { slugTracker } from '../../api/api';
import { useUserToken } from '../../hooks/data/useUserToken';
import { LoginForm } from '../login/LoginForm';
import { RetroForm, CreationT } from './RetroForm';

interface PropsT {
  showImport?: boolean;
}

export const RetroCreatePage = memo(({ showImport = false }: PropsT) => {
  const userToken = useUserToken();
  const [, setLocation] = useLocation();
  const handleCreate = useEvent(({ id, slug }: CreationT) => {
    slugTracker.set(slug, id);
    setLocation(`/retros/${encodeURIComponent(slug)}`);
  });

  const title = showImport ? 'Import Retro' : 'New Retro';

  if (!userToken) {
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
        userToken={userToken}
        onCreate={handleCreate}
        showImport={showImport}
      />
    </article>
  );
});
