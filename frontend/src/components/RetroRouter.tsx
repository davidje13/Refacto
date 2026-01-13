import {
  type FC,
  useState,
  useLayoutEffect,
  useEffect,
  type ReactNode,
} from 'react';
import { Route, Switch, useLocation } from 'wouter';
import TickBold from '../../resources/tick-bold.svg';
import type { Retro, RetroAuth } from '../shared/api-entities';
import type { RetroDispatch } from '../api/RetroTracker';
import {
  retroAuthService,
  retroAuthTracker,
  retroTracker,
  slugTracker,
  userDataTracker,
} from '../api/api';
import { useSlug } from '../hooks/data/useSlug';
import { useEvent } from '../hooks/useEvent';
import { useRetroAuth } from '../hooks/data/useRetroAuth';
import { StateMapProvider } from '../hooks/useStateMap';
import { Popup } from './common/Popup';
import { RetroNotFoundPage } from './retro-not-found/RetroNotFoundPage';
import { PasswordPage } from './password/PasswordPage';
import { RetroPage } from './retro/RetroPage';
import { ArchiveListPage } from './archive-list/ArchiveListPage';
import { ArchivePage } from './archive/ArchivePage';
import { RetroSettingsPage } from './retro-settings/RetroSettingsPage';
import { PasswordForm } from './password/PasswordForm';
import { RedirectRoute } from './RedirectRoute';
import './RetroRouter.css';

interface PropsT {
  slug: string;
}

export const RetroRouter: FC<PropsT> = ({ slug }) => {
  const [retroId, slugError] = useSlug(slug);
  const [retro, retroDispatch, retroAuth, status] = useRetroReducer(retroId);

  if (slugError?.message === 'not found') {
    return <RetroNotFoundPage slug={slug} />;
  }

  if (slugError) {
    return <div className="loader error">{slugError.message}</div>;
  }

  if (retroId && !retroAuth) {
    return <PasswordPage slug={slug} retroId={retroId} />;
  }

  if (!retroId || !retro || !retroAuth) {
    return <div className="loader">Loading&hellip;</div>;
  }

  let overlay: ReactNode = null;
  switch (status) {
    case 'connected':
      overlay = (
        <div className="connectionMessage connected" aria-hidden>
          <TickBold role="presentation" /> Connected
        </div>
      );
      break;
    case 'reconnecting':
      overlay = (
        <div className="connectionMessage disconnected" role="status">
          Reconnecting&hellip;
        </div>
      );
      break;
    case 'reauthenticate':
      overlay = (
        <Popup title="Login expired" isOpen onClose={() => null}>
          <div className="popup-password">
            <p>
              Your login has expired or the retro password has been changed.
            </p>
            <p>Please enter the retro password to continue:</p>
            <PasswordForm slug={slug} retroId={retroId} />
          </div>
        </Popup>
      );
      break;
  }

  const retroParams = {
    retroToken: retroAuth.retroToken,
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
      {overlay}
    </StateMapProvider>
  );
};

export interface RetroPagePropsT {
  retroToken: string;
  retro: Retro;
  retroDispatch: RetroDispatch | null;
}

type RetroReducerStatus =
  | 'init'
  | 'connected'
  | 'reconnecting'
  | 'reauthenticate';

type RetroReducerState = [
  Retro | null,
  RetroDispatch | null,
  RetroAuth | null,
  RetroReducerStatus,
];

const RETRO_SLUG_PATH = /^\/retros\/([^/]+)($|\/.*)/;

function useRetroReducer(retroId: string | null): RetroReducerState {
  const retroAuth = useRetroAuth(retroId);
  const [location, setLocation] = useLocation();
  const [retroState, setRetroState] = useState<Retro | null>(null);
  const [status, setStatus] = useState<RetroReducerStatus>('init');
  const [retroDispatch, setRetroDispatch] = useState<RetroDispatch | null>(
    null,
  );

  // This cannot be useEffect; the websocket would be closed & reopened
  // when switching between pages within the retro
  useLayoutEffect(() => {
    const ac = new AbortController();
    setRetroState(null);
    setRetroDispatch(null);
    if (!retroId || !retroAuth) {
      return undefined;
    }

    const subscription = retroTracker.subscribe(
      retroId,
      retroAuth.retroToken,
      (data) => setRetroState(data),
      (status) => setStatus(status ? 'connected' : 'reconnecting'),
      () =>
        reauthenticateByUser(retroId, ac.signal).then((success) => {
          if (!success) {
            setStatus('reauthenticate');
          }
        }),
    );
    setRetroDispatch(() => subscription.dispatch);

    return () => {
      ac.abort();
      subscription.unsubscribe();
    };
  }, [retroId, retroAuth]);

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

  return [retroState, retroDispatch, retroAuth, status];
}

async function reauthenticateByUser(retroId: string, signal: AbortSignal) {
  const userData = userDataTracker.peekState()[0];
  if (!userData) {
    return false;
  }
  try {
    const retroAuth = await retroAuthService.getRetroAuthForUser(
      retroId,
      userData.userToken,
      signal,
    );
    retroAuthTracker.set(retroId, retroAuth);
    return true;
  } catch {
    return false;
  }
}
