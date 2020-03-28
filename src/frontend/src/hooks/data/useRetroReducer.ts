import {
  useState,
  useLayoutEffect,
  useEffect,
  useRef,
} from 'react';
import type { RouteComponentProps } from 'react-router-dom';
import type { Retro } from 'refacto-entities';
import useNonce from '../useNonce';
import useRouter from '../env/useRouter';
import { retroTracker, slugTracker } from '../../api/api';
import type { RetroState, RetroDispatch } from '../../api/RetroTracker';

export type RetroReducerState = [
  Retro | null,
  RetroDispatch | null,
  any,
];

const RETRO_SLUG_PATH = /^\/retros\/([^/]+)($|\/)/;

function replaceSlug(
  history: RouteComponentProps['history'],
  newSlug: string,
  retroId: string,
): void {
  const oldPath = history.location.pathname;
  const match = RETRO_SLUG_PATH.exec(oldPath);
  if (!match) {
    return;
  }
  const oldSlug = match[1];
  if (oldSlug === newSlug) {
    return;
  }
  slugTracker.remove(oldSlug);
  slugTracker.set(newSlug, retroId);
  const oldPrefix = `/retros/${oldSlug}`;
  const newPrefix = `/retros/${newSlug}`;
  const newPath = newPrefix + oldPath.substr(oldPrefix.length);
  history.replace(newPath, history.location.state);
}

export default function useRetroReducer(
  retroId: string | null,
  retroToken: string | null,
): RetroReducerState {
  const { history } = useRouter();
  const slugChangeDetectionRef = useRef<string>();
  const [retroState, setRetroState] = useState<RetroState | null>(null);
  const [retroDispatch, setRetroDispatch] = useState<RetroDispatch | null>(null);
  const [error, setError] = useState<any>(null);
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
      (dispatch: RetroDispatch) => nonce.check(myNonce) && setRetroDispatch(() => dispatch),
      (data: RetroState) => nonce.check(myNonce) && setRetroState(data),
      (err: any) => nonce.check(myNonce) && setError(err),
    );
    return (): void => subscription.unsubscribe();
  }, [retroTracker, setRetroState, setRetroDispatch, setError, retroId, retroToken]);

  useEffect(() => {
    if (!retroId || !retroState || !retroState.retro) {
      return;
    }
    const { slug } = retroState.retro;
    if (slugChangeDetectionRef.current !== slug) {
      slugChangeDetectionRef.current = slug;
      replaceSlug(history, slug, retroId);
    }
  }, [retroState, slugChangeDetectionRef, history, replaceSlug]);

  return [
    retroState?.retro ?? null,
    retroDispatch,
    error,
  ];
}
