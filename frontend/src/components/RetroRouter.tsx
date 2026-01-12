import {
  type FC,
  useState,
  useLayoutEffect,
  useEffect,
  type ReactNode,
} from 'react';
import { Route, Switch, useLocation } from 'wouter';
import TickBold from '../../resources/tick-bold.svg';
import type { Retro } from '../shared/api-entities';
import type { RetroDispatch } from '../api/RetroTracker';
import {
  retroTokenService,
  retroTokenTracker,
  retroTracker,
  slugTracker,
  userTokenTracker,
} from '../api/api';
import { useSlug } from '../hooks/data/useSlug';
import { useEvent } from '../hooks/useEvent';
import { useRetroToken } from '../hooks/data/useRetroToken';
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

type RetroReducerStatus =
  | 'init'
  | 'connected'
  | 'reconnecting'
  | 'reauthenticate';

type RetroReducerState = [
  Retro | null,
  RetroDispatch | null,
  string | null,
  RetroReducerStatus,
];

const RETRO_SLUG_PATH = /^\/retros\/([^/]+)($|\/.*)/;

function useRetroReducer(retroId: string | null): RetroReducerState {
  const retroToken = useRetroToken(retroId);
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
    if (!retroId || !retroToken) {
      return undefined;
    }

    const subscription = retroTracker.subscribe(
      retroId,
      retroToken,
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

  return [retroState, retroDispatch, retroToken, status];
}

interface PropsT {
  slug: string;
}

export interface RetroPagePropsT {
  retroToken: string;
  retro: Retro;
  retroDispatch: RetroDispatch | null;
}

async function reauthenticateByUser(retroId: string, signal: AbortSignal) {
  const userToken = userTokenTracker.peekState()[0];
  if (!userToken) {
    return false;
  }
  try {
    const retroToken = await retroTokenService.getRetroTokenForUser(
      retroId,
      userToken,
      signal,
    );
    retroTokenTracker.set(retroId, retroToken);
    return true;
  } catch {
    return false;
  }
}

export const RetroRouter: FC<PropsT> = ({ slug }) => {
  const [retroId, slugError] = useSlug(slug);
  const [retro, retroDispatch, retroToken, status] = useRetroReducer(retroId);

  if (slugError?.message === 'not found') {
    return <RetroNotFoundPage slug={slug} />;
  }

  if (slugError) {
    return <div className="loader error">{slugError.message}</div>;
  }

  if (retroId && !retroToken) {
    return <PasswordPage slug={slug} retroId={retroId} />;
  }

  if (!retroId || !retro || !retroToken) {
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
