import { memo, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'wouter';
import { Header } from '../common/Header';
import { LoadingError, LoadingIndicator } from '../common/Loader';
import type { RetroSummary } from '../../shared/api-entities';
import { useRetroList } from '../../hooks/data/useRetroList';
import { useUserToken } from '../../hooks/data/useUserToken';
import { useEvent } from '../../hooks/useEvent';
import { LoginForm } from '../login/LoginForm';
import { RetroList } from './RetroList';
import { RetroNavigationForm } from './RetroNavigationForm';
import './WelcomePage.css';

export const WelcomePage = memo(() => {
  const [, setLocation] = useLocation();
  const userToken = useUserToken();
  const [retroList, error] = useRetroList(userToken);
  const loading = Boolean(userToken && !error && !retroList);
  const recent: RetroSummary[] = [];

  const stableSetLocation = useEvent(setLocation);
  useEffect(() => {
    if (!userToken || !retroList) {
      return;
    }
    if (document.location.hash === '#first') {
      if (retroList.length > 0) {
        stableSetLocation('/', { replace: true });
      } else {
        stableSetLocation('/create', { replace: true });
      }
    }
  }, [stableSetLocation, userToken, retroList]);

  const combinedList = useMemo(() => {
    const combined = [...recent];
    for (const retro of retroList ?? []) {
      const p = combined.findIndex((r) => r.id === retro.id);
      if (p === -1) {
        combined.push(retro);
      } else {
        combined[p] = retro;
      }
    }
    return combined;
  }, [recent, retroList]);

  return (
    <article className="page-welcome">
      <Header
        documentTitle={userToken ? 'Account - Refacto' : 'Refacto'}
        title={userToken ? 'Account' : 'Refacto'}
      />
      <section>
        <img src="/favicon512.png" className="logo" alt="Refacto" />
        {userToken ? null : (
          <p>
            Refacto makes it easy to run team retros with remote team members.
          </p>
        )}
      </section>
      {loading ? (
        <LoadingIndicator />
      ) : (
        <section>
          {userToken ? <p>Open a retro</p> : <p>Open an existing retro</p>}
          <RetroList retros={combinedList} />
          <RetroNavigationForm />
          {userToken ? (
            <Link className="global-button primary link-create" to="/create">
              Create a new retro
            </Link>
          ) : (
            <LoginForm
              message="Or register an account to create a new retro"
              redirect="/#first"
            />
          )}
        </section>
      )}
      {error ? <LoadingError error={error} /> : null}
    </article>
  );
});
