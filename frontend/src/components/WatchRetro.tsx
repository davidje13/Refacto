import type { FunctionComponent } from 'react';
import useAwaited from 'react-hook-awaited';
import { retroAuthService } from '../api/api';
import { LiveEventsProvider } from '../hooks/useLiveEvents';
import { useRetroReducer } from '../hooks/data/useRetroReducer';
import { useLocationHash } from '../hooks/env/useLocationHash';
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
      <div className="loader error">
        Incorrect URL, or access to this retro has been revoked
      </div>
    );
  }

  if (!retroAuth.latestData || !retroState) {
    return <div className="loader">Loading&hellip;</div>;
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
