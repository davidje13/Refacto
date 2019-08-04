import { useState, useLayoutEffect } from 'react';
import { Retro } from 'refacto-entities';
import useNonce from '../useNonce';
import { retroTracker } from '../../api/api';
import { RetroState } from '../../api/RetroTracker';
import { RetroSpec } from '../../actions/retro';

type RetroDispatch = (spec: RetroSpec) => void;

export type RetroReducerState = [
  Retro | null,
  RetroDispatch | null,
  any,
];

export default function useRetroReducer(
  retroId: string | null,
  retroToken: string | null,
): RetroReducerState {
  const [retroState, setRetroState] = useState<RetroState | null>(null);
  const [retroDispatch, setRetroDispatch] = useState<RetroDispatch | null>(null);
  const [error, setError] = useState<any>(null);
  const nonce = useNonce();

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

  return [
    retroState ? retroState.retro : null, // TODO TypeScript#16
    retroDispatch,
    error,
  ];
}
