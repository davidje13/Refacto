import { useEffect, useRef, useState } from 'react';
import { useIsAfter } from 'react-hook-final-countdown';
import type { RetroItem } from '../../../../shared/api-entities';
import './ActionToast.css';

interface PropsT {
  group: string | undefined;
  items: RetroItem[];
}

const DISPLAY_TIME = 10000;
const MAX_ITEMS = 3;

export const ActionToast = ({ group, items }: PropsT) => {
  const state = useRef<State | null>(null);
  const [notifications, setNotifications] = useState<Note[]>([]);
  const nextExpiry = Math.min(...notifications.map((item) => item.expiry));
  const expired = useIsAfter(nextExpiry) ? nextExpiry : 0;

  useEffect(() => {
    if (expired) {
      setNotifications((current) =>
        current.filter((note) => note.expiry > expired),
      );
    }
  }, [expired]);

  useEffect(() => {
    const seen = state.current?.seen ?? new Set();
    const newNotes: Note[] = [];
    const expiry = Date.now() + DISPLAY_TIME;
    for (const item of items) {
      if (item.category === 'action' && !seen.has(item.id)) {
        seen.add(item.id);
        if (!group || !item.group || item.group === group) {
          newNotes.push({ id: item.id, message: item.message, expiry });
        }
      }
    }
    if (!state.current) {
      state.current = { seen };
    } else if (newNotes.length) {
      setNotifications((current) => {
        const updated = [...current, ...newNotes];
        if (updated.length > MAX_ITEMS) {
          updated.splice(0, updated.length - MAX_ITEMS);
        }
        return updated;
      });
    }
  }, [group, items]);

  return (
    <section className="action-toast" role="status" aria-live="polite">
      <ul>
        {notifications.map((note) => {
          const latest = items.find((item) => item.id === note.id);
          return (
            <li key={note.id}>
              Action item:{' '}
              <bdi>{latest ? latest.message : <del>{note.message}</del>}</bdi>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

interface State {
  seen: Set<string>;
}

interface Note {
  id: string;
  message: string;
  expiry: number;
}
