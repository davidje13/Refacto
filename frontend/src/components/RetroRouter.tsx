import type { FunctionComponent } from 'react';
import { Route, Switch } from 'wouter';
import type { Retro, RetroAuth } from '../shared/api-entities';
import type { RetroDispatch } from '../api/RetroTracker';
import {
  retroAuthService,
  retroAuthTracker,
  userDataTracker,
} from '../api/api';
import { useSlug } from '../hooks/data/useSlug';
import { useSlugURL } from '../hooks/useSlugURL';
import { LiveEventsProvider } from '../hooks/useLiveEvents';
import { useRetroAuth } from '../hooks/data/useRetroAuth';
import { useRetroReducer } from '../hooks/data/useRetroReducer';
import { StateMapProvider } from '../hooks/useStateMap';
import { RetroNotFoundPage } from './retro-not-found/RetroNotFoundPage';
import { PasswordPage } from './password/PasswordPage';
import { ConnectionOverlay } from './retro/ConnectionOverlay';
import { RetroPage } from './retro/RetroPage';
import { ArchiveListPage } from './archive-list/ArchiveListPage';
import { ArchivePage } from './archive/ArchivePage';
import { RetroSettingsPage } from './retro-settings/RetroSettingsPage';
import { RedirectRoute } from './RedirectRoute';

interface PropsT {
  slug: string;
}

export const RetroRouter: FunctionComponent<PropsT> = ({ slug }) => {
  const [retroId, slugError] = useSlug(slug);
  const retroAuth = useRetroAuth(retroId);
  const [retroState, retroDispatch, status] = useRetroReducer(
    retroId,
    retroAuth,
    reauthenticateByUser,
  );
  useSlugURL(retroState?.retro);

  if (slugError?.message === 'not found') {
    return <RetroNotFoundPage slug={slug} />;
  }

  if (slugError) {
    return <div className="loader error">{slugError.message}</div>;
  }

  if (!retroId) {
    return <div className="loader">Loading&hellip;</div>;
  }

  if (!retroAuth || (!retroState && status === 'reauthenticate')) {
    return <PasswordPage slug={slug} retroId={retroId} />;
  }

  if (!retroState) {
    return <div className="loader">Loading&hellip;</div>;
  }

  const retroParams = {
    retroAuth,
    retro: retroState.retro,
    retroDispatch,
  };

  return (
    <LiveEventsProvider dispatch={retroDispatch} events={retroState.events}>
      <StateMapProvider scope={retroId}>
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
              <ArchivePage
                {...retroParams}
                archiveId={archiveId}
                group={group}
              />
            )}
          </Route>
          <Route path="/retros/:slug/settings">
            <RetroSettingsPage {...retroParams} />
          </Route>

          <RedirectRoute
            path="/retros/:slug/:rest*"
            to="/retros/:slug"
            replace
          />
        </Switch>
        <ConnectionOverlay status={status} slug={slug} retroId={retroId} />
      </StateMapProvider>
    </LiveEventsProvider>
  );
};

export interface RetroPagePropsT {
  retroAuth: RetroAuth;
  retro: Retro;
  retroDispatch: RetroDispatch | null;
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
