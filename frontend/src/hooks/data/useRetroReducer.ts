import { useState, useLayoutEffect } from 'react';
import useNonce from '../useNonce';
import { retroTracker } from '../../api/api';
import Retro from '../../data/Retro';
import { RetroSpec } from '../../actions/retro';

type RetroDispatch = (spec: RetroSpec) => void;

export type RetroReducerState = [
  Retro['retro'] | null,
  RetroDispatch | null,
  any,
];

export default function useRetroReducer(
  retroId: string | null,
  retroToken: string | null,
): RetroReducerState {
  const [retro, setRetro] = useState<Retro | null>(null);
  const [retroDispatch, setRetroDispatch] = useState<RetroDispatch | null>(null);
  const [error, setError] = useState<any>(null);
  const nonce = useNonce();

  useLayoutEffect(() => {
    const myNonce = nonce.next();

    setRetro(null);
    setRetroDispatch(null);
    setError(null);
    if (!retroId || !retroToken) {
      return undefined;
    }

    const subscription = retroTracker.subscribe(
      retroId,
      retroToken,
      (dispatch: RetroDispatch) => nonce.check(myNonce) && setRetroDispatch(() => dispatch),
      (data: Retro) => nonce.check(myNonce) && setRetro(data),
      (err: any) => nonce.check(myNonce) && setError(err),
    );
    return (): void => subscription.unsubscribe();
  }, [retroTracker, setRetro, setRetroDispatch, setError, retroId, retroToken]);

  return [
    retro ? retro.retro : null, // TODO TypeScript#16
    retroDispatch,
    error,
  ];
}
