import { memo, useEffect, useRef, useState } from 'react';
import { TimeProvider, type Scheduler } from 'react-hook-final-countdown';
import type { Retro, RetroItem } from '../../shared/api-entities';
import { startViewTransition } from '../../helpers/viewTransition';
import { type Spec, context } from '../../api/reducer';
import { useLocationHash } from '../../hooks/env/useLocationHash';
import { StaticStateMapProvider } from '../../hooks/useStateMap';
import { RetroFormat } from './RetroFormat';
import '../common/Header.css';
import './RetroPreviewPage.css';

export const RetroPreviewPage = memo(() => {
  const hash = useLocationHash();
  const [state, setState] = useState<State>(() => readRetro(readHash(hash)));
  useEffect(() => setState(readRetro(readHash(hash))), [hash]);
  useAnimation(state, setState);

  const scheduler = useScheduler(state.simulatedTime);
  const stateMap = useAnimatedLocalState(state.localState);

  return (
    <TimeProvider scheduler={scheduler}>
      <article className="page-retro-preview">
        <header className="top-header">
          <h1>{state.name}</h1>
        </header>
        <StaticStateMapProvider data={stateMap}>
          <RetroFormat
            className="retro-content"
            retroFormat={state.format}
            retroOptions={state.options}
            retroItems={state.items}
            retroState={state.state}
            retroHistory={state.history}
            dispatch={MOCK_DISPATCH}
            archive={false}
            archiveTime={state.simulatedTime}
          />
        </StaticStateMapProvider>
      </article>
    </TimeProvider>
  );
});

const useScheduler = (time: number) => {
  const timeRef = useRef<{
    value: number;
    pending: Set<{ fn: (now: number) => void; target: number }>;
  }>({ value: time, pending: new Set() });

  const [scheduler] = useState<Scheduler>(() => ({
    getTime: () => timeRef.current.value,
    schedule: (fn, target) => {
      if (!target) {
        return () => null;
      }
      const o = { fn, target };
      timeRef.current.pending.add(o);
      return () => timeRef.current.pending.delete(o);
    },
  }));

  useEffect(() => {
    for (const o of timeRef.current.pending) {
      if (time >= o.target) {
        timeRef.current.pending.delete(o);
        o.fn(time);
      }
    }
  }, [time]);

  return scheduler;
};

const useAnimation = (state: State, setState: (v: State) => void) =>
  useEffect(() => {
    if (!state.frames.length) {
      return;
    }
    const frame = state.frames[state._frame];
    const tm = setTimeout(
      () => {
        if (frame) {
          startViewTransition(frame.animation, () =>
            setState({
              ...context.update(state, frame.spec),
              _frame: state._frame + 1,
              _time: Date.now(),
            }),
          );
        } else {
          setState({ ...state, ...state._reset, _time: Date.now() });
        }
      },
      frame ? (frame.delay ?? DEFAULT_FRAME_DELAY) : state.loopDelay,
    );
    return () => clearTimeout(tm);
  }, [state]);

const useAnimatedLocalState = (target: Record<string, unknown>) => {
  const [state, setState] = useState(() => new Map(Object.entries(target)));

  useEffect(() => {
    const cont = { v: true };
    setState(updateAnimatedState(target, 0, cont));
    if (!cont.v) {
      return;
    }
    const i = setInterval(() => {
      setState(updateAnimatedState(target, 1, cont));
      if (!cont.v) {
        clearInterval(i);
      }
    }, 50);
    return () => clearInterval(i);
  }, [target]);

  return state;
};

const updateAnimatedState =
  (target: Record<string, unknown>, steps: number, cont: { v: boolean }) =>
  (cur: Map<string, unknown>) => {
    const updated = new Map<string, unknown>();
    cont.v = false;
    for (const [k, v] of Object.entries(target)) {
      const existing = cur.get(k);
      if (
        v !== existing &&
        typeof v === 'string' &&
        (existing === undefined ||
          (typeof existing === 'string' && v.startsWith(existing)))
      ) {
        let l = (existing ?? '').length + steps;
        if ((v.charCodeAt(l - 1) & ~0x03ff) === 0xd800) {
          ++l; // skip past surrogate pair
        }
        updated.set(k, v.substring(0, l));
        if (l < v.length) {
          cont.v = true;
        }
      } else {
        updated.set(k, v);
      }
    }
    return updated;
  };

const MOCK_DISPATCH = Object.assign(() => null, {
  sync: () => Promise.reject(),
});

const readHash = (hash: string) =>
  readRetro(JSON.parse(decodeURIComponent(hash.substring(1)) || '{}'));

interface State extends Retro {
  simulatedTime: number;
  localState: Record<string, unknown>;
  frames: { delay?: number; spec: Spec<State>; animation?: string }[];
  loopDelay: number;

  // internal state
  _time: number;
  _frame: number;
  _reset: Partial<State>;
}

const readRetro = (state: Partial<State>): State => {
  const now = Date.now();
  const full: State = {
    simulatedTime: now,
    ownerId: 'example',
    id: 'example',
    slug: 'example',
    name: 'Example Retro',
    format: '',
    state: {},
    groupStates: {},
    scheduledDelete: 0,
    options: {},
    items: [],
    history: [],
    localState: {},
    frames: [],
    loopDelay: 10000,
    ...state,
    _time: now,
    _frame: 0,
    _reset: {},
  };
  full.items = full.items.map((item: Partial<RetroItem>, i) => ({
    id: `i${i}`,
    category: '',
    created: full.simulatedTime + i,
    message: '',
    attachment: null,
    votes: 0,
    doneTime: 0,
    ...item,
  }));
  full._reset = { ...full };
  delete full._reset._reset;
  delete full._reset._time;
  return full;
};

const DEFAULT_FRAME_DELAY = 500;
