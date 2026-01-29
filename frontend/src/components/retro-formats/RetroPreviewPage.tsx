import { memo, useEffect, useRef, useState } from 'react';
import { TimeProvider, type Scheduler } from 'react-hook-final-countdown';
import type { Retro, RetroItem } from '../../shared/api-entities';
import { useLocationHash } from '../../hooks/env/useLocationHash';
import { RetroFormatPicker } from './RetroFormatPicker';
import './RetroPreviewPage.css';

type State = Retro & { simulatedTime: number };

export const RetroPreviewPage = memo(() => {
  const hash = useLocationHash();
  const [state, setState] = useState<State>(() => readRetro(readHash(hash)));
  useEffect(() => setState(readRetro(readHash(hash))), [hash]);

  const scheduler = useScheduler(state.simulatedTime);

  return (
    <TimeProvider scheduler={scheduler}>
      <article className="page-retro-preview">
        <header className="top-header">
          <h1>{state.name}</h1>
        </header>
        <RetroFormatPicker
          className="retro-content"
          retroFormat={state.format}
          retroOptions={state.options}
          retroItems={state.items}
          retroState={state.state}
          dispatch={MOCK_DISPATCH}
          onComplete={undefined}
          archive={false}
          archiveTime={state.simulatedTime}
        />
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

const MOCK_DISPATCH = Object.assign(() => null, {
  sync: () => Promise.reject(),
});

const readHash = (hash: string) =>
  readRetro(JSON.parse(decodeURIComponent(hash.substring(1)) || '{}'));

const readRetro = (state: Partial<State>): State => {
  const full = {
    simulatedTime: Date.now(),
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
    ...state,
  };
  return {
    ...full,
    items: full.items.map((item: Partial<RetroItem>, i) => ({
      id: `i${i}`,
      category: '',
      created: full.simulatedTime + i,
      message: '',
      attachment: null,
      votes: 0,
      doneTime: 0,
      ...item,
    })),
  };
};
