import { memo, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'wouter';
import { Header } from '../common/Header';
import { LoadingError, LoadingIndicator } from '../common/Loader';
import type { RetroSummary } from '../../shared/api-entities';
import { useRetroList } from '../../hooks/data/useRetroList';
import { useUserData } from '../../hooks/data/useUserData';
import { useEvent } from '../../hooks/useEvent';
import { LoginForm } from '../login/LoginForm';
import { RetroList } from './RetroList';
import { RetroNavigationForm } from './RetroNavigationForm';
import './WelcomePage.css';

export const WelcomePage = memo(() => {
  const [, setLocation] = useLocation();
  const userData = useUserData();
  const [retroList, error] = useRetroList(userData);
  const loading = Boolean(userData && !error && !retroList);
  const recent: RetroSummary[] = [];

  const stableSetLocation = useEvent(setLocation);
  useEffect(() => {
    if (!userData || !retroList) {
      return;
    }
    if (document.location.hash === '#first') {
      if (retroList.length > 0) {
        stableSetLocation('/', { replace: true });
      } else {
        stableSetLocation('/create', { replace: true });
      }
    }
  }, [stableSetLocation, userData, retroList]);

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
        documentTitle={userData ? 'Account - Refacto' : 'Refacto'}
        title={userData ? 'Account' : 'Refacto'}
      />
      <section>
        <img src="/favicon512.png" className="logo" alt="Refacto" />
        {userData ? null : (
          <>
            <p>
              Refacto makes it easy to run team retros with remote team members.
            </p>
            <p>
              Not familiar with retros?{' '}
              <Link to="/guidance">Learn more here</Link>.
            </p>
          </>
        )}
      </section>
      {loading ? (
        <LoadingIndicator />
      ) : (
        <section>
          {userData ? <p>Open a retro</p> : <p>Open an existing retro</p>}
          <RetroList retros={combinedList} />
          <RetroNavigationForm />
          {userData ? (
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
