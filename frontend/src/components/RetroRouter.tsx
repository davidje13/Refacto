import { type FC, useState, useLayoutEffect, useEffect } from 'react';
import { Route, Switch, useLocation } from 'wouter';
import { type Retro } from '../shared/api-entities';
import { type RetroDispatch } from '../api/RetroTracker';
import { retroTracker, slugTracker } from '../api/api';
import { RetroNotFoundPage } from './retro-not-found/RetroNotFoundPage';
import { PasswordPage } from './password/PasswordPage';
import { RetroPage } from './retro/RetroPage';
import { ArchiveListPage } from './archive-list/ArchiveListPage';
import { ArchivePage } from './archive/ArchivePage';
import { RetroSettingsPage } from './retro-settings/RetroSettingsPage';
import { useSlug } from '../hooks/data/useSlug';
import { useRetroToken } from '../hooks/data/useRetroToken';
import { StateMapProvider } from '../hooks/useStateMap';
import { RedirectRoute } from './RedirectRoute';
import { useEvent } from '../hooks/useEvent';
import TickBold from '../../resources/tick-bold.svg';
import './RetroRouter.less';

type RetroReducerState = [Retro | null, RetroDispatch | null, boolean];

const RETRO_SLUG_PATH = /^\/retros\/([^/]+)($|\/.*)/;

function useRetroReducer(
  retroId: string | null,
  retroToken: string | null,
): RetroReducerState {
  const [location, setLocation] = useLocation();
  const [retroState, setRetroState] = useState<Retro | null>(null);
  const [connected, setConnected] = useState(false);
  const [retroDispatch, setRetroDispatch] = useState<RetroDispatch | null>(
    null,
  );

  // This cannot be useEffect; the websocket would be closed & reopened
  // when switching between pages within the retro
  useLayoutEffect(() => {
    setRetroState(null);
    setRetroDispatch(null);
    if (!retroId || !retroToken) {
      return undefined;
    }

    const subscription = retroTracker.subscribe(
      retroId,
      retroToken,
      (data) => setRetroState(data),
      setConnected,
    );
    setRetroDispatch(() => subscription.dispatch);
    return () => subscription.unsubscribe();
  }, [retroId, retroToken]);

  const updateSlug = useEvent((slug: string) => {
    const old = RETRO_SLUG_PATH.exec(location);
    const oldSlug = decodeURIComponent(old?.[1] ?? '');
    if (!retroId || !oldSlug || oldSlug === slug) {
      return;
    }
    slugTracker.remove(oldSlug);
    slugTracker.set(slug, retroId);
    setLocation(`/retros/${encodeURIComponent(slug)}${old?.[2] ?? ''}`, {
      replace: true,
    });
  });

  const slug = retroState?.slug;
  useEffect(() => {
    if (slug) {
      updateSlug(slug);
    }
  }, [slug, updateSlug]);

  return [retroState, retroDispatch, connected];
}

interface PropsT {
  slug: string;
}

export interface RetroPagePropsT {
  retroToken: string;
  retro: Retro;
  retroDispatch: RetroDispatch | null;
}

export const RetroRouter: FC<PropsT> = ({ slug }) => {
  const [retroId, slugError] = useSlug(slug);
  const retroToken = useRetroToken(retroId);
  const [retro, retroDispatch, connected] = useRetroReducer(
    retroId,
    retroToken,
  );

  if (slugError?.message === 'not found') {
    return <RetroNotFoundPage slug={slug} />;
  }

  if (slugError) {
    return <div className="loader error">{slugError.message}</div>;
  }

  if (retroId && !retroToken) {
    return <PasswordPage slug={slug} retroId={retroId} />;
  }

  if (!retro || !retroToken) {
    return <div className="loader">Loading&hellip;</div>;
  }

  const retroParams = {
    retroToken,
    retro,
    retroDispatch,
  };

  const routes = (
    <StateMapProvider scope={slug}>
      <Switch>
        <Route path="/retros/:slug">
          <RetroPage {...retroParams} />
        </Route>
        <Route path="/retros/:slug/groups/:group">
          {({ group }) => <RetroPage {...retroParams} group={group} />}
        </Route>
        <Route path="/retros/:slug/archives">
          <ArchiveListPage {...retroParams} />
        </Route>
        <Route path="/retros/:slug/archives/:archiveId">
          {({ archiveId }) => (
            <ArchivePage {...retroParams} archiveId={archiveId} />
          )}
        </Route>
        <Route path="/retros/:slug/archives/:archiveId/groups/:group">
          {({ archiveId, group }) => (
            <ArchivePage {...retroParams} archiveId={archiveId} group={group} />
          )}
        </Route>
        <Route path="/retros/:slug/settings">
          <RetroSettingsPage {...retroParams} />
        </Route>

        <RedirectRoute path="/retros/:slug/:rest*" to="/retros/:slug" replace />
      </Switch>
    </StateMapProvider>
  );

  return (
    <>
      {routes}
      {connected ? (
        <div className="connectionMessage connected" aria-hidden>
          <TickBold /> Connected
        </div>
      ) : (
        <div className="connectionMessage disconnected" role="status">
          Reconnecting&hellip;
        </div>
      )}
    </>
  );
};
