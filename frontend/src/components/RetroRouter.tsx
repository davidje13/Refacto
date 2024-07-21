import {
  type FC,
  useState,
  useLayoutEffect,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import { Route, Switch, useLocation, LocationHook } from 'wouter';
import { type Retro } from '../shared/api-entities';
import {
  type RetroState,
  type RetroDispatch,
  type RetroError,
} from '../api/RetroTracker';
import { retroTracker, slugTracker } from '../api/api';
import { useNonce } from '../hooks/useNonce';
import { RetroCreatePage } from './retro-create/RetroCreatePage';
import { PasswordPage } from './password/PasswordPage';
import { RetroPage } from './retro/RetroPage';
import { ArchiveListPage } from './archive-list/ArchiveListPage';
import { ArchivePage } from './archive/ArchivePage';
import { RetroSettingsPage } from './retro-settings/RetroSettingsPage';
import { useSlug } from '../hooks/data/useSlug';
import { useRetroToken } from '../hooks/data/useRetroToken';
import { StateMapProvider } from '../hooks/useStateMap';
import { RedirectRoute } from './RedirectRoute';

type RetroReducerState = [Retro | null, RetroDispatch | null, RetroError];

const RETRO_SLUG_PATH = /^\/retros\/([^/]+)($|\/)/;

type SetLocation = ReturnType<LocationHook>[1];

function replaceSlug(
  oldPath: string,
  setLocation: SetLocation,
  newSlug: string,
  retroId: string,
) {
  const oldSlug = RETRO_SLUG_PATH.exec(oldPath)?.[1];
  if (!oldSlug || oldSlug === newSlug) {
    return;
  }
  slugTracker.remove(oldSlug);
  slugTracker.set(newSlug, retroId);
  const oldPrefix = `/retros/${oldSlug}`;
  const newPrefix = `/retros/${newSlug}`;
  const newPath = newPrefix + oldPath.substring(oldPrefix.length);
  setLocation(newPath, { replace: true });
}

function useRetroReducer(
  retroId: string | null,
  retroToken: string | null,
): RetroReducerState {
  const [location, setLocation] = useLocation();
  const slugChangeDetectionRef = useRef<string>();
  const [retroState, setRetroState] = useState<RetroState | null>(null);
  const [retroDispatch, setRetroDispatch] = useState<RetroDispatch | null>(
    null,
  );
  const [error, setError] = useState<RetroError>(null);
  const nonce = useNonce();

  // This cannot be useEffect; the websocket would be closed & reopened
  // when switching between pages within the retro
  useLayoutEffect(() => {
    const myNonce = nonce.next();

    setRetroState(null);
    setRetroDispatch(null);
    setError(null);
    if (!retroId || !retroToken) {
      return undefined;
    }

    const subscription = retroTracker.subscribe(
      retroId,
      retroToken,
      (dispatch: RetroDispatch) =>
        nonce.check(myNonce) && setRetroDispatch(() => dispatch),
      (data: RetroState) => nonce.check(myNonce) && setRetroState(data),
      (err: RetroError) => nonce.check(myNonce) && setError(err),
    );
    return () => subscription.unsubscribe();
  }, [
    retroTracker,
    setRetroState,
    setRetroDispatch,
    setError,
    retroId,
    retroToken,
  ]);

  useEffect(() => {
    if (!retroId || !retroState || !retroState.retro) {
      return;
    }
    const { slug } = retroState.retro;
    if (slugChangeDetectionRef.current !== slug) {
      slugChangeDetectionRef.current = slug;
      replaceSlug(location, setLocation, slug, retroId);
    }
  }, [retroState, slugChangeDetectionRef, location, setLocation, replaceSlug]);

  return [retroState?.retro ?? null, retroDispatch, error];
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
  const [retroToken, retroTokenError] = useRetroToken(retroId);
  const [retro, retroDispatch, retroError] = useRetroReducer(
    retroId,
    retroToken,
  );

  if (slugError === 'not found') {
    return <RetroCreatePage defaultSlug={slug} />;
  }

  const error = slugError || retroTokenError || retroError;

  if (error) {
    return <div className="loader error">{error}</div>;
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

  return (
    <StateMapProvider scope={slug}>
      <Switch>
        <Route path="/retros/:slug">
          <RetroPage {...retroParams} />
        </Route>
        <Route path="/retros/:slug/groups/:group">
          {({ group }): ReactNode => (
            <RetroPage {...retroParams} group={group} />
          )}
        </Route>
        <Route path="/retros/:slug/archives">
          <ArchiveListPage {...retroParams} />
        </Route>
        <Route path="/retros/:slug/archives/:archiveId">
          {({ archiveId }): ReactNode => (
            <ArchivePage {...retroParams} archiveId={archiveId ?? ''} />
          )}
        </Route>
        <Route path="/retros/:slug/archives/:archiveId/groups/:group">
          {({ archiveId, group }): ReactNode => (
            <ArchivePage
              {...retroParams}
              archiveId={archiveId ?? ''}
              group={group}
            />
          )}
        </Route>
        <Route path="/retros/:slug/settings">
          <RetroSettingsPage {...retroParams} />
        </Route>

        <RedirectRoute path="/retros/:slug/:rest*" to="/retros/:slug" replace />
      </Switch>
    </StateMapProvider>
  );
};
