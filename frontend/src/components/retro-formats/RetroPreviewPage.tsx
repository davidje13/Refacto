import { memo, useEffect, useRef, useState } from 'react';
import { TimeProvider, type Scheduler } from 'react-hook-final-countdown';
import type { Retro, RetroItem } from '../../shared/api-entities';
import { startViewTransition } from '../../helpers/viewTransition';
import { type Spec, context } from '../../api/reducer';
import { useLocationHash } from '../../hooks/env/useLocationHash';
import { usePageVisible } from '../../hooks/env/usePageVisible';
import { StaticStateMapProvider } from '../../hooks/useStateMap';
import { RetroFormat } from './RetroFormat';
import '../common/Header.css';
import './RetroPreviewPage.css';

export const RetroPreviewPage = memo(() => {
  const hash = useLocationHash();
  const [state, setState] = useState<State>(() => readRetroHash(hash));
  useEffect(() => setState(readRetroHash(hash)), [hash]);
  const pageVisible = usePageVisible(0.5);
  useAnimation(state, setState, pageVisible);

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
            retroId=""
            retroSlug=""
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

const useAnimation = (
  state: State,
  setState: (v: State) => void,
  playing: boolean,
) => {
  const pauseState = useRef<boolean | (() => void)>(false);
  useEffect(() => {
    const state = pauseState.current;
    if (playing) {
      pauseState.current = false;
      if (typeof state === 'function') {
        state();
      }
    } else if (!state) {
      pauseState.current = true;
    }
  }, [playing]);

  useEffect(() => {
    if (!state.frames.length) {
      return;
    }
    const frame = state.frames[state._frame];
    const advance = () => {
      if (pauseState.current) {
        pauseState.current = () => {
          tm = setTimeout(advance, 1000);
        };
        return;
      }
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
    };
    let tm = setTimeout(
      advance,
      frame ? (frame.delay ?? DEFAULT_FRAME_DELAY) : state.loopDelay,
    );
    return () => {
      if (pauseState.current) {
        pauseState.current = true;
      }
      clearTimeout(tm);
    };
  }, [state]);
};

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
      if (typeof v === 'string' && v.startsWith('...')) {
        const actualV = v.substring(3);
        let l = 0;
        if (typeof existing === 'string' && actualV.startsWith(existing)) {
          l = existing.length;
        }
        l += steps;
        if ((actualV.charCodeAt(l - 1) & ~0x03ff) === 0xd800) {
          ++l; // skip past surrogate pair
        }
        updated.set(k, actualV.substring(0, l));
        if (l < actualV.length) {
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

const readRetroHash = (hash: string) =>
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
    sessionId: 'example',
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
