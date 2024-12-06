import { memo } from 'react';
import { useLocation } from 'wouter';
import { slugTracker } from '../../api/api';
import { useEvent } from '../../hooks/useEvent';
import { useUserToken } from '../../hooks/data/useUserToken';
import { LoginForm } from '../login/LoginForm';
import { RetroForm, type CreationT } from '../retro-create/RetroForm';
import { Header } from '../common/Header';

interface PropsT {
  slug: string;
}

export const RetroNotFoundPage = memo(({ slug }: PropsT) => {
  const userToken = useUserToken();
  const [, setLocation] = useLocation();
  const handleCreate = useEvent(({ id, slug }: CreationT) => {
    slugTracker.set(slug, id);
    setLocation(`/retros/${encodeURIComponent(slug)}`);
  });

  if (!userToken) {
    return (
      <article className="page-retro-not-found">
        <Header documentTitle="New Retro - Refacto" title="New Retro" />
        <LoginForm message="Register an account to create a retro" />
      </article>
    );
  }

  return (
    <article className="page-retro-not-found">
      <Header
        documentTitle="New Retro - Refacto"
        title="New Retro"
        backLink={{ label: 'Account', action: '/' }}
      />
      <RetroForm
        userToken={userToken}
        onCreate={handleCreate}
        defaultSlug={slug}
      />
    </article>
  );
});
