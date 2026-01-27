import type { FunctionComponent } from 'react';
import useAwaited from 'react-hook-awaited';
import { retroAuthService } from '../api/api';
import { LiveEventsProvider } from '../hooks/useLiveEvents';
import { useRetroReducer } from '../hooks/data/useRetroReducer';
import { useLocationHash } from '../hooks/env/useLocationHash';
import { Header } from './common/Header';
import { LoadingIndicator } from './common/Loader';
import { ConnectionOverlay } from './retro/ConnectionOverlay';
import { RetroPage } from './retro/RetroPage';

interface PropsT {
  retroId: string;
}

export const WatchRetro: FunctionComponent<PropsT> = ({ retroId }) => {
  const hash = useLocationHash();
  const retroAuth = useAwaited(
    (signal) =>
      retroAuthService.getRetroAuthForApiKey(
        retroId,
        hash.substring(1),
        signal,
      ),
    [retroId, hash],
  );
  const [retroState, _, status] = useRetroReducer(
    retroId,
    retroAuth.latestData ?? null,
    retroAuth.forceRefresh,
  );

  if (retroAuth.state === 'rejected') {
    return (
      <article className="page-watch-auth-error short-page">
        <Header
          documentTitle="Incorrect URL - Refacto"
          title="Incorrect URL"
          backLink={{ label: 'Home', action: '/' }}
        />
        <p>Incorrect URL, or access to this retro has been revoked</p>
      </article>
    );
  }

  if (!retroAuth.latestData || !retroState) {
    return (
      <article className="page-retro-loading">
        <Header
          documentTitle="Refacto"
          title="Refacto"
          backLink={{ label: 'Home', action: '/' }}
        />
        <LoadingIndicator />
      </article>
    );
  }

  return (
    <LiveEventsProvider dispatch={null} events={retroState.events}>
      <RetroPage
        retroAuth={retroAuth.latestData}
        retro={retroState.retro}
        retroDispatch={null}
      />
      <ConnectionOverlay status={status} />
    </LiveEventsProvider>
  );
};
